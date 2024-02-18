// pendulum controllable pivot ML

const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");
canvas.style.width = window.innerWidth + "px";
canvas.style.height = window.innerHeight + "px";
canvas.width = 2 * window.innerWidth;
canvas.height = 2 * window.innerHeight;
ctx.translate(canvas.width / 2, canvas.height / 2);

let instances = [];
let scores = [];
const instanceCount = 300;
const instanceSaved = 10;
let maxScore = 0;
let topNN = null;

let resizeTimeout;
window.addEventListener("resize", (e) => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
    resizeTimeout = 0;
  }
  resizeTimeout = setTimeout(() => {
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    canvas.width = 2 * window.innerWidth;
    canvas.height = 2 * window.innerHeight;
    ctx.translate(canvas.width / 2, canvas.height / 2);
  }, 100);
});

const optionsDiv = document.createElement("div");
optionsDiv.classList.add("options-div");
document.body.appendChild(optionsDiv);

const stats = [
  {
    name: "max score",
    id: "max_score",
    precision: 0,
    get: () => {
      return maxScore;
    },
  },
];

const statsDiv = document.createElement("div");
statsDiv.classList.add("stats-div");
document.body.appendChild(statsDiv);
const statsDivs = [];

for (const st of stats) {
  const statDiv = document.createElement("div");
  statsDiv.appendChild(statDiv);
  const div = document.createElement("div");
  div.classList.add("stats-label");
  const visualDiv = document.createElement("div");
  visualDiv.classList.add("stats-visual");
  statDiv.appendChild(visualDiv);
  visualDiv.appendChild(div);
  statsDivs.push({ div: div, visual: visualDiv });
}

const sliders = [
  {
    name: "simulation speed",
    id: "simulation_speed",
    min: "1",
    max: "100",
    step: "1",
    default: "1",
    callback: (value) => {
      stepCount = value;
    },
  },
];

for (const sl of sliders) {
  const optionDiv = document.createElement("div");
  optionsDiv.appendChild(optionDiv);
  const sliderDiv = document.createElement("input");
  sliderDiv.id = sl.id;
  sliderDiv.classList.add("option-slider");
  sliderDiv.setAttribute("type", "range");
  sliderDiv.setAttribute("min", sl.min);
  sliderDiv.setAttribute("max", sl.max);
  sliderDiv.setAttribute("step", sl.step);
  sliderDiv.setAttribute("value", sl.default);
  optionDiv.appendChild(sliderDiv);
  const sliderLabel = document.createElement("label");
  sliderLabel.classList.add("slider-label");
  sliderLabel.setAttribute("for", sl.id);
  sliderLabel.innerText = sl.name + ": " + sl.default;
  sliderDiv.addEventListener("input", () => {
    sl.callback(parseFloat(sliderDiv.value));
    sliderLabel.innerText = sl.name + ": " + sliderDiv.value;
  });
  optionDiv.appendChild(sliderLabel);
}

const buttons = [
  //   {
  //     name: "stop velocity",
  //     run: () => {
  //       rk4.state[2] = 0;
  //       rk4.state[4] = 0;
  //       rk4.state[6] = 0;
  //       resetPath();
  //     },
  //   },
];

for (const b of buttons) {
  const buttonDiv = document.createElement("button");
  buttonDiv.addEventListener("click", b.run);
  buttonDiv.innerText = b.name;
  optionsDiv.appendChild(buttonDiv);
}

for (let i = 0; i < instanceCount; i++) {
  instances.push(
    new PendulumInstance(
      1,
      10,
      9.8,
      Math.PI / 2,
      Math.random() * 0.04 - 0.02,
      0,
      0
    )
  );
}

const randomPush = () => {
  for (const inst of instances) {
    inst.rk4.state[2] = Math.random() * 0.08 - 0.04;
  }
};

const getNNCanvasPosition = (nn, i, j) => {
  return {
    x: canvas.width / 2 - (nn.nodes.length - i) * 80,
    y: canvas.height / 2 - (1 - (j + 1 / 2) / nn.nodes[i]) * 200,
  };
};

const drawNN = (nn) => {
  if (nn) {
    ctx.lineWidth = 2;
    for (let i = 0; i < nn.weights.length; i++) {
      for (let j = 0; j < nn.weights[i].length; j++) {
        for (let k = 0; k < nn.weights[i][j].length; k++) {
          if (nn.weights[i][j][k] > 0)
            ctx.strokeStyle =
              "rgb(0, " + Math.round(nn.weights[i][j][k] * 255) + ", 0)";
          else
            ctx.strokeStyle =
              "rgb(" + Math.round(-nn.weights[i][j][k] * 255) + ", 0, 0)";

          const { x: x1, y: y1 } = getNNCanvasPosition(nn, i, j);
          const { x: x2, y: y2 } = getNNCanvasPosition(nn, i + 1, k);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.strokeStyle = "rgb(255, 255, 255)";
    for (let i = 0; i < nn.nodes.length; i++) {
      for (let j = 0; j < nn.nodes[i]; j++) {
        const { x, y } = getNNCanvasPosition(nn, i, j);
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
};

let stepCount = 1;
let pushCount = 0;

const updateStats = () => {
  for (let i = 0; i < stats.length; i++) {
    const val = stats[i].get();
    statsDivs[i].div.innerText =
      stats[i].name + ": " + val.toFixed(stats[i].precision);
    if (stats[i].max === undefined) {
      stats[i].max = val;
    } else {
      stats[i].max = Math.max(stats[i].max, val);
    }
    if (stats[i].min === undefined) {
      stats[i].min = 0;
    } else {
      stats[i].min = Math.min(stats[i].min, val);
    }
    const percent = (val - stats[i].min) / (stats[i].max - stats[i].min);
    statsDivs[i].visual.style.width = percent * 100 + "%";
  }
};

const loop = () => {
  clearCanvas();
  drawBoard();
  updateStats();
  drawNN(topNN);

  for (let i = 0; i < stepCount; i++) {
    dead = true;
    for (const inst of instances) {
      if (inst.dead) continue;
      dead = false;
      inst.step();
      inst.show();
      if (inst.dead) {
        saveScore(inst);
      }
    }
    if (dead) reset();

    pushCount++;
    if (pushCount == 500) {
      randomPush();
      pushCount = 0;
    }
  }
};

const saveScore = (inst) => {
  scores.push({
    score: inst.score + inst.rk4.state[0] / 10,
    instance: inst,
  });
};

const reset = () => {
  scores.sort((a, b) => b.score - a.score);

  console.log("MAX SCORE: ", scores[0].score);
  maxScore = Math.max(maxScore, scores[0].score);
  topNN = scores[0].instance.nn;
  console.log(JSON.stringify(scores[0].instance.nn));

  instances = [];
  for (let i = 0; i < instanceSaved; i++) {
    for (let j = 0; j < instanceCount / instanceSaved; j++) {
      instances.push(new PendulumInstance(scores[i].instance));
      instances[instances.length - 1].reset(
        1,
        10,
        9.8,
        Math.PI / 2,
        Math.random() * 0.04 - 0.02,
        0,
        Math.random() - 0.5
      );
      if (j > 0) instances[instances.length - 1].nn.mutate();
    }
  }
  scores = [];
};

const clearCanvas = () => {
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );
};

const drawBoard = () => {
  ctx.fillStyle = ctx.strokeStyle = "rgb(150, 150, 150)";
  ctx.beginPath();
  ctx.moveTo(-canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, 0);
  ctx.stroke();
};

setInterval(loop, 1);
