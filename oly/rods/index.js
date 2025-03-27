const board = document.getElementById("board");
let canvas, ctx;

const ctxChart = document.getElementById("chart");

const chartData = {
  datasets: [],
};

const distance = [];

chartData.datasets.push({
  label: "Distance",
  data: distance,
  borderColor: "rgb(255, 100, 100)",
});

const expected = [];

chartData.datasets.push({
  label: "Expected Min",
  data: expected,
  borderColor: "rgb(100, 255, 100)",
});

chart = new Chart(ctxChart, {
  type: "line",
  data: chartData,
  options: {
    animation: {
      duration: 0,
    },
    maintainAspectRatio: true,
    aspectRatio: window.innerWidth / 3 / window.innerHeight,
    scales: {
      x: {
        min: 0,
        max: 15,
        type: "linear",
        position: "bottom",
        title: {
          text: "Time (a.u.)",
          display: true,
        },
      },
      y: {
        min: 0,
        max: 2,
        type: "linear",
        position: "bottom",
        title: {
          text: "Distance (rods lengths)",
          display: true,
        },
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  },
});

const createCanvas = () => {
  width = (window.innerWidth * 2) / 3;
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

const draw = () => {
  ctx.strokefillStyle = "none";
  ctx.fillStyle = "black";
  ctx.fillRect(-width / 2, -height / 2, width, height);

  ctx.lineWidth = 1;
  for (const s of springs) {
    ctx.strokeStyle = s.k == rigidk ? "white" : "red";
    ctx.beginPath();
    ctx.moveTo(p[s.i].x, p[s.i].y);
    ctx.lineTo(p[s.j].x, p[s.j].y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 100, 100, 0.5)";
  ctx.beginPath();
  ctx.moveTo(p[0].x, p[0].y);
  ctx.lineTo(p[p.length - 1].x, p[p.length - 1].y);
  ctx.stroke();

  ctx.fillStyle = "white";
  for (const pt of p) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
    ctx.fill();
  }
};

const rigiddist = 200;

const p = [
  //   { x: 0, y: -2 * dist },
  { x: 0, y: -rigiddist },
  { x: 0, y: 0 },
  { x: 0, y: rigiddist },
  //   { x: 0, y: 2 * rigiddist },
];

const v0 = 300;
const step = 1 / 120;
const rigidk = 10000;

let minDist = 2 * rigiddist;

const v = [
  { x: (2 * v0) / 3, y: 0 },
  { x: -v0 / 3, y: 0 },
  { x: -v0 / 3, y: 0 },
  //   { x: 0, y: 0 },
  //   { x: 0, y: 0 },
];

const springs = [
  { i: 0, j: 1, k: rigidk, dist: rigiddist },
  { i: 1, j: 2, k: rigidk, dist: rigiddist },
  //   { i: 2, j: 3, k: rigidk, dist: rigiddist },
  //   { i: 0, j: 3, k: 2, dist: 0 },
  //   { i: 0, j: 2, k: 4, dist: 2 * rigiddist - 50 },
  //   { i: 1, j: 3, k: 4, dist: 2 * rigiddist - 50 },
];

const f = (i, j, k, dist) => {
  const d = Math.sqrt(
    Math.pow(p[i].x - p[j].x, 2) + Math.pow(p[i].y - p[j].y, 2)
  );
  const m = (k * (d - dist)) / d;

  return { x: m * (p[i].x - p[j].x), y: m * (p[i].y - p[j].y) };
};

let t = 0;
let recordData = 0;
let dataRecordRate = 5;

const update = () => {
  for (let i = 0; i < p.length; i++) {
    p[i].x += v[i].x * step;
    p[i].y += v[i].y * step;
  }

  const d = Math.sqrt(
    Math.pow(p[0].x - p[p.length - 1].x, 2) +
      Math.pow(p[0].y - p[p.length - 1].y, 2)
  );

  minDist = Math.min(minDist, d);

  for (const s of springs) {
    const ff = f(s.i, s.j, s.k, s.dist);
    v[s.j].x += ff.x * step;
    v[s.j].y += ff.y * step;

    v[s.i].x -= ff.x * step;
    v[s.i].y -= ff.y * step;
  }

  if (recordData > dataRecordRate && t < 15) {
    distance.push({ x: t, y: d / rigiddist });
    expected.push({ x: t, y: Math.sqrt(5 / 2) });
    t += 0.1;
    chart.update();
    recordData = 0;
  }
  recordData++;
};

createCanvas();

setInterval(main, step * 1000);
