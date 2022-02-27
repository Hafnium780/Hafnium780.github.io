class Checkpoint {
  constructor(x1, y1, x2, y2) {
    this.num = checkpoints.length + 1;
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }
  
  show() {
    let a;
    if (checkpointGoal == this.num) {
      a = 255;
    }
    else {
      a = 100;
    }
    stroke(0, 255, 0, a);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}
