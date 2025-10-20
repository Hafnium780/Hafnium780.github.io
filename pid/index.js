const board = document.getElementById("board");
let canvas, ctx;

let colorScale = 255 / 40; // color units / magnitude units
const step = 1 / 60; // sec / tick
const skip = 1;
let drawScale = 20;

let segments = 200;
let v = [],
  t = [];
let kp = 0.5,
  ki = 0.1,
  kd = 0.5;
disturbance = 0;
let interpolate = false;
let proportional = 1;
let integral = 1;
let derivative = 1;

let acc = 0;

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

  v = [];
  t = [];
  for (let i = 0; i < segments; i++) {
    // t[i] = Math.sin(i / 50) * 10;
    t[i] = i < segments / 2 ? 10 : 0;
  }
  draw();
};

const optionsDiv = document.createElement("div");
optionsDiv.classList.add("options-div");
document.body.appendChild(optionsDiv);

const sliders = [
  {
    name: "k_p",
    id: "k_p",
    min: "0",
    max: "2",
    step: "0.01",
    default: "0.5",
    callback: (value) => {
      kp = value;
    },
  },
  {
    name: "k_i",
    id: "k_i",
    min: "0",
    max: "2",
    step: "0.01",
    default: "0.1",
    callback: (value) => {
      ki = value;
    },
  },
  {
    name: "k_d",
    id: "k_d",
    min: "0",
    max: "2",
    step: "0.01",
    default: "0.5",
    callback: (value) => {
      kd = value;
    },
  },
  {
    name: "segments",
    id: "segments",
    min: "5",
    max: "1000",
    step: "1",
    default: "200",
    callback: (value) => {
      segments = value;
      createCanvas();
    },
  },
  {
    name: "disturbance",
    id: "disturbance",
    min: "-10",
    max: "10",
    step: "0.1",
    default: "0",
    callback: (value) => {
      disturbance = value;
    },
  },
  //   {
  //     name: "proportional on/off",
  //     id: "proportional",
  //     min: "0",
  //     max: "1",
  //     step: "1",
  //     default: "1",
  //     callback: (value) => {
  //       proportional = value;
  //     },
  //   },
  //   {
  //     name: "integral on/off",
  //     id: "integral",
  //     min: "0",
  //     max: "1",
  //     step: "1",
  //     default: "0",
  //     callback: (value) => {
  //       integral = value;
  //     },
  //   },
  //   {
  //     name: "derivative on/off",
  //     id: "derivative",
  //     min: "0",
  //     max: "1",
  //     step: "1",
  //     default: "0",
  //     callback: (value) => {
  //       derivative = value;
  //     },
  //   },
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
  {
    name: "toggle interpolation",
    run: (buttonDiv) => {
      interpolate = !interpolate;
    },
  },
];

for (const b of buttons) {
  const buttonDiv = document.createElement("button");
  buttonDiv.addEventListener("click", () => {
    b.run(buttonDiv);
  });
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

window.addEventListener("resize", (e) => {
  createCanvas();
});

const main = () => {
  update();
  draw();
};

let ddr = [],
  ddi = [];

const draw = () => {
  ctx.strokeStyle = "none";
  ctx.fillStyle = "black";
  ctx.fillRect(-width / 2, -height / 2, width, height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  //   ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-width / 2, 0);
  ctx.lineTo(width / 2, 0);
  ctx.stroke();

  for (let i = 0; i < segments; i++) {
    ctx.beginPath();
    ctx.moveTo(-width / 2 + (width * i) / segments, -5);
    ctx.lineTo(-width / 2 + (width * i) / segments, 5);
    ctx.stroke();
  }

  //   ctx.strokeStyle = "rgba(0, 0, 255, 1)";
  //   ctx.lineWidth = 1;
  //   ctx.beginPath();
  //   ctx.moveTo(-width / 2, 0);
  //   for (let i = 0; i < segments; i++) {
  //     ctx.lineTo(-width / 2 + (width * i) / segments, -drawScale * t[i]);
  //   }
  //   ctx.stroke();
  ctx.strokeStyle = "rgba(255, 0, 0, 1)";
  ctx.lineWidth = 1;
  for (let i = 0; i < segments; i++) {
    ctx.beginPath();
    ctx.arc(
      -width / 2 + (width * i) / segments,
      -drawScale * t[i],
      2,
      0,
      6.283
    );
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
  if (interpolate) {
    ctx.beginPath();
    ctx.moveTo(-width / 2, 0);
    for (let i = 0; i < segments; i++) {
      ctx.lineTo(-width / 2 + (width * i) / segments, -drawScale * v[i]);
    }
    ctx.stroke();
  } else {
    ctx.lineWidth = 2;
    for (let i = 0; i < segments; i++) {
      ctx.beginPath();
      ctx.moveTo(-width / 2 + (width * i) / segments, 0);
      ctx.lineTo(-width / 2 + (width * i) / segments, -drawScale * v[i]);
      ctx.stroke();
    }
  }
};

const update = () => {
  v[0] = 2;
  v[1] = 1;
  acc = 0;
  for (let i = 2; i < segments; i++) {
    v[i] =
      v[i - 1] +
      +0.5 * v[i - 2] +
      (proportional ? kp * (t[i - 1] - v[i - 1]) : 0) +
      (integral ? ki * acc : 0) +
      (derivative && i > 1
        ? kd * (t[i - 1] - v[i - 1] - (t[i - 2] - v[i - 2]))
        : 0) +
      disturbance;
    acc += t[i - 1] - v[i - 1];
  }
  //   const curstep = Math.min((Date.now() - lastTime) / 1000, 0.04);
  //   lastTime = Date.now();
  //   for (let s = 0; s < skip; s++) {
  //     t += curstep;
  //     let vi, vr;
  //     let nwi = [];
  //     let nwr = [];
  //     ddr = [];
  //     ddi = [];
  //     nwi[0] = wi[0];
  //     nwi[segments - 1] = wi[segments - 1];
  //     nwr[0] = wr[0];
  //     nwr[segments - 1] = wr[segments - 1];
  //     for (let i = 1; i < segments - 1; i++) {
  //       ddr[i] = (wr[i - 1] + wr[i + 1] - 2 * wr[i]) / 100;
  //       vi = -h2m * ddr[i] + V(i) * wr[i];
  //       ddi[i] = (wi[i - 1] + wi[i + 1] - 2 * wi[i]) / 100;
  //       vr = -h2m * ddi[i] + V(i) * wi[i];
  //       nwi[i] = wi[i] - curstep * vi;
  //       nwr[i] = wr[i] + curstep * vr;
  //     }
  //     for (let i = 0; i < segments; i++) {
  //       wi[i] = nwi[i];
  //       wr[i] = nwr[i];
  //     }
  //   }
  //   p = 0;
  //   for (let i = 0; i < segments; i++) {
  //     p += wi[i] * wi[i] + wr[i] * wr[i];
  //   }
  //   console.log(p);
};

createCanvas();

setInterval(main, step * 1000);
