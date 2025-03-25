// simulation of ohm's law using electric fields and momentum loss on collision.
const board = document.getElementById("board");
let canvas, ctx, width, height;

const electronCount = 4000;
const electronRadius = 1;
let thermalVelocity = 100;
let acceleration = 100;
let electrons = [];

const atomRadius = 30;
const atomSpacingWidth = 100;
const atomSpacingHeight = 100;
let atomCountWidth, atomCountHeight;
let atoms = [];
let atomOffset = 0;

let currentBlocks = [];
let current = 0;
let currentTotal = 0;
let currentCounter = 0;
let currentTime = 0;
const currentMaxBlocks = 1000;
const currentPeriod = 10;

let timeTotal = 0;
let timeCounter = 0;

let path = [];

const optionsDiv = document.createElement("div");
optionsDiv.classList.add("options-div");
document.body.appendChild(optionsDiv);

const sliders = [
  {
    name: "simulation speed",
    id: "simulation_speed",
    min: "1",
    max: "100",
    step: "1",
    default: "1",
    callback: (value) => {
      skipDraw = value;
    },
  },
  {
    name: "acceleration",
    id: "acceleration",
    min: "1",
    max: "1000",
    step: "1",
    default: "100",
    callback: (value) => {
      acceleration = value;
      resetStats();
    },
  },
  {
    name: "thermal velocity",
    id: "thermal_velocity",
    min: "10",
    max: "1000",
    step: "1",
    default: "100",
    callback: (value) => {
      thermalVelocity = value;
      resetStats();
    },
  },
  {
    name: "atom offset",
    id: "atom_offset",
    min: "0",
    max: "100",
    step: "1",
    default: "0",
    callback: (value) => {
      atomOffset = value;
      createCanvas();
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

let paused = false;

const buttons = [
  {
    name: "(un)pause simulation (space)",
    run: () => {
      paused = !paused;
    },
  },
];

document.addEventListener("keypress", (e) => {
  if (e.key === " ") paused = !paused;
});

for (const b of buttons) {
  const buttonDiv = document.createElement("button");
  buttonDiv.addEventListener("click", b.run);
  buttonDiv.innerText = b.name;
  optionsDiv.appendChild(buttonDiv);
}

const stats = [
  {
    name: "current",
    id: "current",
    precision: 4,
    get: () => {
      return current;
    },
  },
  {
    name: "time per collision",
    id: "time",
    precision: 2,
    get: () => {
      return timeCounter == 0 ? 0 : timeTotal / timeCounter;
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

const createCanvas = () => {
  width = window.innerWidth;
  height = window.innerHeight;
  board.style = "height: " + height + "px";
  board.innerHTML =
    "<canvas id='canvas' width='" +
    width +
    "' height='" +
    height +
    "'></canvas>";
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.translate(width / 2, height / 2);

  electrons = [];
  for (let i = 0; i < electronCount; i++) {
    electrons[i] = {
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      vx: (Math.random() - 0.5) * thermalVelocity,
      vy: (Math.random() - 0.5) * thermalVelocity,
      time: 0,
      col: false,
    };
  }

  atomCountWidth = Math.floor(width / atomSpacingWidth);
  atomCountHeight = Math.floor(height / atomSpacingHeight);

  atoms = [];
  for (let i = 0; i < atomCountWidth; i++) {
    for (let j = 0; j < atomCountHeight; j++) {
      atoms[j + i * atomCountHeight] = {
        x: (i + 0.5) * atomSpacingWidth - width / 2,
        y:
          (j + 0.5) * atomSpacingHeight -
          height / 2 +
          (i % 2 == 0 ? atomOffset : 0),
        //   i % 2 == 0
        //     ? (j + 0.5) * atomSpacingHeight - height / 2
        //     : j * atomSpacingHeight - height / 2,
      };
    }
  }

  resetStats();
  draw();
};

window.addEventListener("resize", (e) => {
  createCanvas();
});

const resetStats = () => {
  path = [];

  current = 0;
  currentTime = 0;
  currentCounter = 0;
  currentBlocks = [];
  currentTotal = 0;

  timeCounter = 0;
  timeTotal = 0;
};

const main = () => {
  update();
  draw();
};

let step = 1 / 60,
  skipDraw = 1;

const draw = () => {
  ctx.strokeStyle = "none";
  ctx.fillStyle = "black";
  ctx.fillRect(-width / 2, -height / 2, width, height);

  ctx.fillStyle = "white";
  for (const e of electrons) {
    ctx.beginPath();
    if (e === electrons[0]) ctx.fillStyle = "green";
    else ctx.fillStyle = "white";
    ctx.arc(
      e.x,
      e.y,
      e == electrons[0] ? 2 * electronRadius : electronRadius,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }

  ctx.fillStyle = "rgba(200, 200, 200, 0.2)";
  for (const a of atoms) {
    ctx.beginPath();
    ctx.arc(a.x, a.y, atomRadius, 0, 2 * Math.PI);
    ctx.fill();
  }

  if (path.length) {
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    let resetPath = false;
    for (let i = 1; i < path.length; i++) {
      if (
        Math.abs(path[i].x - path[i - 1].x) > width / 2 ||
        Math.abs(path[i].y - path[i - 1].y) > height / 2
      ) {
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(path[i].x, path[i].y);
        resetPath = true;
      } else ctx.lineTo(path[i].x, path[i].y);
    }
    if (resetPath) path = [];
    ctx.stroke();
  }

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

const update = () => {
  if (paused) return;
  for (let i = 0; i < skipDraw; i++) {
    currentTime++;
    if (currentTime >= currentPeriod) {
      currentTotal += currentCounter;
      currentBlocks.push(currentCounter);
      if (currentBlocks.length > currentMaxBlocks) {
        currentTotal -= currentBlocks.shift();
      }
      //   console.log(
      //     (currentTotal / currentBlocks.length / currentPeriod).toFixed(4)
      //   );
      current = currentTotal / currentBlocks.length / currentPeriod;
      currentTime = 0;
      currentCounter = 0;
    }
    path.push({ x: electrons[0].x, y: electrons[0].y });
    for (const e of electrons) {
      e.time++;
      e.x += e.vx * step;
      e.y += e.vy * step;
      if (e.x > width / 2) {
        e.x = -width / 2;
        currentCounter++;
      } else if (e.x < -width / 2) {
        e.x = width / 2;
        currentCounter--;
      }
      if (e.y > height / 2) e.y = -height / 2;
      else if (e.y < -height / 2) e.y = height / 2;

      if (Math.random() > 0.99) {
        e.vx += ((Math.random() - 0.5) * thermalVelocity) / 10;
        e.vy += ((Math.random() - 0.5) * thermalVelocity) / 10;
      }

      e.vx += acceleration * step;

      let notCol = true;
      for (const a of atoms) {
        const dx = a.x - e.x,
          dy = a.y - e.y;
        const magSq = dx * dx + dy * dy;
        if (
          magSq <=
          (atomRadius + electronRadius) * (atomRadius + electronRadius)
        ) {
          notCol = false;
          if (!e.col) {
            const mag = Math.sqrt(magSq);
            //   e.vx = -(dx / mag) * thermalVelocity;
            //   e.vy = -(dy / mag) * thermalVelocity;
            e.vx = 2 * (Math.random() - 0.5) * thermalVelocity;
            e.vy = 2 * (Math.random() - 0.5) * thermalVelocity;
            e.col = true;
            //   e.x = -(dx / mag) * (atomRadius + electronRadius) + a.x;
            //   e.y = -(dy / mag) * (atomRadius + electronRadius) + a.y;

            timeTotal += e.time;
            timeCounter++;
            e.time = 0;
          }
          break;
        }
      }
      if (notCol) e.col = false;
    }
  }
};

createCanvas();

setInterval(main, step * 1000);
