const board = document.getElementById("board");
let canvas, ctx;

let colorScale = 255 / 40; // color units / magnitude units
const step = 1 / 60; // sec / tick
const skip = 10000;
let drawScale = 10;
let potentialScale = 1000000;
const h2m = 1;

const segments = 200;
let wr = [];
wi = [];
let p;
// let vr = [],
//   vi = [];

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

  wr = [];
  wi = [];
  // vr = [];
  // vi = [];
  for (let i = 0; i < segments; i++) {
    // wr[i] = 5 * Math.exp(-Math.pow(i - segments / 8, 2) / 100);
    wr[i] = 5 * Math.exp(-Math.pow(i - segments / 2 - 40, 2) / 100);
    wi[i] = 0;
    // vr[i] =
    // vi[i] =
  }

  draw();
};

let V = (x) => {
  //   return x < (segments * 15) / 32 ? 0 : x > (segments * 17) / 32 ? 0 : 0.0001;
  return 0.0000002 * Math.pow(x - segments / 2, 2);
  //   return
  return 0;
};

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
  ctx.strokeStyle = "rgba(255, 255, 255, 1)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-width / 2, 0);
  ctx.lineTo(width / 2, 0);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-width / 2, -height / 4);
  ctx.lineTo(width / 2, -height / 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-width / 2, height / 4);
  ctx.lineTo(width / 2, height / 4);
  ctx.stroke();

  ctx.strokeStyle = "rgba(0, 255, 0, 1)";
  ctx.beginPath();
  ctx.moveTo(-width / 2, -height / 4);
  for (let i = 0; i < segments; i++) {
    ctx.lineTo(
      -width / 2 + (width * i) / segments,
      -height / 4 - drawScale * wr[i]
    );
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 255, 0, 1)";
  ctx.beginPath();
  ctx.moveTo(-width / 2, -height / 4);
  for (let i = 0; i < segments; i++) {
    ctx.lineTo(
      -width / 2 + (width * i) / segments,
      -height / 4 - drawScale * wi[i]
    );
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(0, 0, 255, 1)";
  ctx.beginPath();
  ctx.moveTo(-width / 2, -height / 4);
  for (let i = 0; i < segments; i++) {
    ctx.lineTo(
      -width / 2 + (width * i) / segments,
      -height / 4 - potentialScale * V(i)
    );
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 255, 0, 1)";
  ctx.beginPath();
  ctx.moveTo(-width / 2, height / 4);
  for (let i = 0; i < segments; i++) {
    ctx.lineTo(
      -width / 2 + (width * i) / segments,
      height / 4 - drawScale * (wi[i] * wi[i] + wr[i] * wr[i])
      //   height / 4 - drawScale * wi[i]
    );
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(0, 0, 255, 1)";
  ctx.beginPath();
  ctx.moveTo(-width / 2, height / 4);
  for (let i = 0; i < segments; i++) {
    ctx.lineTo(
      -width / 2 + (width * i) / segments,
      height / 4 - potentialScale * V(i)
    );
  }
  ctx.stroke();
};

let lastTime = Date.now();
let t = 0;

const update = () => {
  const curstep = Math.min((Date.now() - lastTime) / 1000, 0.04);
  lastTime = Date.now();
  for (let s = 0; s < skip; s++) {
    t += curstep;
    let vi, vr;

    let nwi = [];
    let nwr = [];
    ddr = [];
    ddi = [];

    nwi[0] = wi[0];
    nwi[segments - 1] = wi[segments - 1];
    nwr[0] = wr[0];
    nwr[segments - 1] = wr[segments - 1];
    for (let i = 1; i < segments - 1; i++) {
      ddr[i] = (wr[i - 1] + wr[i + 1] - 2 * wr[i]) / 100;
      vi = -h2m * ddr[i] + V(i) * wr[i];
      ddi[i] = (wi[i - 1] + wi[i + 1] - 2 * wi[i]) / 100;
      vr = -h2m * ddi[i] + V(i) * wi[i];
      nwi[i] = wi[i] - curstep * vi;
      nwr[i] = wr[i] + curstep * vr;
    }
    for (let i = 0; i < segments; i++) {
      wi[i] = nwi[i];
      wr[i] = nwr[i];
    }
  }
  p = 0;
  for (let i = 0; i < segments; i++) {
    p += wi[i] * wi[i] + wr[i] * wr[i];
  }
  console.log(p);
};

createCanvas();

setInterval(main, step * 1000);
