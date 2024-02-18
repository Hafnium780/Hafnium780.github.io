// Pendulum w/ controllable pivot

let m, r, g;

// const accel = (state) => {
//   const num =
//     m * Math.pow(state[2], 2) * r * Math.sin(state[1]) +
//     m * g * Math.sin(state[1]) * Math.cos(state[1]);
//   const denom = M + m * Math.pow(Math.sin(state[1]), 2);
//   return num / denom;
// };

let xAccel = 0;
let maxAccel = 10;

document.addEventListener("keydown", (e) => {
  if (e.key == "ArrowRight") xAccel = maxAccel;
  else if (e.key == "ArrowLeft") xAccel = -maxAccel;
});

document.addEventListener("keyup", (e) => {
  if (e.key == "ArrowRight" && xAccel == maxAccel) xAccel = 0;
  else if (e.key == "ArrowLeft" && xAccel == -maxAccel) xAccel = 0;
});

const processCollisions = (rk4) => {
  //   console.log(state[3] * stateScale + cartW / 2);
  if (rk4.state[3] * stateScale + cartW / 2 >= window.innerWidth) {
    rk4.state = collide(rk4.state);
    rk4.state[3] = (1 / stateScale) * (window.innerWidth - cartW / 2);
  } else if (rk4.state[3] * stateScale - cartW / 2 <= -window.innerWidth) {
    rk4.state = collide(rk4.state);
    rk4.state[3] = (1 / stateScale) * (-window.innerWidth + cartW / 2);
  }
};

const collide = (state) => {
  return [
    state[0],
    state[1],
    state[2] - ((1 + 0.9) * state[4] * Math.sin(state[1])) / r,
    state[3],
    -state[4] * 0.9,
  ];
};

const accel = (state) => {
  return xAccel;
};

const aaccel = (state) => {
  return (1 / r) * (accel(state) * Math.sin(state[1]) - g * Math.cos(state[1]));
};

const vars = ["Time", "Angle", "Angular Velocity", "Position", "Velocity"];

const rk4 = new RK4(
  5,
  [0, 0, 0, 0, 0],
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
      return aaccel(state);
    },
    (state) => {
      // x'
      return state[4];
    },
    (state) => {
      // x''
      return accel(state);
    },
  ],
  0.001
);

const setConditions = (mass, rad, grav, t0, w0, x0, v0) => {
  m = mass;
  r = rad;
  g = grav;
  rk4.state[1] = t0;
  rk4.state[2] = w0;
  rk4.state[3] = x0;
  rk4.state[4] = v0;
};

setConditions(1, 10, 9.8, Math.PI / 2, 0, 0, 0);

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

const path = [];
const maxPathLen = 100000;
const pathR = 4;

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
    ctx.moveTo(path[0].x, path[0].y);
    for (const p of path) {
      // ctx.arc(p.x, p.y, pathR, 0, 2 * Math.PI);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
  ctx.fillStyle = ctx.strokeStyle = "rgb(150, 150, 150)";
  ctx.beginPath();
  ctx.moveTo(-canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, 0);
  ctx.stroke();

  ctx.fillStyle = ctx.strokeStyle = "rgb(255, 255, 255)";
  ctx.fillRect(stateScale * rk4.state[3] - cartW / 2, -cartH / 2, cartW, cartH);

  const massX = rk4.state[3] + Math.cos(rk4.state[1]) * r;
  const massY = -Math.sin(rk4.state[1]) * r;

  ctx.fillStyle = ctx.strokeStyle = "rgb(200, 100, 100)";
  ctx.beginPath();
  ctx.arc(stateScale * massX, stateScale * massY, massR, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = ctx.strokeStyle = "rgb(150, 150, 150)";
  ctx.beginPath();
  ctx.moveTo(stateScale * rk4.state[3], 0);
  ctx.lineTo(stateScale * massX, stateScale * massY);
  ctx.stroke();

  path.push({ x: stateScale * massX, y: stateScale * massY });
  if (path.length > maxPathLen) {
    path.shift();
  }
  rk4.step(30);
  processCollisions(rk4);
}, 1000 / 60);
