// Swinging pulley
let m, M, g;

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

const setConditions = (mass, Mass, grav, t0, w0, r0, v0) => {
  m = mass;
  M = Mass;
  g = grav;
  rk4.state[1] = t0;
  rk4.state[2] = w0;
  rk4.state[3] = r0;
  rk4.state[4] = v0;
};

// setConditions(1, 2, 9.8, 2.5, 1, 8, -1);
setConditions(1, 1.5, 9.8, 1, 1, 10, 0);

// t, th, th', x, x'
// const data = rk4.runUntil(6, 10);

const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");
canvas.style.width = window.innerWidth + "px";
canvas.style.height = window.innerHeight + "px";
canvas.width = 2 * window.innerWidth;
canvas.height = 2 * window.innerHeight;
ctx.translate(canvas.width / 2, canvas.height / 2);

const pulleyR = 10;
const pulleyX = 360;
const pulleyY = 400;
const totalStringLength = 15;
const massR = 16;
const stateScale = 60;

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

  ctx.lineWidth = 1;
  ctx.fillStyle = ctx.strokeStyle = "rgb(200, 200, 200)";
  ctx.beginPath();
  ctx.arc(pulleyX, -pulleyY, pulleyR, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-pulleyX, -pulleyY, pulleyR, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = ctx.strokeStyle = "rgb(150, 150, 150)";
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

  ctx.fillStyle = ctx.strokeStyle = "rgb(200, 100, 100)";
  ctx.beginPath();
  ctx.arc(
    -pulleyX - pulleyR,
    (totalStringLength - rk4.state[3]) * stateScale,
    massR * Math.sqrt(M / m),
    0,
    2 * Math.PI
  );
  ctx.fill();

  const swingMassX = stateScale * (rk4.state[3] * Math.sin(rk4.state[1]));
  // pulleyX + pulleyR + stateScale * (rk4.state[3] * Math.sin(rk4.state[1]));
  const swingMassY = stateScale * rk4.state[3] * Math.cos(rk4.state[1]);
  // -pulleyY + stateScale * rk4.state[3] * Math.cos(rk4.state[1]);

  // Make string look like it's wrapping around

  // string length = r, hypotenuse
  const hyp = stateScale * Math.abs(rk4.state[3]);
  // opposite = pulley's r
  const opp = pulleyR;
  // Length of drawn string
  const dist = Math.sqrt(hyp * hyp - opp * opp);
  // Angle from mass to pulley
  const origAng = Math.atan2(swingMassY, -swingMassX);
  // console.log(origAng);
  const ang = origAng - Math.asin(opp / hyp);

  const stringX = pulleyX + swingMassX + dist * Math.cos(ang);
  const stringY = swingMassY - pulleyY - dist * Math.sin(ang);

  ctx.fillStyle = ctx.strokeStyle = "rgb(150, 150, 150)";
  ctx.beginPath();
  ctx.moveTo(stringX, stringY);
  ctx.lineTo(pulleyX + swingMassX, swingMassY - pulleyY);
  ctx.stroke();

  ctx.fillStyle = ctx.strokeStyle = "rgb(100, 200, 100)";
  ctx.beginPath();
  ctx.arc(pulleyX + swingMassX, swingMassY - pulleyY, massR, 0, 2 * Math.PI);
  ctx.fill();

  path.push({ x: pulleyX + swingMassX, y: swingMassY - pulleyY });
  if (path.length > maxPathLen) {
    path.shift();
  }
  rk4.step(30);
}, 1000 / 60);
