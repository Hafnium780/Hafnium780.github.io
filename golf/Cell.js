let mx = [0, 1, 0, -1, -1, -1, 1, 1];
let my = [1, 0, -1, 0, 1, -1, -1, 1];

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.h = 0;
    this.m = [];
    
    for (let m = 0; m < 8; m++) {
      let nx = this.x + mx[m];
      let ny = this.y + my[m];
      if (nx < 0 || nx >= xc || ny < 0 || ny >= yc) continue;
      this.m.push({x:nx, y:ny}); 
    }
    
    this.v = {x: 0, y: 0};
  }
  
  show() {
    stroke(255);
    if ((mode == 0 || mode == 1) && abs(floor(mouseX / xs) - this.x) + abs(floor(mouseY / ys) - this.y) <= bs) stroke(0);
    fill(255 * (1 - this.h/10), 255 * this.h / 10, 0);
    rect(this.x * xs, this.y * ys, (this.x+1) * xs, (this.y+1) * ys); 
    //text(this.h, (this.x + 0.5) * xs, (this.y + 0.5) * ys);
    
    stroke(0);
    line((this.x + 0.5) * xs, (this.y + 0.5) * ys, (this.x + 0.5 + this.v.x / 2) * xs, (this.y + 0.5 + this.v.y / 2) * ys);
  }
  
  click(b) {
     if (b) this.h++;
     else this.h--;
     
     if (this.h > 10) this.h = 10;
     if (this.h < 0) this.h = 0;
  }
  
  update(f) {
    let sx = 0;
    let sy = 0;
    for (const n of this.m) {
      let dh = cells[n.x][n.y].h - this.h;
      if (n.x != this.x) sx -= dh / (n.x - this.x);
      if (n.y != this.y) sy -= dh / (n.y - this.y);
    }
   
    if (f) {
      for (const n of this.m) {
        cells[n.x][n.y].update(false);
      }
    }
   
    this.v = {x:sx / 30, y:sy / 30};
  }
}
