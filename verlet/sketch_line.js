let sketch_line = (s) => {
  let particles = [];
  let particleCount = 80;
  let dt = 0.05;
  let drag = 0.0005;
  let len = 10;
  let substeps = 1;
  let subsubsteps = 100;
  let lenSlider, particleSlider, linesBox;

  s.setup = () => {
    s.createCanvas(600, 650);
    lenSlider = s.createSlider(1, 15, 4);
    particleSlider = s.createSlider(10, 200, 80, 1);
    linesBox = s.createCheckbox("Draw Lines", true);
    generateParticles();
    // particles[particleCount-1].move = false;
  }
  
  function generateParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles[i] = new Particle(s.width/2, s.height/2, 1, 4, true);
    }
    particles[0].move = false;
    particles[particleCount-1].move = false;
  }


  s.draw = () => {
    len = lenSlider.value();
    if (particleCount != particleSlider.value()) {
      particleCount = particleSlider.value();
      generateParticles();
    }
    s.background(0);
    s.fill(255);
    s.stroke(255);
    s.strokeWeight(0);
    s.text("Distance Between Points", 0, s.height-10);
    s.text("Number of Points", 150, s.height-10);
    
    if (s.mouseX > 0 && s.mouseX < s.width && s.mouseY > 0 && s.mouseY < s.height) {
      particles[0].x = s.mouseX;
      particles[0].y = s.mouseY;
    }
    for (let s = 0; s < substeps; s++) {
      for (let i = 0; i < particleCount; i++) {
        particles[i].update(0, 100, drag, dt);
        // console.log(particles[i]);
        // if (i != particleCount-1) constraint(particles[i], particles[i+1], len);
      }

      for (let ss = 0; ss < subsubsteps; ss++) {
        for (let i = 0; i < particleCount; i++) {
          if (i != 0) constrainRigid(particles[i], particles[i-1], len, 10);
        }
      }
    }

    for (let i = 0; i < particleCount-1; i++) {
      if (linesBox.checked()) {
        s.strokeWeight(4);
        s.line(particles[i].x, particles[i].y, particles[i+1].x, particles[i+1].y);
      }
      else {
        particles[i].show(s);
      }
    }
  }
}

new p5(sketch_line, 'line');
