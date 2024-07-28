const board = document.getElementById("board");
let canvas, ctx;

let colorScale = 255 / 40; // color units / magnitude units
const step = 1 / 60; // sec / tick
const skip = 5;

const resolution = 5; // height of each simulation grid
let heightCells; // number of cells that span the height of the screen
let widthCells;

let grid, gridVel;
const c = 3000; // wave speed
const lengthScale = 50;
const initialSize = 5;
let n;

const w = 10,
  m = 40;
let t = 0;

let laser;

// let sources;

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

  heightCells = height / resolution;
  widthCells = width / resolution;
  grid = [];
  gridVel = [];
  n = [];
  for (let i = 0; i < heightCells; i++) {
    grid[i] = [];
    gridVel[i] = [];
    n[i] = [];
    for (let j = 0; j < widthCells; j++) {
      grid[i][j] = 0;
      gridVel[i][j] = 0;
      n[i][j] = 1;
    }
  }
  laser = [
    { x: widthCells / 2, y: heightCells / 2 - 2 },
    { x: widthCells / 2, y: heightCells / 2 - 5 },
    { x: widthCells / 6, y: heightCells / 2 - 5 },
    { x: widthCells / 6, y: heightCells / 2 + 5 },
    { x: widthCells / 2, y: heightCells / 2 + 5 },
    { x: widthCells / 2, y: heightCells / 2 + 2 },
  ];

  for (let i = Math.ceil(widthCells / 6); i < widthCells / 2; i++) {
    for (let j = Math.ceil(heightCells / 2 - 5); j < heightCells / 2 + 5; j++) {
      grid[j][i] = Math.random() * 2 * m - m;
    }
  }
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
  ctx.strokeStyle = "none";
  ctx.fillStyle = "black";
  ctx.fillRect(-width / 2, -height / 2, width, height);

  for (let i = 0; i < heightCells; i++) {
    for (let j = 0; j < widthCells; j++) {
      let nOffset = (n[i][j] - 1) * 100;
      let red = nOffset,
        blue = nOffset;
      if (grid[i][j] < 0)
        red = Math.min(-grid[i][j] * colorScale + nOffset, 255);
      else blue = Math.min(grid[i][j] * colorScale + nOffset, 255);
      ctx.fillStyle = "rgb(" + red + "," + nOffset + "," + blue + ")";
      ctx.fillRect(
        -width / 2 + j * resolution,
        -height / 2 + i * resolution,
        resolution,
        resolution
      );
    }
  }
  ctx.strokeStyle = "rgb(255, 255, 255)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const { x, y } of laser) {
    ctx.lineTo(x * resolution - width / 2, y * resolution - height / 2);
  }
  ctx.stroke();
};

const getGridVal = (i, j) => {
  if (i < 0 || i >= heightCells || j < 0 || j >= widthCells) {
    // boundary condition: pass-through, for now guaranteed only one of above conditions is satisfied
    if (i < 0) return grid[i + 1][j];
    if (j < 0) return grid[i][j + 1];
    if (i >= heightCells) return grid[i - 1][j];
    if (j >= widthCells) return grid[i][j - 1];
    return 0;
  }
  return grid[i][j];
};

const update = () => {
  for (let s = 0; s < skip; s++) {
    t += step;
    const newGrid = [];
    let maxMag = 0;
    for (let i = 0; i < heightCells; i++) {
      newGrid[i] = [];
      for (let j = 0; j < widthCells; j++) {
        newGrid[i][j] = grid[i][j];
        let dx =
          (getGridVal(i, j - 1) + getGridVal(i, j + 1) - 2 * getGridVal(i, j)) /
          resolution /
          resolution /
          lengthScale /
          lengthScale; // d^2f/dx^2
        let dy =
          (getGridVal(i - 1, j) + getGridVal(i + 1, j) - 2 * getGridVal(i, j)) /
          resolution /
          resolution /
          lengthScale /
          lengthScale; // d^2f/dy^2
        gridVel[i][j] += ((c * c) / n[i][j] / n[i][j]) * (dx + dy) * step;
        newGrid[i][j] += 3000 * (dx + dy) * step;
        newGrid[i][j] += gridVel[i][j] * step;
      }
    }
    for (let i = 0; i < heightCells; i++) {
      for (let j = 0; j < widthCells; j++) {
        let factor = 1;
        if (
          i > Math.floor(heightCells / 2 - 5) &&
          i < Math.floor(heightCells / 2 + 5) &&
          j > widthCells / 6 &&
          j < widthCells / 2
        )
          factor = 1.003;
        grid[i][j] = newGrid[i][j] * factor;
        maxMag = Math.max(grid[i][j], maxMag);
      }
    }

    // for (let i = 0; i < heightCells; i++) {
    //   grid[i][0] = m * Math.sin(w * t);
    // }

    for (
      let i = Math.floor(heightCells / 2 - 5);
      i < heightCells / 2 + 5;
      i++
    ) {
      grid[i][Math.floor(widthCells / 6)] = 0;
    }
    for (
      let i = Math.floor(heightCells / 2 - 5);
      i < heightCells / 2 - 2;
      i++
    ) {
      grid[i][Math.floor(widthCells / 2)] = 0;
    }
    for (
      let i = Math.floor(heightCells / 2 + 2);
      i < heightCells / 2 + 5;
      i++
    ) {
      grid[i][Math.floor(widthCells / 2)] = 0;
    }
    for (let j = Math.floor(widthCells / 6); j < widthCells / 2; j++) {
      grid[Math.floor(heightCells / 2 - 5)][j] = 0;
      grid[Math.floor(heightCells / 2 + 5)][j] = 0;
    }

    // colorScale = 255 / maxMag;
  }
};

createCanvas();

setInterval(main, step * 1000);
