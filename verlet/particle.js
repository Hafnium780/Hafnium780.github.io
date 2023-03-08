class Particle {
  constructor(x, y, m) {
    this.x = x;
    this.y = y;
    this.px = x;
    this.py = y;
    this.m = m;
  }
  
  update(ax, ay, drag, dt) {
    let nx = this.x + (this.x - this.px) * (1-drag) + ax * (1-drag) * dt * dt;
    this.px = this.x;
    this.x = nx;
    let ny = this.y + (this.y - this.py) * (1-drag) + ay * (1-drag) * dt * dt;
    this.py = this.y;
    this.y = ny;
  }
}
