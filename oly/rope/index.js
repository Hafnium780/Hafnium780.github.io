const board = document.getElementById("board");
let canvas, ctx;

const ctxChart = document.getElementById("chart");

const chartData = {
  datasets: [],
};

const amplitude = [];

chartData.datasets.push({
  label: "Amplitude",
  data: amplitude,
  borderColor: "rgb(255, 100, 100)",
});

const expected = [];
chartData.datasets.push({
  label: "Expected Resonance",
  data: expected,
  borderColor: "rgb(100, 255, 100)",
});

const actual = [];
chartData.datasets.push({
  label: "Actual Resonance",
  data: actual,
  borderColor: "rgb(100, 100, 255)",
});

let res1 = 100;

const step = 1 / 120;
const ptCount = 600;
const length = 0.5;
const k = 1000;
const g = 1;
const skipDraw = 1;
const skipSim = 2500;
let w = 0.03;
let amp = 5;

let p = [];
let springs = [];
let maxDisp = 0;

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
        max: 0.25,
        type: "linear",
        position: "bottom",
        title: {
          text: "Frequency (rad/s)",
          display: true,
        },
      },
      y: {
        min: 0,
        max: 100,
        type: "linear",
        position: "bottom",
        title: {
          text: "Amplitude (a.u.)",
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
  plugins: [
    {
      afterDraw: function (chart) {
        const ctx = chart.ctx;
        const xAxis = chart.scales.x;

        const xValue = xAxis.getPixelForValue(res1);
        const yMin = chart.scales.y.getPixelForValue(0);
        const yMax = chart.scales.y.getPixelForValue(100);
        ctx.save();
        ctx.strokeStyle = "rgb(100, 255, 100)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(xValue, yMin);
        ctx.lineTo(xValue, yMax);
        ctx.stroke();
        ctx.restore();
      },
    },
    {
      afterDraw: function (chart) {
        const ctx = chart.ctx;
        const xAxis = chart.scales.x;

        const xValue = xAxis.getPixelForValue(res1 * 2.2);
        const yMin = chart.scales.y.getPixelForValue(0);
        const yMax = chart.scales.y.getPixelForValue(100);
        ctx.save();
        ctx.strokeStyle = "rgb(100, 255, 100)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(xValue, yMin);
        ctx.lineTo(xValue, yMax);
        ctx.stroke();
        ctx.restore();
      },
    },
    {
      afterDraw: function (chart) {
        const ctx = chart.ctx;
        const xAxis = chart.scales.x;

        const xValue = xAxis.getPixelForValue(res1 * 3.5);
        const yMin = chart.scales.y.getPixelForValue(0);
        const yMax = chart.scales.y.getPixelForValue(100);
        ctx.save();
        ctx.strokeStyle = "rgb(100, 255, 100)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(xValue, yMin);
        ctx.lineTo(xValue, yMax);
        ctx.stroke();
        ctx.restore();
      },
    },
    {
      afterDraw: function (chart) {
        if (w > 0.054) {
          const ctx = chart.ctx;
          const xAxis = chart.scales.x;

          const xValue = xAxis.getPixelForValue(0.051);
          const yMin = chart.scales.y.getPixelForValue(0);
          const yMax = chart.scales.y.getPixelForValue(100);
          ctx.save();
          ctx.strokeStyle = "rgb(100, 100, 255)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(xValue, yMin);
          ctx.lineTo(xValue, yMax);
          ctx.stroke();
          ctx.restore();
        }
      },
    },
    {
      afterDraw: function (chart) {
        if (w > 0.141) {
          const ctx = chart.ctx;
          const xAxis = chart.scales.x;

          const xValue = xAxis.getPixelForValue(0.138);
          const yMin = chart.scales.y.getPixelForValue(0);
          const yMax = chart.scales.y.getPixelForValue(100);
          ctx.save();
          ctx.strokeStyle = "rgb(100, 100, 255)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(xValue, yMin);
          ctx.lineTo(xValue, yMax);
          ctx.stroke();
          ctx.restore();
        }
      },
    },
    {
      afterDraw: function (chart) {
        if (w > 0.171) {
          const ctx = chart.ctx;
          const xAxis = chart.scales.x;

          const xValue = xAxis.getPixelForValue(0.168);
          const yMin = chart.scales.y.getPixelForValue(0);
          const yMax = chart.scales.y.getPixelForValue(100);
          ctx.save();
          ctx.strokeStyle = "rgb(100, 100, 255)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(xValue, yMin);
          ctx.lineTo(xValue, yMax);
          ctx.stroke();
          ctx.restore();
        }
      },
    },
  ],
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

const clearCanvas = () => {
  ctx.strokefillStyle = "none";
  ctx.fillStyle = "black";
  ctx.fillRect(-width / 2, -height / 2, width, height);
};

const draw = () => {
  clearCanvas();
  ctx.lineWidth = 1;
  for (const s of springs) {
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(p[s.i].x * 2, p[s.i].y);
    ctx.lineTo(p[s.j].x * 2, p[s.j].y);
    ctx.stroke();
  }

  //   ctx.strokeStyle = "rgba(255, 100, 100, 0.5)";
  //   ctx.beginPath();
  //   ctx.moveTo(p[0].x, p[0].y);
  //   ctx.lineTo(p[p.length - 1].x, p[p.length - 1].y);
  //   ctx.stroke();

  ctx.fillStyle = "white";
  for (const pt of p) {
    ctx.beginPath();
    ctx.arc(pt.x * 2, pt.y, 1, 0, 2 * Math.PI);
    ctx.fill();
  }
};
const reset = (first = false) => {
  clearCanvas();
  let extension = 0;
  p = [];
  springs = [];
  maxDisp = 0;
  for (let i = 0; i < ptCount; i++) {
    p.push({
      x: 0,
      y: -window.innerHeight / 4 + length * i + extension,
      vx: 0,
      vy: 0,
    });
    extension += ((ptCount - i) * g) / k;
  }

  if (first) console.log(extension + length * ptCount);
  res1 = Math.sqrt((3 * g) / (2 * (extension + length * ptCount)));

  for (let i = 0; i < ptCount - 1; i++) {
    springs.push({ i: i, j: i + 1, k: k, dist: length });
  }
};
setTimeout(() => {
  reset(true);
}, 1);

const f = (i, j, k, dist) => {
  const d = Math.sqrt(
    Math.pow(p[i].x - p[j].x, 2) + Math.pow(p[i].y - p[j].y, 2)
  );
  const m = (k * (d - dist)) / d;

  return { x: m * (p[i].x - p[j].x), y: m * (p[i].y - p[j].y) };
};

let t = 0;
let recordData = 0;
let baseDataRecordRate = 50000;
let dataRecordRate = 50000;

const update = () => {
  if (w > 0.25) return;
  for (let ss = 0; ss < skipSim; ss++) {
    // for (let s = 0; s < skipDraw; s++) {
    p[0].x = amp * Math.sin(w * t);
    for (let i = 1; i < p.length; i++) {
      p[i].x += p[i].vx * step;
      p[i].y += p[i].vy * step;
      p[i].vy += g * step;
    }
    maxDisp = Math.max(maxDisp, Math.abs(p[p.length - 1].x));

    for (const s of springs) {
      const ff = f(s.i, s.j, s.k, s.dist);
      p[s.j].vx += ff.x * step;
      p[s.j].vy += ff.y * step;

      p[s.i].vx -= ff.x * step;
      p[s.i].vy -= ff.y * step;
    }
    t += step;
    // }
    if (recordData > dataRecordRate) {
      amplitude.push({ x: w, y: maxDisp });
      w += 0.001;
      dataRecordRate = 20 / w / step;
      reset();
      t = 0;
      console.log(w);
      chart.update();
      recordData = 0;
    }
    recordData++;
  }
};

createCanvas();

setInterval(main, step * 1000);
