// Swinging pulley
const m = 1,
  M = 3;
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

// t, th, th', x, x'
const rk4 = new RK4(
  5,
  [0, 2, 0, 5, 0],
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

const data = rk4.runUntil(6, 10);

const ctx = document.getElementById("myChart");

const chartData = {
  datasets: [],
};

for (let i = 1; i < data[0].length; i++) {
  const compiledData = [];
  for (const d of data) {
    compiledData.push({ x: d[0], y: d[i] });
  }
  chartData.datasets.push({
    label: vars[i],
    data: compiledData,
    backgroundColor:
      "rgb(" + Math.floor((255 * i) / data[0].length) + ", 100, 100)",
  });
}

new Chart(ctx, {
  type: "scatter",
  data: chartData,
  options: {
    scales: {
      x: {
        type: "linear",
        position: "bottom",
      },
    },
  },
});
