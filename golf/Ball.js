class Ball {
  constructor(x, y, vx, vy, j, i) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.j = j;
    this.i = i;
    this.stopped = false;
  }
  
  show() {
    if (this.stopped) return;
    stroke(0);
    fill(255, 255, 0);
    circle(this.x, this.y, 6);
  }
  
  update() {
    if (this.stopped) return;
    let cx = floor(this.x / xs);
    if (cx == xc) cx--;
    let cy = floor(this.y / ys);
    if (cy == yc) cy--;
    this.vx += cells[cx][cy].v.x;
    this.vy += cells[cx][cy].v.y;
    this.vx *= 0.99;
    this.vy *= 0.99;
    this.x += this.vx;
    this.y += this.vy;
    
    if (this.x < 0) { 
      this.x = -this.x;
      this.vx = -this.vx;
    }
    if (this.y < 0) { 
      this.y = -this.y;
      this.vy = -this.vy;
    }
    if (this.x >= width) { 
      this.x = 2 * width - this.x;
      this.vx = -this.vx;
    }
    if (this.y >= height) { 
      this.y = 2 * height - this.y;
      this.vy = -this.vy;
    }
    
    if ((this.x - goal.x) * (this.x - goal.x) + (this.y - goal.y) * (this.y - goal.y) <= 100) {
      // g[this.i][this.j] = true;
      this.stopped = true;
    }
    if (abs(this.vx) < 0.001 && abs(this.vy) < 0.001) this.stopped = true;
  }
}
