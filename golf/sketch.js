let xc = 30;
let yc = 30;
let xs;
let ys;

let cells = {};

let balls = [];
let ballAngs = 20;
let ballVels = 20;
let as;
let vs;
let maxVel = 14;

let brush;
let bs;
let mode = 0;

let start = {x: 0, y: 0};
let goal = {x: 0, y: 0};

let results;
let resultsShowing = false;

let aStep;
let velStep;

function setup() {
  createCanvas(600, 600);
  xs = width / xc;
  ys = height / yc;
  as = width / ballAngs;
  vs = height / ballVels;
  
  aStep = TWO_PI / ballAngs;
  velStep = maxVel / ballVels;
  
  for (let i = 0; i < xc; i++) {
    cells[i] = {};
  
    for (let j = 0; j < yc; j++) {
      cells[i][j] = new Cell(i, j);
    }
  }
  
  brush = createSlider(1, 10, 1);
  brush.position(width, 50);
  button = createButton('Increase/Decrease Height');
  button.position(0, height + 50);
  button.mousePressed(() => {mode = 0;});
  button = createButton('Level Ground');
  button.position(0, height + 80);
  button.mousePressed(() => {mode = 1;});
  button = createButton('Clear Map');
  button.position(0, height + 140);
  button.mousePressed(() => {loadMap(0);});
  button = createButton('Load Map 1');
  button.position(200, height + 50);
  button.mousePressed(loadSine);
  button = createButton('Load Map 2');
  button.position(200, height + 80);
  button.mousePressed(() => {loadMap(1);});
  button = createButton('Load Map 3');
  button.position(200, height + 110);
  button.mousePressed(() => {loadMap(2);});
  button = createButton('Save Map');
  button.position(200, height + 140);
  button.mousePressed(saveMap);
  button = createButton('Simulate');
  button.position(300, height + 50);
  button.mousePressed(simulate);
  button = createButton('Place Start');
  button.position(300, height + 80);
  button.mousePressed(() => {mode = 2;});
  button = createButton('Place Goal');
  button.position(300, height + 110);
  button.mousePressed(() => {mode = 3;});
  
  results = createCheckbox('Show Results', false);
  results.changed(resultsChanged);
  results.position(400, height + 50);
}


function draw() {
  for (const b of balls) {
    b.update();
  }
  if (resultsShowing) {
    background(0);
    if (balls.length != ballVels * ballAngs) return;
    noStroke();
    let cnt = 0;
    for (let j = ballVels-1; j >= 0; j--) {
      let r = width * j/ballVels;
      for (let i = 0; i < ballAngs; i++) {
        let t = (abs(balls[cnt].x - goal.x) + abs(balls[cnt].y - goal.y)) / 100;
        if (t > 1) t = 1;
        fill(t * 255, (1-t) * 255, 0);
        arc(width/2, height/2, r, r, -(i+1/2) * aStep + HALF_PI, -(i-1/2) * aStep + HALF_PI);
        cnt++;
      }
    }
  }
  else {
    bs = brush.value();
    background(0);

    stroke(255);
    strokeWeight(1);
    textAlign(CENTER);

    for (let i = 0; i < xc; i++) {
      for (let j = 0; j < yc; j++) {
        cells[i][j].show();
      }
    }

    for (const b of balls) {
      b.show();
    }

    fill(0, 0, 255);
    circle(goal.x, goal.y, 10);
    fill(0, 255, 255);
    circle(start.x, start.y, 10);

    // frameRate();
  }
}

function mouseDragged() {
  mouse();
}

function mouseClicked() {
  mouse();
}

function mouse() {
  if (resultsShowing) return;
  let x = floor(mouseX / xs);
  let y = floor(mouseY / ys);
  if (x < 0 || x >= xc || y < 0 || y >= yc) return;
  if (mode == 0) {
    for (let i = x - bs; i <= x + bs; i++) {
      for (let j = y - bs; j <= y + bs; j++) {
        if (i >= 0 && i < xc && j >= 0 && j <= yc && abs(x - i) + abs(y - j) <= bs) {
          cells[i][j].click(!keyIsDown(SHIFT));
          cells[i][j].update(true);
        }
      }
    }
  }
  else if (mode == 1) {
    let avg = 0;
    let cnt = 0;
    for (let i = x - bs; i <= x + bs; i++) {
      for (let j = y - bs; j <= y + bs; j++) {
        if (i >= 0 && i < xc && j >= 0 && j <= yc && abs(x - i) + abs(y - j) <= bs) {
          cnt++;
          avg += cells[i][j].h;
        }
      }
    }
    avg = floor(avg/cnt);
    for (let i = x - bs; i <= x + bs; i++) {
      for (let j = y - bs; j <= y + bs; j++) {
        if (i >= 0 && i < xc && j >= 0 && j <= yc && abs(x - i) + abs(y - j) <= bs) {
          cells[i][j].h = avg;
          cells[i][j].update(true);
        }
      }
    }
  }
  else if (mode == 2) {
    start = {x: mouseX, y: mouseY};
  }
  else if (mode == 3) {
    goal = {x: mouseX, y: mouseY};
  }
}

function simulate() {
  balls = [];
  let a = 0;
  let v = maxVel;
  
  for (let j = 0; j < ballVels; j++) {
    for (let i = 0; i < ballAngs; i++) {
      balls.push(new Ball(start.x, start.y, v * sin(a), v * cos(a), j, i));
      a += aStep;
    }
    v -= velStep;
  }
}

function loadSine() {
  balls = [];
  for (let i = 0; i < xc; i++) {
    for (let j = 0; j < yc; j++) {
      cells[i][j].h = 5 * sin(((i - xc/2.0) * (i - xc/2.0) + (j - yc/2.0) * (j - yc/2.0))/40 + 2) + 5;
      cells[i][j].update(true);
    }
  }
}

function loadMap(id) {
  balls = [];
  let m;
  let cnt = 0;
  if (id == 0) m = 0;
  if (id == 1) m = gs;
  if (id == 2) m = m3;

  for (let i = 0; i < xc; i++) {
    for (let j = 0; j < yc; j++) {
      cells[i][j].h = m == 0 ? 0 : m[cnt];
      cells[i][j].update(true);
      cnt++;
    }
  }
}

function saveMap() {
  let save = [];
  for (let i = 0; i < xc; i++) {
    for (let j = 0; j < yc; j++) {
      save.push(cells[i][j].h);
    }
  }
  console.log(JSON.stringify(save));
}

function resultsChanged() {
  resultsShowing = results.checked();
}

let gs = [0,0,0,0,0,0,0,0,0,1,1,2,4,5,7,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,3,8,7,6,4,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,8,7,7,9,10,10,7,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,7,8,5,10,10,10,10,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,4,7,2,0,3,10,10,10,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,10,10,2,2,3,2,7,10,10,6,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,10,5,2,7,6,4,9,10,10,8,4,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,7,4,6,4,6,2,1,10,8,6,9,5,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,4,7,7,3,6,3,1,5,7,10,8,5,8,3,4,0,2,1,1,0,0,0,0,0,0,0,0,0,1,3,10,8,9,5,4,5,2,1,10,10,10,7,3,9,2,3,1,2,0,0,0,0,0,0,0,0,0,0,0,8,8,10,6,6,5,4,2,2,5,10,10,10,10,6,6,1,1,0,0,0,0,0,0,0,0,0,0,0,3,6,10,9,7,4,3,2,0,1,7,10,10,7,8,7,4,1,1,0,0,0,0,0,0,0,0,0,0,0,1,6,10,10,7,2,2,0,0,0,10,10,10,7,9,7,4,4,0,0,0,0,0,0,0,0,0,0,0,0,1,5,8,10,2,1,1,1,0,2,10,10,10,7,10,10,5,4,1,2,0,0,0,0,0,0,0,0,0,1,3,6,10,5,1,0,2,0,0,1,10,10,5,8,10,10,10,8,5,2,2,0,0,0,0,0,0,0,0,1,4,8,9,5,1,1,1,1,0,4,9,10,5,7,10,10,10,10,5,3,0,0,0,0,0,0,0,0,0,0,3,7,10,3,0,0,1,0,0,2,10,8,5,10,10,10,10,8,1,1,0,0,0,0,0,0,0,0,0,1,4,10,10,7,1,0,0,0,0,3,10,10,9,10,10,10,10,5,2,1,1,0,0,0,0,0,0,0,0,0,4,8,10,4,0,0,0,0,0,4,10,10,8,10,10,10,8,4,7,2,0,0,0,0,0,0,0,0,0,1,3,7,9,5,2,0,0,0,0,2,10,8,5,10,10,8,4,8,7,4,0,0,0,0,0,0,0,0,0,0,1,6,10,6,1,1,0,0,0,4,10,9,7,10,10,7,6,6,7,2,0,0,0,0,0,0,0,0,0,0,2,7,10,10,4,2,1,0,0,3,10,10,6,10,7,9,6,6,5,0,0,0,0,0,0,0,0,0,0,0,0,4,10,10,10,4,1,0,0,3,10,10,5,4,7,4,5,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,10,8,4,0,1,0,7,8,9,3,4,2,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,7,9,3,10,4,5,4,10,4,1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,4,10,10,10,3,10,6,6,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,7,10,10,5,10,8,5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,5,3,10,10,8,3,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,6,9,10,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,6,3,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0];
let m3 = [0,0,0,0,0,0,3,3,1,2,0,0,0,5,6,6,7,4,7,5,6,9,10,10,8,5,3,5,3,0,0,0,0,0,0,3,6,7,6,7,10,6,5,7,10,10,7,8,5,10,10,9,10,5,2,3,5,8,10,10,0,0,0,0,0,0,3,3,5,10,10,10,10,9,10,7,3,0,2,3,4,3,2,0,0,0,0,8,10,10,0,0,0,0,0,0,0,0,5,10,10,10,6,6,9,2,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,6,2,5,10,10,8,5,5,10,3,5,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,10,10,10,10,10,10,10,10,10,10,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,10,10,9,10,10,10,10,10,10,10,7,3,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,5,10,10,10,4,2,7,10,9,9,10,10,10,10,6,8,2,6,0,0,0,3,2,0,0,0,3,0,0,0,4,10,10,7,0,0,2,4,7,10,10,10,10,10,10,10,10,2,0,0,0,7,10,5,0,6,9,3,0,0,5,10,10,10,7,0,0,0,5,9,10,5,10,10,10,10,10,9,0,0,0,7,10,10,8,9,10,10,0,0,4,10,10,10,10,10,0,0,0,4,1,7,9,10,10,10,5,4,0,0,0,2,10,10,10,6,10,5,0,0,0,4,3,10,10,10,10,0,1,1,3,0,10,10,10,8,1,2,2,0,0,0,0,10,10,10,2,1,0,0,0,3,3,8,10,10,10,10,0,3,2,3,0,10,10,10,3,4,0,0,0,6,5,7,10,7,3,0,0,0,3,3,9,10,10,10,10,8,9,0,3,3,1,1,10,10,10,8,6,0,7,10,10,10,10,4,2,0,0,0,0,6,5,9,10,7,10,10,10,6,2,3,2,0,10,10,10,10,4,0,0,8,10,10,10,10,0,0,0,0,0,2,9,8,5,10,10,10,10,10,3,2,0,0,0,10,10,10,0,0,0,0,2,4,10,10,10,0,0,0,0,1,5,10,9,9,10,10,10,8,1,0,0,0,0,6,10,10,6,0,0,0,0,0,3,10,10,9,0,0,0,1,9,10,10,10,10,10,10,6,0,0,0,0,0,10,10,10,3,0,0,0,0,0,0,10,10,10,0,0,0,1,4,10,10,10,10,10,10,5,0,0,0,0,0,9,10,10,3,0,0,0,0,0,4,8,10,4,0,0,0,0,3,8,10,10,10,10,10,4,0,0,0,1,0,7,10,7,5,0,0,0,0,1,10,8,8,3,0,0,0,0,4,8,10,10,10,10,10,7,0,0,3,1,1,1,10,10,10,5,0,0,0,10,10,10,2,0,0,0,0,0,0,9,10,9,10,9,10,4,2,0,0,1,0,0,6,10,10,2,0,0,4,9,10,3,0,0,0,0,0,0,2,8,8,9,7,10,10,10,0,0,0,0,0,0,0,7,7,7,7,5,5,6,6,0,0,0,0,0,0,0,3,8,10,10,8,7,10,9,8,1,0,0,0,0,0,0,6,8,10,10,10,6,1,1,0,0,0,0,0,0,3,10,10,10,10,10,10,10,10,10,1,0,0,0,0,0,0,1,6,10,8,5,1,0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,10,5,4,0,0,0,0,0,0,0,0,0,5,0,0,0,0,4,0,0,0,0,0,0,3,7,10,10,10,10,8,9,5,8,2,0,0,0,0,0,0,0,0,0,0,0,10,7,0,0,0,0,0,0,0,1,2,3,0,6,9,10,10,7,9,7,4,0,0,0,0,0,0,0,1,10,10,10,0,0,0,0,0,0,0,0,0,0,0,0,6,9,9,10,9,10,9,10,6,4,5,6,3,6,10,7,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,9,3,2,5,10,10,10,10,10,10,10,10,10,10,0,0];
