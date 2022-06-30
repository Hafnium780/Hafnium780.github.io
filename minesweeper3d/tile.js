
class Tile {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.flag = false;
    this.mine = false;
    this.revealed = false;
    this.rl = false;
    this.num = 0;
  }
  tflag() {
    if (!this.revealed) this.flag = !this.flag;
  }
  reveal() {
    if (this.revealed || this.flag) return;
    this.revealed = true;
    if (this.mine) lose();
    if (this.num == 0) {
      for (let m = 0; m < mx.length; m++) {
        let nx = this.x + mx[m];
        let ny = this.y + my[m];
        let nz = this.z + mz[m];
        if (nx < 0 || nx >= xs || ny < 0 || ny >= ys || nz < 0 || nz >= zs) continue;
        t[nx][ny][nz].reveal();
      }
    }
  }
  calc() {
    this.num = 0;
    for (let m = 0; m < mx.length; m++) {
      let nx = this.x + mx[m];
      let ny = this.y + my[m];
      let nz = this.z + mz[m];
      if (nx < 0 || nx >= xs || ny < 0 || ny >= ys || nz < 0 || nz >= zs) continue;
      if (t[nx][ny][nz].mine) this.num++;
    }
  }
  chord() {
    let flags = this.num;
    for (let m = 0; m < mx.length; m++) {
      let nx = this.x + mx[m];
      let ny = this.y + my[m];
      let nz = this.z + mz[m];
      if (nx < 0 || nx >= xs || ny < 0 || ny >= ys || nz < 0 || nz >= zs) continue;
      if (t[nx][ny][nz].flag) flags--;
    }
    if (flags != 0) return;
    for (let m = 0; m < mx.length; m++) {
      let nx = this.x + mx[m];
      let ny = this.y + my[m];
      let nz = this.z + mz[m];
      if (nx < 0 || nx >= xs || ny < 0 || ny >= ys || nz < 0 || nz >= zs) continue;
      t[nx][ny][nz].reveal();
    }
  }
  showcell() {
    if (abs(curz-this.z) > 1) return;
    stroke(0);
    let pos = curz - this.z + 1;
    if (this.mine && lost) fill(255, 0, 0, al); // mines
    else if (this.revealed) {
      if (this.rl) fill(100, 100, 255, al);
      else fill(0, 255, 0, al);
    }
    else fill(100, 100, 255, al);
    rect(this.x*xscl, (this.y+pos/3)*yscl, (this.x+1)*xscl, (this.y+(1+pos)/3)*yscl); // cell
  }
  show() {
    if (abs(curz-this.z) > 1) return;
    let pos = curz - this.z + 1;
    if (this.mine && lost) fill(255, 0, 0); // mines
    else if (this.revealed) {
      if (this.rl) fill(100, 100, 255);
      else fill(0, 255, 0);
    }
    else fill(100, 100, 255);
    if (this.flag) {
      line(this.x*xscl, (this.y+pos/3)*yscl, (this.x+1)*xscl, (this.y+(1+pos)/3)*yscl); // flag
    }
    if (this.mine && lost) {
      circle(this.x*xscl+xscl/2, (this.y+1/6+pos/3)*yscl, 3); // mine
    }
    fill(0);
    if (this.revealed && !this.mine && this.num != 0) {
      text(this.num, this.x*xscl+xscl/2, (this.y+pos/3)*yscl+8); // number
    }
  }
}
