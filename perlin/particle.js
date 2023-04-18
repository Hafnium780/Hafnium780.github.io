function Particle(s, x, y) {
  this.pos = s.createVector(x, y);
  this.vel = s.createVector(0, 0);
  this.acc = s.createVector(0, 0);
  this.maxSpeed = 2;
  this.time = 0;
  this.enabled = true;
  
  this.prevPos = this.pos.copy();
  
  this.update = function() {
    if (!this.enabled) {return;}
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  
  this.follow = function(vectors) {
    if (!this.enabled) {return;}
    this.time++;
    //if (this.time >= 10000) {this.enabled = false;}
    var x = Math.floor(this.pos.x / s.scl);
    var y = Math.floor(this.pos.y / s.scl);
    var index = x + y * s.cols;
    var force = vectors[index];
    this.applyForce(force);
  };
  
  this.applyForce = function(force) {
    if (!this.enabled) {return;}
    this.acc.add(force);
  };
  
  this.show = function() {
    if (!this.enabled) {return;}
    s.stroke(200, 200, 200, 20);
    s.strokeWeight(1);
    s.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.updatePrev();
  };
  
  this.updatePrev = function() {
    if (!this.enabled) {return;}
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  };
  
  this.edges = function() {
    if (!this.enabled) {return;}
    if (this.pos.x > s.width) {
      this.pos.x = 0;
      this.updatePrev();
    }
    if (this.pos.x < 0) {
      this.pos.x = s.width;
      this.updatePrev();
    }
    if (this.pos.y > s.height) {
      this.pos.y = 0;
      this.updatePrev();
    }
    if (this.pos.y < 0) {
      this.pos.y = s.height;
      this.updatePrev();
    }
  };
}