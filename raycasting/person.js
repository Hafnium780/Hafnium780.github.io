class Person {
  constructor(x, y, a) {
    this.x = x;
    this.y = y;
    this.a = a;
    this.fr = new Ray();
    this.br = new Ray();
    camSin = sin(this.a);
    camCos = cos(this.a);
  }
  
  move(x, a) {
    this.a += a;
    if (a !== 0) {
      camSin = sin(this.a);
      camCos = cos(this.a);
    }
    this.x += x*sin(this.a);
    this.y += x*cos(this.a);
    let pos = createVector(this.x, this.y);
    
    this.fr.cast(this.x, this.y, this.a);
    this.br.cast(this.x, this.y, this.a+180);
    
    // if (this.fr.dst < 10 || this.br.dst < 10) {
    //   this.a -= a;
    //   this.x -= x*sin(this.a);
    //   this.y -= x*cos(this.a);
    // }
    
    // if (this.x > width) this.x = 0;
    // if (this.y > h) this.y = 0;
    // if (this.x < 0) this.x = width;
    // if (this.y < 0) this.y = h;
  }
  
  show() {
    ellipse(this.x, h-this.y, 3);
  }
}


function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function ptls(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  // t = max(0, min(1, t));
  return sqrt(dist2(p, createVector(v.x + t * (w.x - v.x), v.y + t * (w.y - v.y))));
}
