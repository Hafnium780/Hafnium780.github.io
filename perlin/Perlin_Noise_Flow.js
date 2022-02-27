var inc = 0.05;
var scl = 10;
var cols, rows;

var zoff = 0;

var fr;

var particles = [];

var flowfield = [];

function setup() {
  createCanvas(800, 600, P2D);
  cols = floor(width/scl);
  rows = floor(height/scl);
  fr = createP('');
  
  flowfield = new Array(cols * rows);
  for (let i = 0; i < 2000; i++) {
    particles.push(new Particle(random(width), random(height)));
  }
 
  background(0);
}


function draw() {
  //background(0,5);
  var yoff = 0;
  for (var y = 0; y < rows; y++) {
    var xoff = 0;
    for (var x = 0; x < cols; x++) {
      var index = x + y * cols;
      var r = noise(xoff, yoff, zoff) * TWO_PI * 4;
      var v = p5.Vector.fromAngle(r);
      v.setMag(1);
      //v.add(v.angleBetween(createVector(width/cols*x-mouseX, height/rows*y-mouseY)));
      flowfield[index] = v;
      xoff += inc;
      stroke(100);
      push();
      translate(x * scl, y * scl);
      rotate(v.heading());
      strokeWeight(1);
      //line(0, 0, scl/2, 0);
      pop();
    }
    yoff += inc;
  
    zoff += 0.00005;
  }
  
  for (var i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }
  
  fr.html(floor(frameRate()));
}
