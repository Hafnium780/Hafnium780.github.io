let walls = [];
let rays = [];
let raycnt = 20;
let fov = 100;

let fr;

let c;
let ts = 1;
let ms = 1;
let leftBound, rightBound;

let px = 21;

let h = 250;

let wallImg;

let camF = 10;
let wallH = 10;

let camSin, camCos;

function setup() {
  createCanvas(600, 500);
  angleMode(DEGREES);
  c = new Person(width/2, h/2, 180);
  for (let i = 0; i < 4; i++) {
    addWall(random(width), random(h), random(width), random(h));
  }
  addWall(width/2-10, h/2-10, width/2-10, h/2+10);
  addWall(width/2-10, h/2+10, width/2+10, h/2+10);
  addWall(width/2+10, h/2+10, width/2+20, h/2-10);
  addWall(width/2+20, h/2-10, width/2-10, h/2-10);
  setFOV(100);
  addWall(0, 0, width, 0);
  addWall(width, 0, width, h);
  addWall(0, h, width, h);
  addWall(0, 0, 0, h);
  for (let i = 0; i < raycnt; i++) {
    rays[i] = new Ray();
  }
  fr = createP('');
}

function addWall(x1, y1, x2, y2) {
  const bp = [0, 1];
  const toAdd = [];
  for (const wall of walls) {
    const inter = intersect(x1, y1, x2, y2, wall.x1, wall.y1, wall.x2, wall.y2);
    if (inter) {
      bp.push(inter.t);
      toAdd.push(new Wall(wall.x1 + inter.u*(wall.x2-wall.x1), wall.y1 + inter.u*(wall.y2-wall.y1), wall.x2, wall.y2));
      wall.x2 = wall.x1 + inter.u*(wall.x2-wall.x1);
      wall.y2 = wall.y1 + inter.u*(wall.y2-wall.y1);
    }
  }
  bp.sort();
  for (const b in bp) {
    if (b != 0 && bp[b] !== bp[b-1]) {
      walls.push(new Wall(x1 + bp[b-1]*(x2-x1), y1 + bp[b-1]*(y2-y1), x1 + bp[b]*(x2-x1), y1 + bp[b]*(y2-y1)));
    }
  }
  for (const wall of toAdd) {
    walls.push(wall);
  }
}

function setFOV(f) {
  camF = width/2/tan(f/2);
  fov = f;
}

function draw() {
  background(0);
  
  if (keyIsDown(LEFT_ARROW)) {
    c.move(0, ts);
  }
  if (keyIsDown(RIGHT_ARROW)) {
    c.move(0, -ts);
  }
  if (keyIsDown(UP_ARROW)) {
    c.move(ms, 0);
  }
  if (keyIsDown(DOWN_ARROW)) {
    c.move(-ms, 0);
  }
  
  // c.move(noise(px), (noise(px+100)-0.5)*5);
  // px += 0.01;
  leftBound = {x: c.x + 1000*sin(c.a - fov/2), y: c.y + 1000*cos(c.a - fov/2)};
  rightBound = {x: c.x + 1000*sin(c.a + fov/2), y: c.y + 1000*cos(c.a + fov/2)};
  const drawOrder = [];
  const drawn = [];
  for (let i = 0; i < walls.length; i++) {
    // console.log(pos1, pos2);
    let wall1 = {x: walls[i].x1, y: walls[i].y1};
    let wall2 = {x: walls[i].x2, y: walls[i].y2};
    
    let ret = clip(wall1.x, wall1.y, wall2.x, wall2.y);
    if (ret === undefined) continue;
    wall1 = ret;
    ret = clip(wall2.x, wall2.y, wall1.x, wall1.y);
    if (ret === undefined) continue;
    wall2 = ret;
    
    let pos1 = worldToCam(wall1.x, wall1.y, wallH);
    let pos2 = worldToCam(wall2.x, wall2.y, wallH);
    let pos12 = worldToCam(wall1.x, wall1.y, -wallH);
    let pos22 = worldToCam(wall2.x, wall2.y, -wallH);
    drawOrder.push({dis: pow(wall1.x - c.x, 2) + pow(wall1.y - c.y, 2), wallI: i, topLine: {p1: pos1, p2: pos2}, bottomLine: {p1: pos12, p2: pos22}});
    drawOrder.push({dis: pow(wall2.x - c.x, 2) + pow(wall2.y - c.y, 2), wallI: i, topLine: {p1: pos1, p2: pos2}, bottomLine: {p1: pos12, p2: pos22}});
    // line(pos1.x + width/2, pos1.y + height*3/4, pos2.x + width/2, pos2.y + height*3/4);
    // line(pos12.x + width/2, pos12.y + height*3/4, pos22.x + width/2, pos22.y + height*3/4);
    // line(pos1.x + width/2, pos1.y + height*3/4, pos1.x + width/2, pos12.y + height*3/4);
    // line(pos2.x + width/2, pos2.y + height*3/4, pos2.x + width/2, pos22.y + height*3/4);
    // let lines = 10;
    // for (let per = 0; per < lines; per++) {
    //   line(pos1.x + width/2, (pos12.y - pos1.y)/lines*per + pos1.y + height*3/4, pos2.x + width/2, (pos22.y - pos2.y)/lines*per + pos2.y + height*3/4);
    // }
  }
  drawOrder.sort((a, b) => b.dis - a.dis);
  stroke(0);
  for (const wall of drawOrder) {
    if (drawn[wall.wallI]) continue;
    drawn[wall.wallI] = true;
    const pos1 = wall.topLine.p1;
    const pos2 = wall.topLine.p2;
    const pos12 = wall.bottomLine.p1;
    const pos22 = wall.bottomLine.p2;
    fill(255, wall.wallI/walls.length*255, 0, 255);
    beginShape();
    vertex(pos1.x + width/2, pos1.y + height*3/4);
    vertex(pos2.x + width/2, pos2.y + height*3/4);
    vertex(pos22.x + width/2, pos22.y + height*3/4);
    vertex(pos12.x + width/2, pos12.y + height*3/4);
    endShape(CLOSE);
  }
  // for (let i = 0; i < raycnt; i++) {
  //   rays[i].cast(c.x, c.y, fov/raycnt*i+c.a-fov/2);
  //   rays[i].show();
  // }
  fill(0);
  rect(0, 0, width, h);
  stroke(255);
  for (let i = 0; i < walls.length; i++) {
    walls[i].show();
  }
  line(c.x, c.y, c.x + 10*sin(c.a), c.y + 10*cos(c.a));
  line(c.x, c.y, leftBound.x, leftBound.y);
  line(c.x, c.y, rightBound.x, rightBound.y);
  
  
//   fill(255, 50, 50);
//   stroke(255, 50, 50);
//   c.show();
  
//   let mh = h*h+width*width;
//   let wd = width/raycnt;
//   fill(3, 211, 252);
//   noStroke();
//   rectMode(CORNERS);
//   rect(0, h, width, h+h/2);
//   fill(100, 234, 10);
//   noStroke();
//   rect(0, h+h/2, width, 2*h);
  
  
  fr.html(floor(frameRate()));
}

function relDelta(x, y) {
  let relx = x - c.x;
  let rely = y - c.y;
  let camx = - rely * camSin + relx * camCos;
  let camy = - relx * camSin - rely * camCos;
  return {x: camx, y: camy};
}

function worldToCam(x, y, z) {
  const {x: camx, y: camy} = relDelta(x, y);
  // circle(relx + width/2, rely + h*3/2, 20);
  // circle(camF*(camx)/camy + width/2, camF*z/camy + h*3/2, 40);
  return {x: camF*camx/camy, y: camF*z/camy};
}

function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  let d = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4);
  let t = ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4))/d;
  let u = ((x1-x3)*(y1-y2) - (y1-y3)*(x1-x2))/d;
  // console.log(x1, y1, x2, y2, x3, y3, x4, y4);
  // console.log(t, u);
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    let p1 = x1 + t*(x2-x1);
    let p2 = y1 + t*(y2-y1);
    return {x: p1, y: p2, t: t, u: u};
  }
  return undefined;
}

function clip(x1, y1, x2, y2) {
  const rel1 = relDelta(x1, y1);
  const ang1 = (atan2(rel1.x, -rel1.y));
  if (ang1 < -fov/2 || ang1 > fov/2) {
    const interl = intersect(x1, y1, x2, y2, c.x, c.y, leftBound.x, leftBound.y);
    const interr = intersect(x1, y1, x2, y2, c.x, c.y, rightBound.x, rightBound.y);
    if (interr === undefined && interl === undefined) return undefined;
    if (interr === undefined || interl === undefined) {
      x1 = interr ? interr.x : interl.x;
      y1 = interr ? interr.y : interl.y;
    }
    else {
      x1 = ang1 > 0 ? interr.x : interl.x;
      y1 = ang1 > 0 ? interr.y : interl.y;
    }
  }
  // circle(x1, y1, 10);
  return {x: x1, y: y1};
}
