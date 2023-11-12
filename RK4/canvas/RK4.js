class RK4 {
  constructor(ord, init, deriv, dt) {
    this.ord = ord;
    this.state = init.slice();
    this.deriv = deriv;
    this.dt = dt;
  }

  runUntil(x1, dataSkip) {
    const data = [this.state.slice()];
    let tempState;
    let cnt = 0;
    while (this.state[0] < x1) {
      const k1 = [];
      for (let i = 0; i < this.ord; i++) {
        k1[i] = this.deriv[i](this.state);
      }
      const k2 = [];
      tempState = this.state.slice();
      for (let i = 0; i < this.ord; i++) {
        tempState[i] += (k1[i] * this.dt) / 2;
      }
      for (let i = 0; i < this.ord; i++) {
        k2[i] = this.deriv[i](tempState);
      }
      const k3 = [];
      tempState = this.state.slice();
      for (let i = 0; i < this.ord; i++) {
        tempState[i] += (k2[i] * this.dt) / 2;
      }
      for (let i = 0; i < this.ord; i++) {
        k3[i] = this.deriv[i](tempState);
      }
      const k4 = [];
      tempState = this.state.slice();
      for (let i = 0; i < this.ord; i++) {
        tempState[i] += k3[i] * this.dt;
      }
      for (let i = 0; i < this.ord; i++) {
        k4[i] = this.deriv[i](tempState);
      }

      for (let i = 0; i < this.ord; i++) {
        let avg = (this.dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
        this.state[i] += avg;
      }
      if (cnt % dataSkip == 0) data.push(this.state.slice());
      cnt++;
    }
    console.log("Points returned: ", data.length);
    return data;
  }

  step(steps) {
    let tempState;
    for (let i = 0; i < steps; i++) {
      const k1 = [];
      for (let i = 0; i < this.ord; i++) {
        k1[i] = this.deriv[i](this.state);
      }
      const k2 = [];
      tempState = this.state.slice();
      for (let i = 0; i < this.ord; i++) {
        tempState[i] += (k1[i] * this.dt) / 2;
      }
      for (let i = 0; i < this.ord; i++) {
        k2[i] = this.deriv[i](tempState);
      }
      const k3 = [];
      tempState = this.state.slice();
      for (let i = 0; i < this.ord; i++) {
        tempState[i] += (k2[i] * this.dt) / 2;
      }
      for (let i = 0; i < this.ord; i++) {
        k3[i] = this.deriv[i](tempState);
      }
      const k4 = [];
      tempState = this.state.slice();
      for (let i = 0; i < this.ord; i++) {
        tempState[i] += k3[i] * this.dt;
      }
      for (let i = 0; i < this.ord; i++) {
        k4[i] = this.deriv[i](tempState);
      }

      for (let i = 0; i < this.ord; i++) {
        let avg = (this.dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
        this.state[i] += avg;
      }
    }
    return this.state;
  }
}
