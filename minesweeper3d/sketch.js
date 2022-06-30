let xs = 10;
let ys = 10;
let zs = 10;
let xscl = 30;
let yscl = 30;
let t = {};
let lost = false;
let al = 255;
let layernum, inst;

const mx = [-1, 0, 1, 1, 1, 0, -1, -1, 
            -1, 0, 1, 1, 1, 0, -1, -1, 0,
            -1, 0, 1, 1, 1, 0, -1, -1, 0];
const my = [1, 1, 1, 0, -1, -1, -1, 0,
            1, 1, 1, 0, -1, -1, -1, 0, 0,
            1, 1, 1, 0, -1, -1, -1, 0, 0];
const mz = [0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 1, 1, 1, 1, 1, 1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1];

function setup() {
  createCanvas(xs*xscl, ys*yscl);
  textAlign(CENTER);
  rectMode(CORNERS);
  textSize(7);
  reset();
}

function mousepos() {
  let a = createVector(floor(mouseX / xscl), floor(mouseY / yscl));
  if (a.x < 0 || a.x >= xs || a.y < 0 || a.y >= ys) return false;
  return a;
}

function reset() {
  lost = false;
  let r = [];
  for (let i = 0; i < xs; i++) {
    t[i] = {};
    for (let j = 0; j < ys; j++) {
      t[i][j] = {};
      for (let k = 0; k < zs; k++) {
        t[i][j][k] = new Tile(i, j, k);
        r[k+j*zs+i*zs*ys] = k+j*zs+i*zs*ys;
      }
    }
  }
  for (let i = 0; i < ceil(xs*ys*zs/20); i++) {
    let ind = random(r);
    t[floor(ind/zs/ys)][floor((ind%(zs*ys))/zs)][ind%zs].mine = true;
    r.splice(r.indexOf(ind), 1);
  }
  for (let i = 0; i < xs; i++) {
    for (let j = 0; j < ys; j++) {
      for (let k = 0; k < zs; k++) {
        t[i][j][k].calc();
      }
    }
  }
  if (layernum) layernum.remove();
  if (inst) inst.remove();
  layernum = createDiv('Layer: 1/' + zs);
  inst = createDiv('The middle row of each cell shows the current layer, the ones below and above correspond to the layers below and above. You only interact with the cells in the current layer. <br> <b>Left click </b>to mark as a flag <br> <b>Shift + left click </b>to reveal <br> <b>Left click </b>a revealed square to chord <br> Use the <b>up and down arrow keys </b>to move through the layers <br> Press <b>space </b>to restart <br> Cells with no neighboring mines are automatically chorded');
 }


let l = false;
let r = false;
let p = false;
let u = false;
let d = false;
let pu = false;
let pd = false;
let curz = 0;
function draw() {
  background(0, 255, 121);
  stroke(0);
  strokeWeight(1);
  fill(255);
  for (let i = 0; i < xs; i++) {
    for (let j = 0; j < ys; j++) {
      for (let k = curz-1; k < curz+2; k++) {
        if (k < 0 || k >= zs) {
          bound(i, j, k);
        }
        else t[i][j][k].showcell();
      }
    }
  }
  for (let i = 0; i < xs; i++) {
    for (let j = 0; j < ys; j++) {
      for (let k = 0; k < zs; k++) {
        t[i][j][k].show();
      }
    }
  }
  stroke(255, 200, 150);
  for (let i = 0; i < xs; i++) {
    strokeWeight(3);
    line(i*xscl, ys*yscl, i*xscl, 0);
  }
  for (let i = 0; i < ys; i++) {
    strokeWeight(3);
    line(xs*xscl, i*yscl, 0, i*yscl);
  }
  if(keyIsDown(UP_ARROW) && pu) u = true;
  if(!keyIsDown(UP_ARROW)) pu = true;
  if(keyIsDown(DOWN_ARROW) && pd) d = true;
  if(!keyIsDown(DOWN_ARROW)) pd = true;
  if (u) {
    u = false;
    pu = false;
    if (curz < zs-1) curz++;
    layernum.html('Layer: ' + (curz+1) + '/' + zs);
  }
  if (d) {
    d = false;
    pd = false;
    if (curz > 0) curz--;
    layernum.html('Layer: ' + (curz+1) + '/' + zs);
  }
  if (lost && keyIsDown(32)) reset();
  if (lost) return;
  if(mouseIsPressed) {
    if (!p) {
      if(mouseButton === LEFT) l = true;
      else l = false;
      if(mouseButton === RIGHT) r = true;
      else r = false;
      p = true;
    }
  }
  else {
    l = false;
    r = false;
    p = false;
  }
  
  if (l) {
    l = false;
    let pos = mousepos();
    if (keyIsDown(SHIFT)) {
      if (pos !== false) {
        t[pos.x][pos.y][curz].reveal();
      }
    }
    else {  
      if (pos !== false) {
        if (!t[pos.x][pos.y][curz].revealed) t[pos.x][pos.y][curz].tflag();
        else t[pos.x][pos.y][curz].chord();
      }
    }
  }
}

function lose() {
  lost = true;
  for (let i = 0; i < xs; i++) {
    for (let j = 0; j < ys; j++) {
      for (let k = 0; k < zs; k++) {
        if (!t[i][j][k].revealed && !t[i][j][k].mine) {
          t[i][j][k].revealed = true;
          t[i][j][k].rl = true;
        }
      }
    }
  }
}

function bound(x, y, z) {
  fill(100);
  let pos = curz - z + 1;
  rect(x*xscl, (y+pos/3)*yscl, (x+1)*xscl, (y+(1+pos)/3)*yscl);
}
