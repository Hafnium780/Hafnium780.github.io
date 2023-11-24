// Pendulum w/ movable pivot

let m, M, k, l, g;

const tdotdot = (state) => {
  return (
    (-g / state[5]) * Math.sin(state[1]) -
    (k / M) * (1 - l / state[5]) * Math.sin(state[1]) * Math.cos(state[1]) -
    ((2 * state[6]) / state[5]) * state[2]
  );
};
const xdotdot = (state) => {
  return (k / M) * (state[5] - l) * Math.sin(state[1]);
};
const rdotdot = (state) => {
  return (
    g * Math.cos(state[1]) +
    state[5] * state[2] * state[2] -
    k * (Math.pow(Math.sin(state[1]), 2) / M + 1 / m) * (state[5] - l)
  );
};

const vars = [
  "Time",
  "Angle", // 1
  "Angular Velocity", // 2
  "Position", // 3
  "Velocity", // 4
  "Radius", // 5
  "Radius Dot", // 6
];

const rk4 = new RK4(
  7,
  [0, 0, 0, 0, 0, 0, 0],
  [
    (state) => {
      // t' = 1
      return 1;
    },
    (state) => {
      // th'
      return state[2];
    },
    (state) => {
      // th''
      return tdotdot(state);
    },
    (state) => {
      // x'
      return state[4];
    },
    (state) => {
      // x''
      return xdotdot(state);
    },
    (state) => {
      // r'
      return state[6];
    },
    (state) => {
      // r''
      return rdotdot(state);
    },
  ],
  0.001
);

const setConditions = (
  mass,
  Mass,
  spring,
  l0,
  grav,
  t0,
  w0,
  x0,
  v0,
  r0,
  rr0
) => {
  m = mass;
  M = Mass;
  k = spring;
  l = l0;
  g = grav;
  rk4.state[1] = t0;
  rk4.state[2] = w0;
  rk4.state[3] = x0;
  rk4.state[4] = v0;
  rk4.state[5] = r0;
  rk4.state[6] = rr0;
};

// Normal pendulum
// setConditions(1, 1, 1000, 10, 9.8, 2, 0, -30, 0.6, 10, 0);

// Normal spring
// setConditions(1, 1, 10, 10, 9.8, 0, 0, 0, 0, 8, 0);

// fun
setConditions(1, 1, 10, 10, 9.8, 1, 0, 0, 0.6, 8, 0);
// setConditions(1, 1, 5, 10, 9.8, 1, 0, -30, 0.6, 8, 0);
// setConditions(1, 10, 10, 10, 9.8, 3, 0, -30, 0, 8, 4);
// setConditions(1, 10000000, 2, 6, 9.8, 0.4, 0, 0, 0, 7, 0);

const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");
canvas.style.width = window.innerWidth + "px";
canvas.style.height = window.innerHeight + "px";
canvas.width = 2 * window.innerWidth;
canvas.height = 2 * window.innerHeight;
ctx.translate(canvas.width / 2, canvas.height / 2);

const cartW = 80;
const cartH = 10;
const massR = 16;
const stateScale = 40;

let cameraX = 0;
const cameraRange = 150;
const lineSpacing = 200;

const path = [];
const cartPath = [];
const maxPathLen = 100000;
const pathR = 4;

// document.addEventListener("keydown", (e) => {
//   if (e.key == "d") cameraX += 100;
//   else if (e.key == "a") cameraX -= 100;
// });

const optionsDiv = document.createElement("div");
optionsDiv.classList.add("options-div");
document.body.appendChild(optionsDiv);

const sliders = [
  {
    name: "natural length",
    id: "natural_length",
    min: "0",
    max: "15",
    step: "1",
    default: "10",
    callback: (value) => {
      l = value;
    },
  },
  {
    name: "spring constant",
    id: "sprint_constant",
    min: "0",
    max: "15",
    step: "1",
    default: "10",
    callback: (value) => {
      k = value;
    },
  },
  {
    name: "bob mass",
    id: "bob_mass",
    min: "0.1",
    max: "4",
    step: "0.1",
    default: "1",
    callback: (value) => {
      M = value;
    },
  },
  {
    name: "cart mass",
    id: "cart_mass",
    min: "0.1",
    max: "4",
    step: "0.1",
    default: "1",
    callback: (value) => {
      M = value;
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
  sliderDiv.addEventListener("input", () => {
    sl.callback(parseFloat(sliderDiv.value));
  });
  optionDiv.appendChild(sliderDiv);
  const sliderLabel = document.createElement("label");
  sliderLabel.classList.add("slider-label");
  sliderLabel.setAttribute("for", sl.id);
  sliderLabel.innerText = sl.name;
  optionDiv.appendChild(sliderLabel);
}

/*
  "Time",
  "Angle", // 1
  "Angular Velocity", // 2
  "Position", // 3
  "Velocity", // 4
  "Radius", // 5
  "Radius Dot", // 6
*/

const stats = [
  {
    name: "cart kinetic energy",
    id: "cart_energy",
    precision: 2,
    get: () => {
      return 0.5 * M * Math.pow(rk4.state[4], 2);
    },
  },
  {
    name: "bob kinetic energy",
    id: "bob_energy",
    precision: 2,
    get: () => {
      return (
        0.5 * m * Math.pow(rk4.state[4], 2) +
        0.5 * m * Math.pow(rk4.state[6], 2) +
        0.5 * m * Math.pow(rk4.state[5], 2) * Math.pow(rk4.state[2], 2) +
        m * rk4.state[4] * rk4.state[6] * Math.sin(rk4.state[1]) +
        m * rk4.state[4] * rk4.state[5] * rk4.state[2] * Math.cos(rk4.state[1])
      );
    },
  },
  {
    name: "kinetic energy",
    id: "kinetic_energy",
    precision: 4,
    get: () => {
      return (
        0.5 * M * Math.pow(rk4.state[4], 2) +
        0.5 * m * Math.pow(rk4.state[4], 2) +
        0.5 * m * Math.pow(rk4.state[6], 2) +
        0.5 * m * Math.pow(rk4.state[5], 2) * Math.pow(rk4.state[2], 2) +
        m * rk4.state[4] * rk4.state[6] * Math.sin(rk4.state[1]) +
        m * rk4.state[4] * rk4.state[5] * rk4.state[2] * Math.cos(rk4.state[1])
      );
    },
  },
  {
    name: "potential energy",
    id: "potential_energy",
    precision: 4,
    get: () => {
      return (
        -m * g * rk4.state[5] * Math.cos(rk4.state[1]) +
        0.5 * k * Math.pow(rk4.state[5] - l, 2) +
        100 // random offset to not let total be negative for convenience
      );
    },
  },
  {
    name: "total energy",
    id: "total_energy",
    precision: 16,
    get: () => {
      return stats[2].get() + stats[3].get();
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

setInterval(() => {
  if (cameraX < rk4.state[3] * stateScale - cameraRange)
    cameraX = rk4.state[3] * stateScale - cameraRange;
  if (cameraX > rk4.state[3] * stateScale + cameraRange)
    cameraX = rk4.state[3] * stateScale + cameraRange;
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );

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

  const offset = cameraX % lineSpacing;
  ctx.fillStyle = ctx.strokeStyle = "rgb(150, 150, 150)";
  for (
    let x = -canvas.width / 2 - offset;
    x <= canvas.width / 2;
    x += lineSpacing
  ) {
    ctx.beginPath();
    ctx.moveTo(x, -10);
    ctx.lineTo(x, 10);
    ctx.stroke();
  }

  if (path.length) {
    ctx.fillStyle = ctx.strokeStyle = "rgb(200, 200, 200)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(path[0].x - cameraX, path[0].y);
    for (const p of path) {
      // ctx.arc(p.x, p.y, pathR, 0, 2 * Math.PI);
      ctx.lineTo(p.x - cameraX, p.y);
    }
    ctx.stroke();
    ctx.beginPath();
    let y = 0;
    for (const p of cartPath.slice().reverse()) {
      ctx.lineTo(p.x - cameraX, y);
      y -= 1;
      if (y < -canvas.height / 2) break;
    }
    ctx.stroke();
  }
  ctx.fillStyle = ctx.strokeStyle = "rgb(150, 150, 150)";
  ctx.beginPath();
  ctx.moveTo(-canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, 0);
  ctx.stroke();

  ctx.fillStyle = ctx.strokeStyle = "rgb(255, 255, 255)";
  ctx.fillRect(
    stateScale * rk4.state[3] - cartW / 2 - cameraX,
    -cartH / 2,
    cartW,
    cartH
  );

  for (let i = 0; i < 1; i++) {
    const massX = rk4.state[3] + Math.sin(rk4.state[1]) * rk4.state[5];
    const massY = Math.cos(rk4.state[1]) * rk4.state[5];

    ctx.fillStyle = ctx.strokeStyle = "rgb(200, 100, 100)";
    ctx.beginPath();
    ctx.arc(
      stateScale * massX - cameraX,
      stateScale * massY,
      massR,
      0,
      2 * Math.PI
    );
    ctx.fill();

    ctx.fillStyle = ctx.strokeStyle = "rgb(150, 150, 150)";
    ctx.beginPath();
    ctx.moveTo(stateScale * rk4.state[3] - cameraX, 0);
    ctx.lineTo(stateScale * massX - cameraX, stateScale * massY);
    ctx.stroke();

    path.push({ x: stateScale * massX, y: stateScale * massY });
    cartPath.push({ x: stateScale * rk4.state[3], y: 0 });
    if (path.length > maxPathLen) {
      path.shift();
    }
    rk4.step(30);
  }
}, 1000 / 60);
