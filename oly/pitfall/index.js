const board = document.getElementById("board");
let canvas, ctx;

const ctxChart = document.getElementById("chart");
const ctxChartBottom = document.getElementById("chart-bottom");

const chartData = {
  datasets: [],
};

const chartDataBottom = {
  datasets: [],
};

const createCanvas = () => {
  width = (2 * window.innerWidth) / 3;
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
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, 0);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.moveTo(-width / 2, 0);
  ctx.lineTo(width / 2, 0);
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x1, y1, 4, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x2, 0, 4, 0, 2 * Math.PI);
  ctx.fill();
};

const R = 200;
const k = 5000;
const v0 = 0.5;
const step = 1 / 5000;
const skipDraw = 100;

const g = 10;

let x1 = 0,
  y1 = -R + g / k;
let vx1 = v0;
let vy1 = 0;
let x2 = 0;
let vx2 = -v0;

let posY = 0;
let posX = 0;

let forces = [];
let maxForces = 1;
let totalForces = 0;

let dataRecordRate = 5;
let recordData = 0;

let output = "";

const angVel = [];
const tension = [];
chartData.datasets.push({
  label: "Angular Velocity",
  data: angVel,
  borderColor: "rgb(255, 100, 100)",
});

chartDataBottom.datasets.push({
  label: "Tension",
  data: tension,
  borderColor: "rgb(100, 100, 255)",
});

const expected = [];
const expectedT = [];
for (let t = 0; t < 2 * Math.PI; t += 0.01) {
  expected.push({
    x: (t * 180) / Math.PI,
    y: Math.sqrt(
      (((4 * g) / R) * (1 - Math.cos(t))) / (1 + Math.pow(Math.sin(t), 2))
    ),
  });
  expectedT.push({
    x: (t * 180) / Math.PI,
    y:
      (-21 * Math.cos(t) + Math.cos(3 * t) + 16) /
      Math.pow(Math.cos(2 * t) - 3, 2),
  });
}
chartData.datasets.push({
  label: "Expected",
  data: expected,
  borderColor: "rgb(100, 255, 100)",
});

chartDataBottom.datasets.push({
  label: "Expected",
  data: expectedT,
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
    aspectRatio: (window.innerWidth / 3 / window.innerHeight) * 2,
    scales: {
      x: {
        min: 0,
        ticks: {
          stepSize: 45,
        },
        type: "linear",
        position: "bottom",
        title: {
          text: "Angle from Vertical (degrees)",
          display: true,
        },
      },
      y: {
        min: 0,
        ticks: {
          stepSize: 0.1,
        },
        type: "linear",
        position: "bottom",
        title: {
          text: "Angular Velocity (rad/s)",
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

chartBottom = new Chart(ctxChartBottom, {
  type: "line",
  data: chartDataBottom,
  options: {
    animation: {
      duration: 0,
    },
    maintainAspectRatio: true,
    aspectRatio: (window.innerWidth / 3 / window.innerHeight) * 2,
    scales: {
      x: {
        min: 0,
        ticks: {
          stepSize: 45,
        },
        type: "linear",
        position: "bottom",
        title: {
          text: "Angle from Vertical (degrees)",
          display: true,
        },
      },
      y: {
        min: -1,
        ticks: {
          stepSize: 1,
        },
        type: "linear",
        position: "bottom",
        title: {
          text: "Tension (mg)",
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

const update = () => {
  if (posX == 3) return;
  for (let i = 0; i < skipDraw; i++) {
    x1 += vx1 * step;
    y1 += vy1 * step;
    x2 += vx2 * step;

    if (y1 > 0) {
      posY++;
      //   if (posY == maxForces / 2) console.log(totalForces / forces.length / g);
    }
    if (x1 > 0 && posX == 0) {
      posX = 1;
    }
    if (x1 < 0 && posX == 1) {
      posX = 2;
    }
    if (x1 > 0 && posX == 2) {
      posX = 3;
    }

    const d = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1, 2));
    const m = (k * (d - R)) / d;
    lastForce = m * d;
    forces.push(m * d);
    totalForces += m * d;
    if (forces.length > maxForces) {
      totalForces -= forces.splice(0, 1);
    }

    const ff = { x: m * (x2 - x1), y: m * -y1 };

    vx1 += ff.x * step;
    vy1 += ff.y * step;
    vy1 += g * step;

    vx2 -= ff.x * step;

    // console.log();
  }
  let theta = Math.atan2(-y1, x1 - x2);
  //   output += 2 * Math.PI - theta + "\t" + totalForces / forces.length / g + "\n";

  if (recordData > dataRecordRate) {
    // if (theta < 0) theta += 2 * Math.PI;
    let w = (Math.cos(theta) * vy1 + Math.sin(theta) * (vx1 - vx2)) / R;
    theta -= Math.PI / 2;
    if (theta < 0) theta += 2 * Math.PI;
    angVel.push({
      x: ((2 * Math.PI - theta) * 180) / Math.PI,
      y: w,
    });
    tension.push({
      x: ((2 * Math.PI - theta) * 180) / Math.PI,
      y: totalForces / forces.length / g,
    });
    chartBottom.update();
    chart.update();
    recordData = 0;
  }
  recordData++;

  //   if (totalForces / forces.length / g >= 8.9) {
  //     console.log(totalForces / forces.length / g);
  //     console.log(output);
  //   }
};

createCanvas();

setInterval(main, step * 1000);
