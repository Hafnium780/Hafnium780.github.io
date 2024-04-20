const body = document.body;
const slider = document.getElementById("slider");
const TWOPI = Math.PI * 2;
let width;
let height;
let canvas, ctx;

const map = new Map();
const ball = new Ball(0, 1000, 0.001, 20);
let pt = Date.now();

let spd = 4;
let frameRateCapture = 0;
let frameRateCaptureTotal;

let stepDt = 5;

let fullControl = false;
let globalTime = 0;
let stoppedTime = 0;
let maxProjectionSteps = 5000;
let projectStep = 10;

let skipUpdate = false;
let launchVel = 0;
let launchAng = 0;

// let showPlanetProjection = false;

// none ball
let focusMode = "ball";

map.generateRandom();
updateHeights();

function update() {
  let ct = Date.now();
  if (frameRateCapture > 0) {
    frameRateCapture--;
    if (frameRateCapture === 0) printFrameRate();
  }
  if (skipUpdate) {
    skipUpdate = false;
    return;
  }
  if (ct - pt > 100) {
    pt = ct;
    return;
  }
  const dt = 60;
  keyboard(dt);
  if (!fullControl) updateMap(Math.floor((spd * dt) / 100));
  draw();
  // if (mouseDown) shoot(ball);
  // ball.update((ct - pt) / 1000, map.walls);
  // pt = ct;
}

function updateMap(time) {
  globalTime += time;
  if (fullControl && globalTime < stoppedTime) {
    time += stoppedTime - globalTime;
    globalTime = stoppedTime;
  }
  for (let i = 0; i < Math.abs(time); i++) {
    map.update(time < 0 ? -stepDt : stepDt);
    ball.update(time < 0 ? -stepDt : stepDt);
  }
}

function frameRate(x = 100) {
  frameRateCapture = x;
  frameRateCaptureTotal = x;
  frameRateStartTime = Date.now();
}

function printFrameRate() {
  console.log(
    "Frame Rate Over Last " +
      frameRateCaptureTotal +
      " Frames: " +
      (frameRateCaptureTotal / (Date.now() - frameRateStartTime)) * 1000
  );
}

function updateHeights() {
  createCanvas();
}

let interval = setInterval(update, 1000 / 60);
// update();

document.addEventListener("visibilitychange", () => {
  keydown = {};
  // clearInterval(sliderMoveInterval);
  mouseDownLeft = false;
  mouseDownRight = false;
});

function ballStop() {
  fullControl = true;
  stoppedTime = globalTime;
  launchVel = 7;
  launchAng = Math.PI / 2;
  // launchAng = 0;
}

function ballStart() {
  fullControl = false;
}
