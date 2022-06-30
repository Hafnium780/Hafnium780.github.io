let walls = [];
let rays = [];
let raycnt = 100;
let fov = 100;

let fr;

let c;
let ts = 1;
let ms = 1;

let px = 21;

let h = 250;

function setup() {
  createCanvas(600, 500);
  angleMode(DEGREES);
  c = new Person(width/2, h/2, 0);
  for (let i = 0; i < 5; i++) {
    walls[i] = new Wall(random(width), random(h), random(width), random(h));
  }
  walls[walls.length] = new Wall(0, 0, width, 0);
  walls[walls.length] = new Wall(width, 0, width, h);
  walls[walls.length] = new Wall(0, h, width, h);
  walls[walls.length] = new Wall(0, 0, 0, h);
  for (let i = 0; i < raycnt; i++) {
    rays[i] = new Ray();
  }
  fr = createP('');
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
  stroke(255);
  for (let i = 0; i < walls.length; i++) {
    walls[i].show();
  }
  for (let i = 0; i < raycnt; i++) {
    rays[i].cast(c.x, c.y, fov/raycnt*i+c.a-fov/2);
    rays[i].show();
  }
  
  fill(255, 50, 50);
  stroke(255, 50, 50);
  c.show();
  
  let mh = h*h+width*width;
  let wd = width/raycnt;
  fill(3, 211, 252);
  noStroke();
  rectMode(CORNERS);
  rect(0, h, width, h+h/2);
  fill(100, 234, 10);
  noStroke();
  rect(0, h+h/2, width, 2*h);
  for (let i = 0; i < raycnt; i++) {
    let clr = map(200/rays[i].dst, 0, 0.3, 100, 255, true);
    stroke(clr);
    fill(clr);
    let norm = sqrt(rays[i].dst/mh);
    let ht = 1/sqrt(norm)*h/25;
    // let ht = rays[i].dst*cos(fov/raycnt*i-fov/2);
    if (ht > h) ht = h;
    rect(width-i*wd, height*3/4+ht/2, width-(i+1)*wd, height*3/4-ht/2);
  }
  
  fr.html(floor(frameRate()));
}
