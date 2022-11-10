class Planet {
  constructor(x, y, vx, vy, mass, moving, pIndex) {
    this.moving = moving;
    this.mass = mass;
    this.r = mass / 2;
    this.pos = createVector(x, y);
    this.vel = createVector(vx, vy);
    this.acc = createVector(0, 0);
    this.enabled = true;
  }
  
  update() {
    if (this.moving && this.enabled) {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
    }
    this.acc.mult(0);
    if (bounceOnWalls.checked()) {
      if (this.pos.x - this.r < 0 || this.pos.x + this.r > width) {
        this.pos.sub(this.vel);
        this.vel.x = -this.vel.x;
        this.pos.add(this.vel);
      }
      if (this.pos.y - this.r < 0 || this.pos.y + this.r > height) {
        this.pos.sub(this.vel);
        this.vel.y = -this.vel.y;
        this.pos.add(this.vel);
      }
    }
  }
  
  show() {
    if (this.enabled) {
      stroke(255, 100, 100, 50);
      fill(255, 100, 100, 50);
      if (this.pos.x < 0 && this.pos.x <= this.pos.y && this.pos.x <= height - this.pos.y) {
        rect(0, Math.max(Math.min(this.pos.y-5, height-4), 0), 10, 4);
      }
      else if (this.pos.y < 0 && this.pos.y <= this.pos.x && this.pos.y <= width - this.pos.x) {
        rect(Math.max(Math.min(this.pos.x-2, width-4), 0), 0, 4, 10);
      }
      else if (this.pos.x > width && width - this.pos.x <= this.pos.y && this.pos.x - width >= this.pos.y - height) {
        rect(width-10, Math.max(Math.min(this.pos.y-5, height-4), 0), 10, 4);
      }
      else if (this.pos.y > height && height - this.pos.y <= this.pos.x && this.pos.x - width <= this.pos.y - height) {
        rect(Math.max(Math.min(this.pos.x-5, width-4), 0), height-10, 4, 10);
      }
      stroke(255, 255);
      fill(255);
      if (this.mass < 0) {
        fill(255, 0, 0);
      }
      ellipse(this.pos.x, this.pos.y, this.r*2);
    }
  }
  
  addForce(f) {
    this.acc.add(f.mult(1/this.mass));
  }
  
  collide(planet) {
    if (pow(planet.r + this.r, 2) < pow(planet.pos.x - this.pos.x, 2) + pow(planet.pos.y - this.pos.y, 2) || !planet.enabled || !this.enabled) {
      return;
    }
    if (this.mass > planet.mass) {
      this.vel.add(planet.vel.mult(planet.mass / this.mass));
      this.mass += planet.mass;
      this.r = this.mass / 2;
      planet.enabled = false;
    }
    else {
      planet.vel.add(this.vel.mult(this.mass / planet.mass));
      planet.mass += this.mass;
      planet.r = planet.mass / 2;
      this.enabled = false;
    }
  }
}
