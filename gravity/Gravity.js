let p = [];
let allP = [];
let G;
let startX = 0;
let startY = 0;
let dragging = false;
let speedDiv = 50;
let massSlider;
let paused;
let collide;
let moving;
let rsquared;
let GSlider;
let affectsOthers;
let bounceOnWalls;

function setup() {
  createCanvas(800, 570);
  paused = createCheckbox("Pause (Space)", false);
  collide = createCheckbox("Detect Collisions", false);
  rsquared = createCheckbox("Gravity is proportional to 1/r", false);
  label = createDiv('&nbsp;&nbsp;g&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;size of planet');
  GSlider = createSlider(1, 100, 20);
  massSlider = createSlider(1, 80, 3);
  moving = createCheckbox("Placed Object Will Move", true);
  affectsOthers = createCheckbox("Placed Object Will Attract Others", true);
  bounceOnWalls = createCheckbox("Bounce Off Walls", false);
  destroy = createCheckbox("Destroy Out of Bounds", false);
  background(0);
}

function mousePressed() {
  if (mouseX > width || mouseX < 0 || mouseY > height || mouseY < 0) {
    return;
  }
  if (mouseButton == "left") {
    dragging = true;
    startX = mouseX;
    startY = mouseY;
  }
  else if (mouseButton == "right") {
    let record = Infinity;
    let recordInd = -1;
    for (let i = 0; i < allP.length; i++) {
      let dist = pow(allP[i].pos.x - mouseX, 2) + pow(allP[i].pos.y - mouseY, 2);
      if (dist < record && dist < allP[i].r*allP[i].r) {
        record = dist;
        recordInd = i;
      }
    }
    if (recordInd != -1) {
      let found = false;
      for (let i = 0; i < p.length; i++) {
        if (allP[recordInd] == p[i]) {
          allP.splice(recordInd, 1);
          p.splice(i, 1);
          found = true;
          break;
        }
      }
      if (!found) {
        allP.splice(recordInd, 1);
      }
    }
  }
}

function keyPressed() {
  if (keyCode == 32) {
    paused.elt.getElementsByTagName("input")[0].checked = (paused.elt.getElementsByTagName("input")[0].checked - 1) % 2;
    return false;
  }
}

function mouseReleased() {
  if (!dragging) {
    return;
  }
  dragging = false;
  if (affectsOthers.checked()) {
    p.push(new Planet(startX, startY, (mouseX - startX) / speedDiv, (mouseY - startY) / speedDiv, massSlider.value(), moving.checked()));
    allP.push(p[p.length-1]);
  }
  else {
    allP.push(new Planet(startX, startY, (mouseX - startX) / speedDiv, (mouseY - startY) / speedDiv, massSlider.value(), moving.checked()));
  }
}

function draw() {
  G = GSlider.value();
  background(0, 10);
  if (dragging) {
    stroke(255);
    line(startX, startY, mouseX, mouseY);
  }
    
  if (!paused.checked()) {
    for (let i = 0; i < allP.length; i++) {
      for (let j = 0; j < p.length; j++) {
        if (allP[i] == p[j] || !allP[i].enabled || !p[j].enabled) {
          continue;
        }
        let p1 = allP[i];
        let p2 = p[j];
        
        let dx = p1.pos.x - p2.pos.x;
        let dy = p1.pos.y - p2.pos.y;
        
        let f = G * p1.mass * p2.mass;
        if (!rsquared.checked()) {
          f /= (pow(dx, 2) + pow(dy, 2));
        }
        else {
          f /= sqrt(pow(dx, 2) + pow(dy, 2));
        }
        
        if (f / p1.mass > 1) {
          f = 1 * p1.mass;
        }
  
        let force = createVector((p1.pos.x - p2.pos.x), (p1.pos.y - p2.pos.y));
        force.setMag(f);
        stroke(255, 0, 0);
        
        
        allP[i].addForce(force.mult(-1));
        
        if (collide.checked()) {
          allP[i].collide(p[j]);
        }
      }
    }
  }
  for (let i = 0; i < allP.length; i++) {
    if (!paused.checked()) {
      allP[i].update();
    }
    allP[i].show();
  }
  if (destroy.checked()) {
    for (let i = 0; i < allP.length; i++) {
      if (allP[i].pos.x - allP[i].r < 0 || allP[i].pos.x + allP[i].r > width || allP[i].pos.y - allP[i].r < 0 || allP[i].pos.y + allP[i].r > height) {
        let found = false;
        for (let j = 0; j < p.length; j++) {
          if (allP[i] == p[j]) {
            allP.splice(i, 1);
            p.splice(j, 1);
            found = true;
            break;
          }
        }
        if (!found) {
          allP.splice(i, 1);
        }
      }
    }
  }
}
