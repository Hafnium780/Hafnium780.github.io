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
setConditions(1, 1, 10, 10, 9.8, 1, 0, -30, 0.6, 8, 0);
// setConditions(1, 10, 10, 10, 9.8, 3, 0, -30, 0, 8, 4);

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

const path = [];
const maxPathLen = 100000;
const pathR = 4;

document.addEventListener("keydown", (e) => {
  if (e.key == "d") cameraX += 100;
  else if (e.key == "a") cameraX -= 100;
});

setInterval(() => {
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );

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
  if (path.length > maxPathLen) {
    path.shift();
  }
  rk4.step(30);
}, 1000 / 60);
