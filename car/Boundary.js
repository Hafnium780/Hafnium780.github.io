class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
    this.pos = createVector(0, 0);
    this.heading = 0;
  }
  
  show() {
    stroke(255);
    push();
    angleMode(DEGREES);
    translate(this.pos.x, this.pos.y);
    line(this.a.x - this.pos.x, this.a.y - this.pos.y, this.b.x - this.pos.x, this.b.y - this.pos.y);
    pop();
  }
  
  move(x, y) {
    let dx = this.pos.x - x;
    let dy = this.pos.y - y;
    this.a.x -= dx;
    this.b.x -= dx;
    this.a.y -= dy;
    this.b.y -= dy;
    this.pos = createVector(x, y);
  }
  
  turn(a) {
    let da = -this.heading + a;
    this.heading = a;
    push();
    angleMode(DEGREES);
    let p = this.pos.x;
    let q = this.pos.y;
    let x1 = this.a.x;
    let y1 = this.a.y;
    let x2 = this.b.x;
    let y2 = this.b.y;
    this.a.x = (x1-p)*cos(da) - (y1-q)*sin(da) + p;
    this.a.y = (x1-p)*sin(da) + (y1-q)*cos(da) + q;
    this.b.x = (x2-p)*cos(da) - (y2-q)*sin(da) + p;
    this.b.y = (x2-p)*sin(da) + (y2-q)*cos(da) + q;
    pop();
  }
}
