let d = 400;

let pts = {};

let pd = 30;
let pc;
let mult = 3;
let off = 0;

let n = 4;
let vert = {};

let sldn;
let sldmult;
let sldpd;
let label;

let a;
let t;
function setup() {
  createCanvas(500, 500);
  angleMode(DEGREES);
  label = createDiv('&nbsp;&nbsp;n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mult&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;points');
  sldn = createSlider(3, 15, 4, 1);
  sldmult = createSlider(1, 10, 2, 0.1);
  sldpd = createSlider(5, 50, 30, 1);
  redr();
  px = random();
}

let px;
let cnt = 0;
function draw() {
  if (sldn.value() != n || sldmult.value() != mult || sldpd.value() != pd) {
    n = sldn.value();
    mult = sldmult.value();
    pd = sldpd.value();
    redr();
  }
  // px += 0.01;
  // mult = noise(px)*8+2;
  // // pc += 1;
  // if (cnt > 10) {
  //   n += floor(random(-1, 1.618));
  //   if (n < 3) n = 3;
  //   cnt = 0;
  // }
  // cnt++;
  // redr();
}

function redr() {
  t = 90-360/(2*n);
  // t = 0;
  off = 1/n/2;
  pc = pd*n;
  background(0);
  stroke(255);
  calcpts();
  lines();
}

function calcpoly() {
  for (let i = 0; i < n; i++) {
    vert[i] = createVector(cos(i/n*360+t), sin(i/n*360+t));
  }
}

function itp(i) {
  i = i % 1;
  let ret;
// /* circle */
//   if (mode == 0) ret = createVector(d/2*cos(360*i), d/2*sin(360*i));
// /* rect */
//   else if (mode == 1) {
//     if (i >= 0 && i <= 0.25) ret = createVector(i/0.25*d - d/2, d/2);
//     else if (i >= 0.25 && i <= 0.5) ret = createVector(d/2, d/2 - (i-0.25)/0.25*d);
//     else if (i >= 0.5 && i <= 0.75) ret = createVector(d/2 - (i-0.5)/0.25*d, -d/2);
//     else if (i >= 0.75 && i <= 1) ret = createVector(-d/2, (i-0.75)/0.25*d - d/2);
//   }
  ret = createVector(0, 0);
  ret.x = d/2*((-vert[floor(i*n)%n].x + vert[(floor(i*n)+1)%n].x)*(i*n-floor(i*n)) + vert[floor(i*n)].x);
  ret.y = d/2*((-vert[floor(i*n)%n].y + vert[(floor(i*n)+1)%n].y)*(i*n-floor(i*n)) + vert[floor(i*n)].y);
  
  ret.x += width/2;
  ret.y += height/2;
  return ret;
}

function li(x) {
  let fpt = itp(x*mult/pc+off);
  line(pts[x].x, pts[x].y, fpt.x, fpt.y);
}

function calcpts() {
  calcpoly();
  push();
  for (let i = 0; i < pc; i++) {
    pts[i] = itp(i/pc+off);
  }
  pop();
}

function border() {
  for (let i = 1; i < pc; i++) { 
    stroke(255*i/pc, 0, 255*(1-i/pc));
    line(pts[i].x, pts[i].y, pts[i-1].x, pts[i-1].y);
  }
  line(pts[0].x, pts[0].y, pts[pc-1].x, pts[pc-1].y);
}

function lines() {
  for (let i = 1; i < pc; i++) {
    let x = i;
    li(x);
  }
  border();
}
