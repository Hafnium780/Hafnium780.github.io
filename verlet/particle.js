class Particle {
  constructor(x, y, m, r, move) {
    this.x = x;
    this.y = y;
    this.px = x;
    this.py = y;
    this.m = m;
    this.r = r;
    this.move = move;
  }
  
  update(ax, ay, drag, dt) {
    if (!this.move) return;
    let nx = this.x + (this.x - this.px) * (1-drag) + ax * (1-drag) * dt * dt;
    this.px = this.x;
    this.x = nx;
    let ny = this.y + (this.y - this.py) * (1-drag) + ay * (1-drag) * dt * dt;
    this.py = this.y;
    this.y = ny;
  }
  
  show(s) {
    s.circle(this.x, this.y, this.r);
  }
}

function constrainRigid(p1, p2, l) {
  let d = Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
  let dd = (d - l)/d;
  let dx = 0.5*dd*(p2.x - p1.x);
  let dy = 0.5*dd*(p2.y - p1.y);
  if (p1.move) {
    p1.x += p2.move ? dx : 2*dx;
    p1.y += p2.move ? dy : 2*dy;
  }
  if (p2.move) {
    p2.x -= p1.move ? dx : 2*dx;
    p2.y -= p1.move ? dy : 2*dy;
  }
}

function constrainSpring(p1, p2, l, k, maxa=Infinity) {
  let d = sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2);
  if (d < 0.001) d = 0.001;
  let unvecx = (p1.x-p2.x)/d;
  let unvecy = (p1.y-p2.y)/d;
  let a = k * (d - l);
  let ax = a * unvecx;
  let ay = a * unvecy;
  if (a > maxa) {
    ax = ax/a*maxa;
    ay = ay/a*maxa;
  }
  p1.update(-ax/p1.m, -ay/p1.m, drag, dt);
  p2.update(ax/p2.m, ay/p2.m, drag, dt);
}
