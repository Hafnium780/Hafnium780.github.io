class Raycaster {
  constructor(x, y) {
    this.rays = [];
    this.pos = createVector(x, y);
    this.heading = 0;
    
    for (let a = 0; a < 360; a += 45) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }
  
  setAngle(angle) {
    this.heading = radians(angle);
    let index = 0;
    for (let a = 0; a < 360; a += 45) {
      this.rays[index].setAngle(radians(a) + this.heading);
      index++;
    }
  }
  
  update(x, y) {
    this.pos.set(x, y);
  }
  
  look(walls) {
    this.scene = [];
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let closest = null;
      let record = Infinity;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          let d = p5.Vector.dist(this.pos, pt);
          const a = ray.dir.heading() - this.heading;
          if (abs(d) < record) {
            record = abs(d);
            closest = pt;
          }
        }
      }
      //if (closest) {
      //  stroke(255, 100);
      //  line(this.pos.x, this.pos.y, closest.x, closest.y);
      //}
      this.scene.push(record);
    }
    return this.scene;
  }
}
