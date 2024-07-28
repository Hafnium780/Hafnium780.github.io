const board = document.getElementById("board");
let canvas, ctx;

let colorScale = 255 / 40; // color units / magnitude units
const step = 1 / 60; // sec / tick
const skip = 3;

const resolution = 5; // height of each simulation grid
let heightCells; // number of cells that span the height of the screen
let widthCells;

let grid, gridVel;
const c = 400; // wave speed
const lengthScale = 10;
const initialSize = 5;
let n;

const m = 100;
let t = 0;

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
      //   if (j < widthCells / 2) n[i][j] = 1;
      //   else n[i][j] = 1.33;
    }
  }
  sources = [
    { x: widthCells / 4, y: heightCells / 3, w: 4 },
    { x: widthCells / 4, y: (heightCells * 2) / 3, w: 4 },
  ];

  for (
    let i = Math.floor(heightCells / 2) - initialSize;
    i <= Math.floor(heightCells / 2) + initialSize;
    i++
  ) {
    for (
      let j = Math.floor(widthCells / 2) - initialSize;
      j <= Math.floor(widthCells / 2) + initialSize;
      j++
    ) {
      grid[i][j] = 100;
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
        newGrid[i][j] += gridVel[i][j] * step;
      }
    }
    for (let i = 0; i < heightCells; i++) {
      for (let j = 0; j < widthCells; j++) {
        grid[i][j] = newGrid[i][j];
        maxMag = Math.max(grid[i][j], maxMag);
      }
    }

    // colorScale = 255 / maxMag;
  }
};

createCanvas();

setInterval(main, step * 1000);
