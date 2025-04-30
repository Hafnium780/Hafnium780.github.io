const board = document.getElementById("board");
let canvas, ctx;

let colorScale = 255 / 30; // color units / magnitude units
const step = 1 / 30; // sec / tick
const skip = 30;

const resolution = 1; // height of each simulation grid
let heightCells; // number of cells that span the height of the screen
let widthCells;

let grid, gridVel;
const c = 800; // wave speed
const lengthScale = 25;
const initialSize = 5;
let n, invnsq;

const w = 2,
  m = 40,
  v = 30,
  gamma = 0;
let t = 0;
let newGrid;

const gpu = new GPU.GPU();

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
  computeNextVel.setOutput([widthCells, heightCells]);
  computeNextGrid.setOutput([widthCells, heightCells]);
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
      n[i][j] = 1 + 2 * (1 / Math.sqrt(i / heightCells + 0.1) - 1);
      invnsq[i][j] = 1 / Math.pow(n[i][j], 2);
      //   else n[i][j] = (i/heightCells-.25)*;
    }
  }
  draw();
};

// window.addEventListener("resize", (e) => {
//   createCanvas();
// });

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

const computeNextVel = gpu.createKernel(function (
  grid,
  gridVel,
  invnsq,
  ccstep,
  curstep,
  gamma,
  heightCells,
  widthCells
) {
  //   let v1 =
  //     this.thread.y > 0
  //       ? grid[this.thread.y - 1][this.thread.x]
  //       : grid[this.thread.y][this.thread.x];
  //   let v2 =
  //     this.thread.x > 0
  //       ? grid[this.thread.y][this.thread.x - 1]
  //       : grid[this.thread.y][this.thread.x];
  //   let v3 =
  //     this.thread.y < heightCells - 1
  //       ? grid[this.thread.y + 1][this.thread.x]
  //       : grid[this.thread.y][this.thread.x];
  //   let v4 =
  //     this.thread.x < widthCells - 1
  //       ? grid[this.thread.y][this.thread.x + 1]
  //       : grid[this.thread.y][this.thread.x];
  //   return (
  //     gridVel[this.thread.y][this.thread.x] +
  //     ccstep *
  //       invnsq[this.thread.y][this.thread.x] *
  //       (v1 + v2 + v3 + v4 - 4 * grid[this.thread.y][this.thread.x]) -
  //     gamma * gridVel[this.thread.y][this.thread.x] * curstep
  //   );
  return (
    gridVel[this.thread.y][this.thread.x] +
    ccstep *
      invnsq[this.thread.y][this.thread.x] *
      (grid[this.thread.y - 1][this.thread.x] +
        grid[this.thread.y + 1][this.thread.x] +
        grid[this.thread.y][this.thread.x - 1] +
        grid[this.thread.y][this.thread.x + 1] -
        4 * grid[this.thread.y][this.thread.x]) -
    gamma * gridVel[this.thread.y][this.thread.x] * curstep
  );
});

const computeNextGrid = gpu.createKernel(function (grid, gridVel, curstep) {
  return (
    grid[this.thread.y][this.thread.x] +
    gridVel[this.thread.y][this.thread.x] * curstep
  );
});

const update = () => {
  const curstep = Math.min((Date.now() - lastTime) / 1000, 0.02);
  lastTime = Date.now();
  const ccstep = c * c * curstep * invrl;

  for (let s = 0; s < skip; s++) {
    t += curstep;

    gridVel = computeNextVel(
      grid,
      gridVel,
      invnsq,
      ccstep,
      curstep,
      gamma,
      heightCells,
      widthCells
    );

    // for (let i = 0; i < heightCells; i++) {
    //   for (let j = 0; j < widthCells; j++) {
    //     if (gridVel[i][j] == undefined) {
    //       console.log(i, j);
    //       break;
    //     }
    //   }
    // }
    grid = computeNextGrid(grid, gridVel, curstep);

    let n = 4;
    for (let i = -n; i <= n; i++) {
      grid[Math.floor((heightCells * 2) / 5)][
        Math.floor(
          v * t +
            widthCells / 4 -
            widthCells * Math.floor((v * t + widthCells / 4) / widthCells)
        ) + i
      ] = m * (1 - Math.abs(i / n));
    }
  }
};

createCanvas();

setInterval(main, step * 1000);
// setTimeout(main, step * 1000);
