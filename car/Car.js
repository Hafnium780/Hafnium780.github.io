class Car {
  constructor(x, y, r, g, b, brain) {
    this.vel = createVector(0, 0);
    this.speed = 1;
    this.turnSpeed = 12;
    this.heading = 0;
    this.pos = createVector(x, y);
    this.score = 1000;
    this.fitness = 0;
    this.carWalls = [];
    this.raycaster = new Raycaster(200, 100);
    this.laps = 0;
    this.r = r;
    this.g = g;
    this.b = b;
    
    this.nextCheckpoint = 0;
    
    if (brain) {
      this.brain = brain.copy();
    }
    else {
      this.brain = new NeuralNetwork(11, 39, 4);
    }
    
    this.carWalls.push(new Boundary(-15, 7.5, 15, 7.5));
    this.carWalls.push(new Boundary(15, 7.5, 15, -7.5));
    this.carWalls.push(new Boundary(15, -7.5, -15, -7.5));
    this.carWalls.push(new Boundary(-15, -7.5, -15, 7.5));
  }
  
  show() {
    push();
    rectMode(CENTER);
    angleMode(DEGREES);
    translate(this.pos.x, this.pos.y);
    rotate(this.heading);
    noStroke();
    fill(this.r, this.g, this.b, 100);
    rect(0, 0, 30, 15);
    fill(0);
    rect(7, 0, 5, 10);
    rotate(-this.heading);
    stroke(0);
    fill(255);
    text((int)(this.score), -7.5, -20);
    pop();
  }
  
  update() {
    this.score += 0;  
    this.pos.add(this.vel);
    this.vel.mult(0.6);
    this.heading %= 360;
    for (let carWall of this.carWalls) {
      carWall.move(this.pos.x, this.pos.y);
      carWall.turn(this.heading);
      carWall.show();
    }
    this.raycaster.setAngle(this.heading);
    this.raycaster.update(this.pos.x, this.pos.y);
  }
  
  turn(amt) {
    this.heading += this.turnSpeed * amt;
  }
  
  move(amt) {
    push();
    angleMode(DEGREES);
    let moveVel = createVector(cos(this.heading), sin(this.heading));
    moveVel.setMag(this.speed * amt);
    this.vel = p5.Vector.add(moveVel, this.vel);
    pop();
  }
  
  mutate(amt) {
    this.brain.mutate(amt);
  }
  
  think(scene) {
    scene.push(this.vel.mag());
    scene.push(0);
    scene.push(0);
    
    let output = this.brain.predict(scene);
    this.turn((output[1]-output[0]) * 2);
    this.move(output[2] * 4 + 1.5);
  }
  
  programmedMove(scene) {
    let mult = 1;
    let turnMult = 1;
    if (abs(this.vel.heading() - this.heading) > 10) {
      mult = 4;
    }
    if (scene[0] < 60) {
      mult = 0.01;
      turnMult = 2;
    }
    else if (scene[1] < 40 || scene[7] < 40) {
      turnMult = 1;
    }
    else if (scene[0] > 200) {
      turnMult = 0.01;
    }
    
    this.move(min(scene[0] * mult, 10));
    this.turn((scene[1] + scene[2] - scene[7] - scene[6])/100 * turnMult);
  }
  
  collisionCheck(walls) {
    for (let wall of walls) {
      for (let carWall of this.carWalls) {
        const x1 = wall.a.x;
        const y1 = wall.a.y;
        const x2 = wall.b.x;
        const y2 = wall.b.y;
        
        const x3 = carWall.a.x;
        const y3 = carWall.a.y;
        const x4 = carWall.b.x;
        const y4 = carWall.b.y;
        
        const den = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4);
        if (den == 0) {
          continue;
        }
        
        const t = ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) / den;
        const u = -((x1-x2)*(y1-y3) - (y1-y2)*(x1-x3)) / den;
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
          return true;
        }
      }
    }
    return false;
  }
}
