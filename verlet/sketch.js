let particles = [];
let cellSize = 10;
let delRadius = 10;
let stepCount = 30;
let mouseForce = 200;
let maxa = 100;
let maxMouseA = 4000;
let k = 300;
let drag = 0.004;
let dt = 0.01;
let offset = 200, offsetWidth, offsetHeight, xCount, yCount;
function setup() {
  createCanvas(600,600);
  offsetWidth = width - offset*2;
  offsetHeight = height - offset*2;
  xCount = floor(offsetWidth / cellSize);
  yCount = floor(offsetHeight / cellSize);
  for (let i = 0; i < yCount; i++) {
    particles[i] = [];
    for (let j = 0; j < xCount; j++) {
      particles[i][j] = new Particle(offset + j*cellSize, offset + i*cellSize, 10);
    }
  }
}

function valid(x, y) {
  return x < xCount && y < yCount && x >= 0 && y >= 0 && particles[y][x];
}

const mx = [-1, 0, 1, 0];
const my = [0, -1, 0, 1];

let mouseDown = false;
function mousePressed() {
  mouseDown = true;
}

function mouseReleased() {
  mouseDown = false;
}

let prevMouseX;
let prevMouseY;
let mousedx = 0;
let mousedy = 0;
let draggedParticle = undefined;

function mouseDragged() {
  if (prevMouseX) mousedx = mouseX - prevMouseX;
  if (prevMouseY) mousedy = mouseY - prevMouseY;
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function draw() {
  background(0);
  stroke(255);
  strokeWeight(1);
  fill(255);
  
  for (let step = 0; step < stepCount; step++) {
    for (let y = 1; y < yCount; y++) {
      for (let x = 0; x < xCount; x++) {
        if (!valid(x, y)) continue;
        let p1 = particles[y][x];
        let ax = 0;
        let ay = 2;
        for (let m = 0; m < 4; m++) {
          let nx = x + mx[m];
          let ny = y + my[m];
          if (valid(nx, ny)) {
            let p2 = particles[ny][nx];
            let d = sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2);
            let unvecx = (p1.x-p2.x)/d;
            let unvecy = (p1.y-p2.y)/d;
            let a = k * (d - cellSize)/p1.m;
            // if (a > 0) a = maxa;
            // if (a < 0) a = -maxa;
            ax -= a * unvecx;
            ay -= a * unvecy;
            // console.log(f)
          }
        }
        if (ax**2 + ay**2 > maxa**2) {
          a = sqrt(ax**2 + ay**2)
          ax = ax/a*maxa;
          ay = ay/a*maxa;
        }
        p1.update(ax, ay, drag, dt);
      }
    }
  }

  if (mouseDown) {
    if (keyIsDown(SHIFT)) {
      for (let y = 1; y < yCount; y++) {
        for (let x = 0; x < xCount; x++) {
          if (!valid(x, y)) continue;
          let p = particles[y][x];
          if ((p.x - mouseX)**2 + (p.y - mouseY)**2 < delRadius**2) {
            particles[y][x] = undefined;
          }
        }
      }
    }
    else {
      if (draggedParticle) {
        ax = mouseForce*(mouseX - draggedParticle.x);
        ay = mouseForce*(mouseY - draggedParticle.y)
        if (ax**2 + ay**2 > maxMouseA**2) {
          a = sqrt(ax**2 + ay**2)
          ax = ax/a*maxMouseA;
          ay = ay/a*maxMouseA;
        }
        draggedParticle.update(ax, ay, drag, dt);
        // draggedParticle.x = draggedParticle.px = mouseX;
        // draggedParticle.y = draggedParticle.py = mouseY;
      }
      else {
        closest = undefined;
        closest_dist = delRadius**2;
        for (let y = 1; y < yCount; y++) {
          for (let x = 0; x < xCount; x++) {
            if (!valid(x, y)) continue;
            let p = particles[y][x];
            if ((p.x - mouseX)**2 + (p.y - mouseY)**2 < closest_dist) {
              closest_dist = (p.x - mouseX)**2 + (p.y - mouseY)**2;
              closest = p;
            }
          }
        }
        if (closest) {
          draggedParticle = closest;
        }
      }
    }
  }
  else {
    draggedParticle = undefined;
  }
  
  for (let y = 0; y < yCount; y++) {
    for (let x = 0; x < xCount; x++) {
      if (!valid(x, y)) continue;
      for (let m = 2; m < 4; m++) {
        let nx = x + mx[m];
        let ny = y + my[m];
        if (valid(nx, ny)) {
          line(particles[y][x].x, particles[y][x].y, particles[ny][nx].x, particles[ny][nx].y);
        }
      }
      // circle(particles[y][x].x, particles[y][x].y, 3);
    }
  }
}
