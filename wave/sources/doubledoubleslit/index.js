const board = document.getElementById("board");
let canvas, ctx;

let colorScale = 255 / 400; // color units / magnitude units
const step = 1 / 60; // sec / tick
const skip = 3;

const resolution = 5; // height of each simulation grid
let heightCells; // number of cells that span the height of the screen
let widthCells;

let grid, gridVel;
const c = 800; // wave speed
const lengthScale = 10;
const initialSize = 5;
let n;

const m = 100;
let t = 0;

let sources;

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
    { x: widthCells / 4, y: (heightCells * 5) / 16, w: 1000 },
    { x: widthCells / 4, y: (heightCells * 6) / 16, w: 1000 },
    { x: widthCells / 4, y: (heightCells * 10) / 16, w: 1000 },
    { x: widthCells / 4, y: (heightCells * 11) / 16, w: 1000 },
  ];

  //   for (
  //     let i = Math.floor(heightCells / 2) - initialSize;
  //     i <= Math.floor(heightCells / 2) + initialSize;
  //     i++
  //   ) {
  //     for (
  //       let j = Math.floor(widthCells / 2) - initialSize;
  //       j <= Math.floor(widthCells / 2) + initialSize;
  //       j++
  //     ) {
  //       grid[i][j] = 10;
  //     }
  //   }

  //   for (
  //     let i = Math.floor(heightCells / 2) - initialSize;
  //     i <= Math.floor(heightCells / 2) + initialSize;
  //     i++
  //   ) {
  //     for (
  //       let j = Math.floor(widthCells / 2) - initialSize;
  //       j <= Math.floor(widthCells / 2) + initialSize;
  //       j++
  //     ) {
  //       grid[i][j] = 10;
  //     }
  //   }
  draw();
};

window.addEventListener("resize", (e) => {
  createCanvas();
});

const main = () => {
  //   update();
  draw();
};

const draw = () => {
  ctx.strokeStyle = "none";
  ctx.fillStyle = "black";
  ctx.fillRect(-width / 2, -height / 2, width, height);
  t += step;

  for (let i = 0; i < heightCells; i++) {
    for (let j = 0; j < widthCells; j++) {
      //   let nOffset = (n[i][j] - 1) * 100;
      let red = 0,
        blue = 0;
      grid[i][j] = 0;
      for (const { x, y, w } of sources) {
        grid[i][j] +=
          m *
          Math.sin(
            (c / w) * Math.sqrt((x - j) * (x - j) + (y - i) * (y - i)) -
              (w * t) / 100
          );
      }
      if (grid[i][j] < 0) red = Math.min(-grid[i][j] * colorScale, 255);
      else blue = Math.min(grid[i][j] * colorScale, 255);
      ctx.fillStyle = "rgb(" + red + "," + "0" + "," + blue + ")";
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
    // boundary condition
    return 0;
  }
  return grid[i][j];
};

// const update = () => {
//   for (let s = 0; s < skip; s++) {
//     t += step;
//     const newGrid = [];
//     let maxMag = 0;
//     for (let i = 0; i < heightCells; i++) {
//       newGrid[i] = [];
//       for (let j = 0; j < widthCells; j++) {
//         newGrid[i][j] = grid[i][j];
//         let dx =
//           (getGridVal(i, j - 1) + getGridVal(i, j + 1) - 2 * getGridVal(i, j)) /
//           resolution /
//           resolution /
//           lengthScale /
//           lengthScale; // d^2f/dx^2
//         let dy =
//           (getGridVal(i - 1, j) + getGridVal(i + 1, j) - 2 * getGridVal(i, j)) /
//           resolution /
//           resolution /
//           lengthScale /
//           lengthScale; // d^2f/dy^2
//         gridVel[i][j] += ((c * c) / n[i][j] / n[i][j]) * (dx + dy) * step;
//         newGrid[i][j] += gridVel[i][j] * step;
//       }
//     }
//     for (let i = 0; i < heightCells; i++) {
//       for (let j = 0; j < widthCells; j++) {
//         grid[i][j] = newGrid[i][j];
//         maxMag = Math.max(grid[i][j], maxMag);
//       }
//     }

//     for (const { x, y, w } of sources) {
//       grid[Math.floor(y)][Math.floor(x)] = m * Math.sin(w * t);
//     }

//     // colorScale = 255 / maxMag;
//   }
// };

createCanvas();

setInterval(main, step * 1000);
