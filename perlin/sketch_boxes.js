let sketch_boxes = (s) => {
  let scl = 10;
  let noiseScl = 20;
  let xcnt, ycnt;
  let z = Math.random()*100000;
  
  s.setup = () => {
    s.createCanvas(400, 300);
    xcnt = s.width/scl;
    ycnt = s.height/scl;
  }
  
  s.draw = () => {
    s.background(0);
    s.noStroke();
    for (let x = 0; x < xcnt; x++) {
      for (let y = 0; y < ycnt; y++) {
        s.fill(255*s.noise(x/noiseScl, y/noiseScl, z));
        s.rect(x*scl, y*scl, scl, scl);
      }
    }
    z += 0.005;
  }
}

new p5(sketch_boxes, 'line');