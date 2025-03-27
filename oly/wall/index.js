const board = document.getElementById("board");
let canvas, ctx;

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
  draw();
};

window.addEventListener("resize", (e) => {
  createCanvas();
});

const main = () => {
  update();
  draw();
};

const path = [];

const lengthScale = 200;
const forceScale = 100;

const resolution = 1; // height of each wave segment
const skipDraw = 100;

const draw = () => {
  ctx.strokeStyle = "none";
  ctx.fillStyle = "black";
  ctx.fillRect(-width / 2, -height / 2, width, height);

  for (let z = -height / 2; z < height / 2 + resolution; z += resolution) {
    const mag = E(z / lengthScale, t) / E0;
    let r = 0,
      b = 0;
    if (mag > 0) b = mag * 100;
    else r = -mag * 100;
    ctx.fillStyle = "rgb(" + r + ",0," + b + ")";
    ctx.fillRect(-width / 2, z, width, resolution);
  }

  path.push({ x: x, z: z });
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(path[0].x * lengthScale, path[0].z * lengthScale);
  for (const p of path) {
    ctx.lineTo(p.x * lengthScale, p.z * lengthScale);
  }
  ctx.stroke();

  ctx.strokeStyle = "none";
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x * lengthScale, z * lengthScale, 3, 0, 2 * Math.PI);
  ctx.fill();

  const bz = q * B(z, t) * vx;
  const bx = -q * B(z, t) * vz;

  ctx.strokeStyle = "rgb(100, 100, 255)";
  ctx.beginPath();
  ctx.moveTo(x * lengthScale, z * lengthScale);
  ctx.lineTo(x * lengthScale + q * E(z, t) * forceScale, z * lengthScale);
  ctx.stroke();

  ctx.strokeStyle = "rgb(100, 255, 100)";
  ctx.beginPath();
  ctx.moveTo(x * lengthScale, z * lengthScale);
  ctx.lineTo(
    x * lengthScale + bx * forceScale,
    z * lengthScale + bz * forceScale
  );
  ctx.stroke();

  ctx.strokeStyle = "rgb(255, 100, 100)";
  ctx.beginPath();
  ctx.moveTo(x * lengthScale, z * lengthScale);
  ctx.lineTo(
    x * lengthScale + bx * forceScale + q * E(z, t) * forceScale,
    z * lengthScale + bz * forceScale
  );
  ctx.stroke();
};

const step = 1 / 60;
const speed = 1;

let t = 0;
let vx = 0,
  vz = -0.16,
  x = 0,
  z = 0;

const q = 1,
  m = 1;
const w = 1,
  k = (2 * Math.PI) / 10;
const c = w / k;

// amplitude of e
const E0 = 1.1;
// amplitude of b
const B0 = E0 / c;

// electric field in x direction
const E = (z, t) => {
  return E0 * Math.cos(k * z - w * t);
};

// magnetic field in y direction
const B = (z, t) => {
  return B0 * Math.cos(k * z - w * t);
};

const update = () => {
  for (let i = 0; i < skipDraw; i++) {
    // lorentz factor
    const y = 1 / Math.sqrt(1 - (vx * vx + vz * vz) / c / c) || 1000;
    // console.log(y);

    // ymdvx/dt = dpx/dt = qe(1-vz/c);
    const dvx =
      (((speed * step) / skipDraw) * (q * E(z, t) * (1 - vz / c))) / m;
    // const dvx = ((step / skipDraw) * (q * E(z, t) * 1)) / m;

    // ymdvz/dt = qe(vx/c)
    const dvz = (((speed * step) / skipDraw) * (q * E(z, t) * (vx / c))) / m;
    // const dvz = 0;
    vx += dvx;
    vz += dvz;
    x += (vx * speed * step) / skipDraw;
    z += (vz * speed * step) / skipDraw;
    t += (speed * step) / skipDraw;
  }
};

createCanvas();

setInterval(main, step * 1000);
