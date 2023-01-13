class Ray {
  constructor() {
    this.x2 = 0;
    this.y2 = 0;
    this.text = 0;
  }
  
  cast(x, y, ang) {
    this.a = ang;
    this.x = x;
    this.y = y;
    let x1 = x;
    let y1 = y;
    let x2 = x + 1000*sin(this.a);
    let y2 = y + 1000*cos(this.a);
    let record = 1000000;
    for (let i = 0; i < walls.length; i++) {
      let x3 = walls[i].x1;
      let y3 = walls[i].y1;
      let x4 = walls[i].x2;
      let y4 = walls[i].y2;
      let d = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4);
      let t = ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4))/d;
      let u = ((x1-x3)*(y1-y2) - (y1-y3)*(x1-x2))/d;
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        let p1 = x1 + t*(x2-x1);
        let p2 = y1 + t*(y2-y1);
        let dst = pow(p1-x1, 2) + pow(p2-y1, 2);
        if (dst < record) {
          record = dst;
          this.x2 = p1;
          this.y2 = p2;
          this.text = t;
          this.c = i;
        }
      }
    }
    this.dst = record;
  }
  
  show() {
    line(this.x, h-this.y, this.x2, h-this.y2);
  }
}
