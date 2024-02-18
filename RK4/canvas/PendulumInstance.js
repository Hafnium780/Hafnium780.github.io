const cartW = 80;
const cartH = 10;
const massR = 16;
const stateScale = 40;

const maxPathLen = 100000;
const pathR = 4;

const vars = ["Time", "Angle", "Angular Velocity", "Position", "Velocity"];

class PendulumInstance {
  constructor(mass, rad, grav, t0, w0, x0, v0) {
    if (mass instanceof PendulumInstance) {
      const cpy = mass;
      this.nn = new NN(cpy.nn);

      this.dead = false;
      this.score = 0;
      this.m = cpy.mass;
      this.r = cpy.rad;
      this.g = cpy.grav;
      this.rk4 = new RK4(
        5,
        [0, 0, 0, 0, 0],
        [
          (state) => {
            // t' = 1
            return 1;
          },
          (state) => {
            // th'
            return state[2];
          },
          (state) => {
            // th''
            return this.aaccel(state);
          },
          (state) => {
            // x'
            return state[4];
          },
          (state) => {
            // x''
            return this.accel(state);
          },
        ],
        0.001
      );
      this.path = [];
    } else {
      this.nn = new NN([3, 1]);

      this.dead = false;
      this.score = 0;
      this.m = mass;
      this.r = rad;
      this.g = grav;
      this.rk4 = new RK4(
        5,
        [0, 0, 0, 0, 0],
        [
          (state) => {
            // t' = 1
            return 1;
          },
          (state) => {
            // th'
            return state[2];
          },
          (state) => {
            // th''
            return this.aaccel(state);
          },
          (state) => {
            // x'
            return state[4];
          },
          (state) => {
            // x''
            return this.accel(state);
          },
        ],
        0.001
      );
      this.rk4.state[1] = t0;
      this.rk4.state[2] = w0;
      this.rk4.state[3] = x0;
      this.rk4.state[4] = v0;
      this.path = [];
    }
  }

  processCollisions() {
    if (this.rk4.state[3] * stateScale + cartW / 2 >= window.innerWidth) {
      //   this.rk4.state = this.collide(this.rk4.state);
      this.dead = true;
    } else if (
      this.rk4.state[3] * stateScale - cartW / 2 <=
      -window.innerWidth
    ) {
      //   this.rk4.state = this.collide(this.rk4.state);
      this.dead = true;
    }
    // if (this.rk4.state[1] <= 0) this.dead = true;
    // if (this.rk4.state[1] >= Math.PI) this.dead = true;
    if (this.rk4.state[1] <= Math.PI / 2 - 0.3) this.dead = true;
    if (this.rk4.state[1] >= Math.PI / 2 + 0.3) this.dead = true;
  }

  collide(state) {
    return [
      state[0],
      state[1],
      state[2] - ((1 + 0.9) * state[4] * Math.sin(state[1])) / this.r,
      state[3],
      -state[4] * 0.9,
    ];
  }

  accel(state) {
    // return this.xAccel;
    // return (Math.random() - 0.5) * 100;
    const input = [
      (state[1] - Math.PI / 2) / Math.PI,
      state[2] / Math.PI,
      // state[3] / 10,
      state[4] / 10,
    ];

    this.nn.predict(input);
    this.score -= Math.abs(state[4] / 1000);
    // this.score += Math.abs(this.nn.outputValues[0] / 100);
    return this.nn.outputValues[0] * 80;
  }

  aaccel(state) {
    return (
      (1 / this.r) *
      (this.accel(state) * Math.sin(state[1]) - this.g * Math.cos(state[1]))
    );
  }

  reset(mass, rad, grav, t0, w0, x0, v0) {
    this.score = 0;
    this.m = mass;
    this.r = rad;
    this.g = grav;
    this.rk4 = new RK4(
      5,
      [0, 0, 0, 0, 0],
      [
        (state) => {
          // t' = 1
          return 1;
        },
        (state) => {
          // th'
          return state[2];
        },
        (state) => {
          // th''
          return this.aaccel(state);
        },
        (state) => {
          // x'
          return state[4];
        },
        (state) => {
          // x''
          return this.accel(state);
        },
      ],
      0.001
    );
    this.rk4.state[1] = t0;
    this.rk4.state[2] = w0;
    this.rk4.state[3] = x0;
    this.rk4.state[4] = v0;
  }

  show() {
    if (this.dead) return;

    if (this.path.length) {
      ctx.fillStyle = ctx.strokeStyle = "rgba(200, 200, 20, 100)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.path[0].x, this.path[0].y);
      for (const p of this.path) {
        // ctx.arc(p.x, p.y, pathR, 0, 2 * Math.PI);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    ctx.fillStyle = ctx.strokeStyle = "rgba(255, 255, 255, 100)";
    ctx.fillRect(
      stateScale * this.rk4.state[3] - cartW / 2,
      -cartH / 2,
      cartW,
      cartH
    );

    const massX = this.rk4.state[3] + Math.cos(this.rk4.state[1]) * this.r;
    const massY = -Math.sin(this.rk4.state[1]) * this.r;

    ctx.fillStyle = ctx.strokeStyle = "rgba(200, 100, 100, 100)";
    ctx.beginPath();
    ctx.arc(stateScale * massX, stateScale * massY, massR, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = ctx.strokeStyle = "rgba(150, 150, 150, 100)";
    ctx.beginPath();
    ctx.moveTo(stateScale * this.rk4.state[3], 0);
    ctx.lineTo(stateScale * massX, stateScale * massY);
    ctx.stroke();

    ctx.fillStyle = ctx.strokeStyle = "rgba(255, 255, 255, 100)";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      Math.round(this.score),
      stateScale * this.rk4.state[3],
      cartH * 3
    );
  }

  step() {
    if (this.dead) return;

    const massX = this.rk4.state[3] + Math.cos(this.rk4.state[1]) * this.r;
    const massY = -Math.sin(this.rk4.state[1]) * this.r;

    this.score += 0.5 - Math.abs(this.rk4.state[2]);

    // this.path.push({ x: stateScale * massX, y: stateScale * massY });
    // if (this.path.length > maxPathLen) {
    //   this.path.shift();
    // }
    this.rk4.step(20);
    this.processCollisions(this.rk4);
  }
}
