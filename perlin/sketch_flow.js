let sketch_flow = (s) => {
  var inc = 0.05;
  var scl = 10;
  s.scl = scl;
  var cols, rows;
  var zoff = 0;
  
  var fr;
  
  var particles = [];
  
  var flowfield = [];
  
  s.setup = () => {
    s.createCanvas(400, 300);
    cols = Math.floor(s.width/scl);
    rows = Math.floor(s.height/scl);
    s.cols = cols;
    
    flowfield = new Array(cols * rows);
    for (let i = 0; i < 1000; i++) {
      particles.push(new Particle(s, s.random(s.width), s.random(s.height)));
    }
   
    s.background(0);
  }
  
  
  s.draw = () => {
    // s.background(0, 2);
    var yoff = 0;
    for (var y = 0; y < rows; y++) {
      var xoff = 0;
      for (var x = 0; x < cols; x++) {
        var index = x + y * cols;
        var r = s.noise(xoff, yoff, zoff) * s.TWO_PI * 4;
        var v = p5.Vector.fromAngle(r);
        v.setMag(1);
        //v.add(v.angleBetween(createVector(width/cols*x-mouseX, height/rows*y-mouseY)));
        flowfield[index] = v;
        xoff += inc;
        s.stroke(100);
        s.push();
        s.translate(x * scl, y * scl);
        s.rotate(v.heading());
        s.strokeWeight(1);
        //line(0, 0, scl/2, 0);
        s.pop();
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
  }
}

new p5(sketch_flow, 'line');