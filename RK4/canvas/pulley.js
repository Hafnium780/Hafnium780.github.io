// Swinging pulley
const m = 1,
  M = 1.5;
g = 9.8;

const accel = (state) => {
  return (
    (m * state[3] * Math.pow(state[2], 2) +
      m * g * Math.cos(state[1]) -
      M * g) /
    (m + M)
  );
};

const aaccel = (state) => {
  return (-2 * state[4] * state[2] - g * Math.sin(state[1])) / state[3];
};

const vars = ["Time", "Angle", "Angular Velocity", "Position", "Velocity"];

const rk4 = new RK4(
  5,
  [0, 1, 0, 10, 0],
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

// t, th, th', x, x'
// const data = rk4.runUntil(6, 10);

const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.translate(canvas.width / 2, canvas.height / 2);

const pulleyR = 3;
const pulleyX = 180;
const pulleyY = 200;
const totalStringLength = 10;
const massR = 8;
const stateScale = 30;

setInterval(() => {
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle = ctx.strokeStyle = "rgb(100, 100, 100)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(pulleyX, -pulleyY, pulleyR, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-pulleyX, -pulleyY, pulleyR, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-pulleyX, -pulleyY - pulleyR);
  ctx.lineTo(pulleyX, -pulleyY - pulleyR);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-pulleyX - pulleyR, -pulleyY);
  ctx.lineTo(
    -pulleyX - pulleyR,
    (totalStringLength - rk4.state[3]) * stateScale
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(
    -pulleyX - pulleyR,
    (totalStringLength - rk4.state[3]) * stateScale,
    massR * Math.sqrt(M / m),
    0,
    2 * Math.PI
  );
  ctx.fill();

  const swingMassX =
    pulleyX + pulleyR + stateScale * (rk4.state[3] * Math.sin(rk4.state[1]));
  const swingMassY =
    -pulleyY + stateScale * rk4.state[3] * Math.cos(rk4.state[1]);

  ctx.beginPath();
  ctx.moveTo(pulleyX + pulleyR, -pulleyY);
  ctx.lineTo(swingMassX, swingMassY);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(swingMassX, swingMassY, massR, 0, 2 * Math.PI);
  ctx.fill();

  rk4.step(30);
}, 1000 / 60);
