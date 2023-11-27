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
// setConditions(0.1, 1, 1000, 10, 9.8, 2, 0, -30, 0.6, 10, 0);

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

const cartW = 80;
const cartH = 10;
const massR = 16;
const stateScale = 40;

const cmR = 8;

let simulationSteps = 30;
let cameraX = 0;
const cameraRange = 150;
const lineSpacing = 200;

const path = [];
const cartPath = [];
const cmPath = [];
let pathCount = 0;
const pathSkip = 30;
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
    name: "simulation speed",
    id: "simulation_speed",
    min: "1",
    max: "100",
    step: "1",
    default: "30",
    callback: (value) => {
      simulationSteps = value;
    },
  },
  {
    name: "natural length",
    id: "natural_length",
    min: "0",
    max: "15",
    step: "1",
    default: "10",
    callback: (value) => {
      l = value;
      resetPath();
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
      resetPath();
    },
  },
  {
    name: "gravity",
    id: "gravity",
    min: "-9.8",
    max: "9.8",
    step: "0.1",
    default: "9.8",
    callback: (value) => {
      g = value;
      resetPath();
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
      m = value;
      resetPath();
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
      resetPath();
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
    name: "stop velocity",
    run: () => {
      rk4.state[2] = 0;
      rk4.state[4] = 0;
      rk4.state[6] = 0;
      resetPath();
    },
  },
  {
    name: "randomize velocity",
    run: () => {
      rk4.state[2] = Math.random() * 4 - 2;
      rk4.state[4] = Math.random() * 2 - 1;
      rk4.state[6] = Math.random() * 4 - 1;
      resetPath();
    },
  },
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
  {
    name: "cart momentum",
    id: "cart_momentum",
    precision: 4,
    get: () => {
      return M * rk4.state[4];
    },
  },
  {
    name: "bob momentum (x)",
    id: "bob_momentum_x",
    precision: 4,
    get: () => {
      return (
        m *
        (rk4.state[4] +
          rk4.state[6] * Math.sin(rk4.state[1]) +
          rk4.state[5] * rk4.state[2] * Math.cos(rk4.state[1]))
      );
    },
  },
  {
    name: "bob momentum (y)",
    id: "bob_momentum_y",
    precision: 4,
    get: () => {
      return (
        m *
        (rk4.state[6] * Math.cos(rk4.state[1]) -
          rk4.state[5] * rk4.state[2] * Math.sin(rk4.state[1]))
      );
    },
  },
  {
    name: "total momentum (x)",
    id: "total_momentum_x",
    precision: 16,
    get: () => {
      return stats[5].get() + stats[6].get();
    },
  },
  // {
  //   name: "angular momentum?",
  //   id: "angular_momentum",
  //   precision: 16,
  //   get: () => {
  //     // return rk4.state[2] * m * rk4.state[5] * rk4.state[5];
  //     return (
  //       m *
  //       rk4.state[5] *
  //       (Math.cos(rk4.state[1]) *
  //         (rk4.state[4] +
  //           rk4.state[6] * Math.sin(rk4.state[1]) +
  //           rk4.state[5] * rk4.state[2] * Math.cos(rk4.state[1])) +
  //         Math.sin(rk4.state[1]) *
  //           (rk4.state[6] * Math.cos(rk4.state[1]) -
  //             rk4.state[5] * rk4.state[2] * Math.sin(rk4.state[1])))
  //     );
  //   },
  // },
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

const resetPath = () => {
  for (const p of path) {
    p.red = true;
  }
  for (const p of cartPath) {
    p.red = true;
  }
  for (const p of cmPath) {
    p.red = true;
  }
};

setInterval(() => {
  if (paused) return;
  if (cameraX < rk4.state[3] * stateScale - cameraRange)
    cameraX = rk4.state[3] * stateScale - cameraRange;
  if (cameraX > rk4.state[3] * stateScale + cameraRange)
    cameraX = rk4.state[3] * stateScale + cameraRange;
  // no work
  // if (rk4.state[3] * stateScale + cartW / 2 > canvas.width / 2) {
  //   rk4.state[4] = -rk4.state[4];
  // }
  // if (rk4.state[3] * stateScale - cartW / 2 < -canvas.width / 2) {
  //   rk4.state[4] = -rk4.state[4];
  // }
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

  let massX = rk4.state[3] + Math.sin(rk4.state[1]) * rk4.state[5];
  let massY = Math.cos(rk4.state[1]) * rk4.state[5];

  let velX =
    rk4.state[4] +
    rk4.state[6] * Math.sin(rk4.state[1]) +
    rk4.state[5] * rk4.state[2] * Math.cos(rk4.state[1]);
  let velY =
    rk4.state[6] * Math.cos(rk4.state[1]) -
    rk4.state[5] * rk4.state[2] * Math.sin(rk4.state[1]);

  const xdd = xdotdot(rk4.state);
  const rdd = rdotdot(rk4.state);
  const tdd = tdotdot(rk4.state);
  let accelX =
    xdd +
    rdd * Math.sin(rk4.state[1]) +
    2 * rk4.state[6] * rk4.state[2] * Math.cos(rk4.state[1]) +
    rk4.state[5] * tdd * Math.cos(rk4.state[1]) -
    rk4.state[5] * Math.pow(rk4.state[2], 2) * Math.sin(rk4.state[1]);

  let accelY =
    rdd * Math.cos(rk4.state[1]) -
    2 * rk4.state[6] * rk4.state[2] * Math.sin(rk4.state[1]) -
    rk4.state[5] * tdd * Math.sin(rk4.state[1]) -
    rk4.state[5] * Math.pow(rk4.state[2], 2) * Math.cos(rk4.state[1]);

  let cmX = (massX * m + rk4.state[3] * M) / (m + M);
  let cmY = (massY * m) / (m + M);

  const offset = cameraX % lineSpacing;
  ctx.fillStyle = ctx.strokeStyle = "rgb(70, 70, 70)";
  for (
    let x = -canvas.width / 2 - offset;
    x <= canvas.width / 2;
    x += lineSpacing
  ) {
    ctx.beginPath();
    ctx.moveTo(x, -canvas.height / 2);
    ctx.lineTo(x, canvas.height / 2);
    ctx.stroke();
  }

  if (path.length) {
    ctx.lineWidth = 1;
    for (let i = 1; i < path.length; i++) {
      // ctx.arc(p.x, p.y, pathR, 0, 2 * Math.PI);
      ctx.fillStyle = ctx.strokeStyle = path[i - 1].red
        ? "rgb(200, 50, 50)"
        : "rgb(200, 200, 200)";
      ctx.beginPath();
      ctx.moveTo(path[i - 1].x - cameraX, path[i - 1].y);
      ctx.lineTo(path[i].x - cameraX, path[i].y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(path[path.length - 1].x - cameraX, path[path.length - 1].y);
    ctx.lineTo(stateScale * massX - cameraX, stateScale * massY);
    ctx.stroke();
    ctx.beginPath();
    let y = 0;
    for (let i = cartPath.length - 1; i > 0; i--) {
      ctx.fillStyle = ctx.strokeStyle = cartPath[i - 1].red
        ? "rgb(200, 50, 50)"
        : "rgb(200, 200, 200)";
      ctx.beginPath();
      ctx.moveTo(cartPath[i - 1].x - cameraX, y + 1);
      ctx.lineTo(cartPath[i].x - cameraX, y);
      ctx.stroke();
      y -= 1;
      if (y < -canvas.height / 2) break;
    }
    ctx.stroke();
    y = 0;
    for (let i = cmPath.length - 1; i > 0; i--) {
      ctx.fillStyle = ctx.strokeStyle = cmPath[i - 1].red
        ? "rgb(200, 50, 50)"
        : "rgb(50, 200, 50)";
      ctx.beginPath();
      ctx.moveTo(cmPath[i - 1].x - cameraX, y + 1);
      ctx.lineTo(cmPath[i].x - cameraX, y);
      ctx.stroke();
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

  ctx.fillStyle = ctx.strokeStyle = "rgb(150, 150, 255)";
  ctx.beginPath();
  ctx.arc(
    stateScale * rk4.state[3] - cameraX,
    0,
    l * stateScale,
    -rk4.state[1] - 0.1 + Math.PI / 2,
    -rk4.state[1] + 0.1 + Math.PI / 2
  );
  ctx.stroke();

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

  ctx.lineWidth = 2;
  ctx.fillStyle = ctx.strokeStyle = "rgb(100, 200, 100)";
  ctx.beginPath();
  ctx.moveTo(stateScale * massX - cameraX, stateScale * massY);
  ctx.lineTo(
    stateScale * massX + (stateScale / 5) * velX - cameraX,
    stateScale * massY + (stateScale / 5) * velY
  );
  ctx.stroke();
  ctx.fillStyle = ctx.strokeStyle = "rgb(100, 100, 200)";
  ctx.beginPath();
  ctx.moveTo(stateScale * massX - cameraX, stateScale * massY);
  ctx.lineTo(
    stateScale * massX + (stateScale / 10) * accelX - cameraX,
    stateScale * massY + (stateScale / 10) * accelY
  );
  ctx.stroke();
  ctx.lineWidth = 1;

  ctx.fillStyle = ctx.strokeStyle = "rgb(100, 200, 100)";
  ctx.beginPath();
  ctx.arc(stateScale * cmX - cameraX, stateScale * cmY, cmR, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(stateScale * cmX - cameraX, stateScale * cmY);
  ctx.lineTo(stateScale * cmX - cameraX, 0);
  ctx.stroke();

  ctx.fillStyle = ctx.strokeStyle = "rgb(150, 150, 150)";
  ctx.beginPath();
  ctx.moveTo(stateScale * rk4.state[3] - cameraX, 0);
  ctx.lineTo(stateScale * massX - cameraX, stateScale * massY);
  ctx.stroke();

  for (let i = 0; i < simulationSteps; i++) {
    massX = rk4.state[3] + Math.sin(rk4.state[1]) * rk4.state[5];
    massY = Math.cos(rk4.state[1]) * rk4.state[5];

    cmX = (massX * m + rk4.state[3] * M) / (m + M);
    cmY = (massY * m) / (m + M);

    pathCount++;
    if (pathCount % pathSkip === 0) {
      pathCount = 0;
      path.push({ x: stateScale * massX, y: stateScale * massY, red: false });
      cartPath.push({ x: stateScale * rk4.state[3], y: 0, red: false });
      cmPath.push({ x: stateScale * cmX, y: stateScale * cmY, red: false });
      if (path.length > maxPathLen) {
        path.shift();
        cartPath.shift();
        cmPath.shift();
      }
    }
    rk4.step(1);
  }
}, 1000 / 60);
