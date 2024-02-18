class NN {
  constructor(n) {
    if (n instanceof NN) {
      this.nodes = n.nodes.slice();
    } else {
      this.nodes = n;
    }

    this.biases = [];
    this.weights = [];
    this.biases.push(null);
    for (let i = 0; i < this.nodes.length - 1; i++) {
      this.biases.push(new Array(this.nodes[i + 1]));
      this.weights.push(new Array(this.nodes[i]));
      for (let j = 0; j < this.weights[i].length; j++) {
        this.weights[i][j] = new Array(this.nodes[i + 1]);
      }
    }

    this.nodeValues = [];
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodeValues.push(new Array(this.nodes[i]));
    }

    this.outputValues = new Array(this.nodes[this.nodes.length - 1]);

    if (n instanceof NN) {
      this.copy(n.biases, n.weights);
    } else {
      this.randomize();
    }
  }

  activation(x) {
    return 2 / (1 + Math.exp(-2 * x)) - 1;
  }

  randomize() {
    for (const bias of this.biases) {
      if (bias == null) continue;
      for (let i = 0; i < bias.length; i++) {
        bias[i] = Math.random() * 2 - 1;
      }
    }
    for (const weight of this.weights) {
      for (const w of weight) {
        for (let i = 0; i < w.length; i++) {
          w[i] = Math.random() * 2 - 1;
        }
      }
    }
  }

  copy(biases, weights) {
    for (let b = 1; b < biases.length; b++) {
      for (let i = 0; i < biases[b].length; i++) {
        this.biases[b][i] = biases[b][i];
      }
    }
    for (let w = 0; w < weights.length; w++) {
      for (let j = 0; j < weights[w].length; j++) {
        for (let i = 0; i < weights[w][j].length; i++) {
          this.weights[w][j][i] = weights[w][j][i];
        }
      }
    }
  }

  predict(scene) {
    if (scene.length != this.nodeValues[0].length) {
      throw "Error: Scene length != Input nodes length!";
    }
    for (let i = 0; i < this.nodeValues[0].length; i++) {
      this.nodeValues[0][i] = scene[i];
    }

    for (let i = 0; i < this.nodeValues.length - 1; i++) {
      // initialize values
      for (let k = 0; k < this.nodeValues[i + 1].length; k++) {
        this.nodeValues[i + 1][k] = 0;
      }
      // propagate weights
      for (let j = 0; j < this.nodeValues[i].length; j++) {
        for (let k = 0; k < this.nodeValues[i + 1].length; k++) {
          this.nodeValues[i + 1][k] +=
            this.nodeValues[i][j] * this.weights[i][j][k];
        }
      }
      // add biases + activation
      for (let k = 0; k < this.nodeValues[i + 1].length; k++) {
        this.nodeValues[i + 1][k] = this.activation(
          this.nodeValues[i + 1][k] + this.biases[i + 1][k]
        );
      }
    }

    for (
      let k = 0;
      k < this.nodeValues[this.nodeValues.length - 1].length;
      k++
    ) {
      this.outputValues[k] = this.nodeValues[this.nodeValues.length - 1][k];
    }
  }

  mutateValue(x) {
    if (Math.random() > 0.9) {
      return Math.min(1, Math.max(0, x + Math.random() / 100 - 0.005));
    }
    return x;
  }

  mutate() {
    for (const bias of this.biases) {
      if (bias == null) continue;
      for (let i = 0; i < bias.length; i++) {
        bias[i] = this.mutateValue(bias[i]);
      }
    }
    for (const weight of this.weights) {
      for (const w of weight) {
        for (let i = 0; i < w.length; i++) {
          w[i] = this.mutateValue(w[i]);
        }
      }
    }
  }
}
