const board = document.getElementById("board");
let canvas, ctx;

let colorScale = 255 / 30; // color units / magnitude units
const step = 1 / 30; // sec / tick
const skip = 5;

const resolution = 5; // height of each simulation grid
let heightCells; // number of cells that span the height of the screen
let widthCells;

let grid, gridVel;
const c = 200; // wave speed
const lengthScale = 5;
const initialSize = 5;
let n, invnsq;

const w = 2,
  m = 30,
  v = 9,
  gamma = 0.2;
let t = 0;
let newGrid;

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
  invnsq = [];
  newGrid = [];
  for (let i = 0; i < heightCells; i++) {
    grid[i] = [];
    gridVel[i] = [];
    n[i] = [];
    invnsq[i] = [];
    newGrid[i] = [];
    for (let j = 0; j < widthCells; j++) {
      grid[i][j] = 0;
      gridVel[i][j] = 0;
      newGrid[i][j] = 0;
      n[i][j] = 1;
      //   if (i < heightCells / 4) n[i][j] = 2;
      //   n[i][j] = 1 + 2 * (1 / Math.sqrt(i / heightCells + 0.1) - 1);
      invnsq[i][j] = 1 / Math.pow(n[i][j], 2);
      //   else n[i][j] = (i/heightCells-.25)*;
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
      let nOffset = ((n[i][j] - 1) * 100) / 1.5;
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

const invrl = Math.pow(1 / resolution / lengthScale, 2);
let lastTime = Date.now();

const update = () => {
  const curstep = Math.min((Date.now() - lastTime) / 1000, 0.04);
  lastTime = Date.now();
  const ccstep = c * c * curstep * invrl;
  for (let s = 0; s < skip; s++) {
    t += curstep;
    let maxMag = 0;
    for (let i = 0; i < heightCells; i++) {
      for (let j = 0; j < widthCells; j++) {
        newGrid[i][j] = grid[i][j];
        // let dx =
        //   getGridVal(i, j - 1) + getGridVal(i, j + 1) - 2 * getGridVal(i, j); // d^2f/dx^2
        // let dy =
        //   getGridVal(i - 1, j) + getGridVal(i + 1, j) - 2 * getGridVal(i, j); // d^2f/dy^2
        gridVel[i][j] +=
          ccstep *
            invnsq[i][j] *
            (getGridVal(i - 1, j) +
              getGridVal(i + 1, j) -
              4 * getGridVal(i, j) +
              getGridVal(i, j - 1) +
              getGridVal(i, j + 1)) -
          gamma * gridVel[i][j] * curstep;
        newGrid[i][j] += gridVel[i][j] * curstep;
        // if (i > (heightCells * 15) / 16) newGrid[i][j] *= 0.99;
        if (i < heightCells * 0.125)
          newGrid[i][j] *= 1 - 0.03 * (1 - 8 * (i / heightCells));
        else if (i > heightCells * 0.875)
          newGrid[i][j] *= 1 - 0.03 * (1 - 8 * (1 - i / heightCells));
        if (j > widthCells * 0.9)
          newGrid[i][j] *= 1 - 0.03 * (1 - 10 * (1 - j / widthCells));
        else if (j < widthCells * 0.1)
          newGrid[i][j] *= 1 - 0.03 * (1 - 10 * (j / widthCells));
        newGrid[i][j] *= 0.9985;
      }
    }
    for (let i = 0; i < heightCells; i++) {
      for (let j = 0; j < widthCells; j++) {
        grid[i][j] = newGrid[i][j];
        // maxMag = Math.max(grid[i][j], maxMag);
      }
    }
    for (let i = -7; i <= 7; i += 1) {
      grid[Math.floor(heightCells / 2) + i][Math.floor(widthCells / 4)] =
        m * Math.sin(w * t - i / 5);
    }

    // colorScale = 255 / maxMag;
  }
};

createCanvas();

setInterval(main, step * 1000);
