function nextGeneration() {
  console.log("_________________________________________________________________");
  generation++;
  let mutation;
  let ncr;
  let index = 0;
  for (let i = 0; i < cars.length; i++) {
    tooSlow++;
    cars[i].score = -cars.length;
    savedCars.push(cars.splice(i, 1)[0]);
  }
  if (retrain) {
    if (idleGen == 2) {
      checkpointGoal--;
      if (checkpointGoal == 0) {
        checkpointGoal = checkpoints.length;
        lapGoal--;
        if (lapGoal == 0) {
          lapGoal = 1;
          checkpointGoal = 1;
        }
      }
      idleGen = 0;
      console.log("Too long idle time. Moving checkpoint back to checkpoint " + checkpointGoal + " of lap " + lapGoal);
    }
    else {
      console.log("Goal not met. Retraining with goal at checkpoint " + checkpointGoal + " of lap " + lapGoal);
    }
    evolCars = savedCars;
    mutation = 0.075;
    ncr = 0.9;
    cars[0] = new Car(200, 100, 255, 0, 0, evolCars[evolCars.length - 1].brain);
    index = 1;
    idleGen++;
  }
  else {
    if (checkpointGoal == checkpoints.length) {
      checkpointGoal = 1;
      lapGoal++;
      console.log("Goal met! Extending goal to checkpoint 1 of lap " + lapGoal);
      mutation = 0.075;
      ncr = 1;
      evolCars = savedCars;
      cars[0] = new Car(200, 100, 255, 0, 0, evolCars[evolCars.length - 1].brain);
      idleGen = 0;
    }
    else {
      checkpointGoal++;
      console.log("Goal met! Extending goal to checkpoint " + checkpointGoal + " of lap " + lapGoal);
      evolCars = passedCars;
      for (let i = 0; i < passedCars.length; i++) {
        cars[i] = new Car(200, 100, 255, 0, 0, passedCars[i].brain);
        index++;
      }
      mutation = 0.0025;
      ncr = 1;
      idleGen = 0;
    }
  }
  retrain = true;
  evolCars.sort((a, b) => a.score - b.score);
  calculateFitness();
  stats();
  for (let i = index; i < TOTAL; i++) {
    cars[i] = pickOne(ncr, mutation);
  }
  savedCars = [];
  passedCars = [];
  hitWalls = 0;
  tooSlow = 0;
}

function stats() {
  console.log("Generation " + generation);
  console.log(passedCars.length + " car(s) made it to the checkpoint.");
  console.log(hitWalls + " car(s) hit a wall.");
  console.log(tooSlow + " car(s) ran out of time.");
  console.log("Previous Generation's Best Score: " + evolCars[evolCars.length-1].score);
  best = max(best, evolCars[evolCars.length-1].score);
  console.log("All Time Best Score: " + best);
}

function pickOne(ncr, mutation) {
  let index = evolCars.length - 1;
  let child;
  ncr = 1;
  let r = random(1);
  if (r > ncr) {
    child = new Car(200, 100);
  }
  else {
    while (r > 0) {
      r = r - evolCars[index].fitness;
      index--;
    }
    index++;
    let parentA = evolCars[index];
    //r = random(1);
    //index = evolCars.length - 1;
    //while (r > 0) {
    //  r = r - evolCars[index].fitness;
    //  index--;
    //}
    //index++;
    //let parentB = evolCars[index];
    //let crossOver = new NeuralNetwork(parentA.brain);
    //let a = parentA.brain.weights_ih.toArray();
    //let b = parentB.brain.weights_ih.toArray();
    //r = floor(random(a.size));
    //for (let i = 0; i < r; i++) {
    //  a[i] = b[i];
    //}
    //crossOver.weights_ih = Matrix.fromArray(a);
    
    //a = parentA.brain.weights_ho.toArray();
    //b = parentB.brain.weights_ho.toArray();
    //r = floor(random(a.size));
    //for (let i = 0; i < r; i++) {
    //  a[i] = b[i];
    //}
    //crossOver.weights_ho = Matrix.fromArray(a);
    
    //a = parentA.brain.bias_h.toArray();
    //b = parentB.brain.bias_h.toArray();
    //r = floor(random(a.size));
    //for (let i = 0; i < r; i++) {
    //  a[i] = b[i];
    //}
    //crossOver.bias_h = Matrix.fromArray(a);
    //console.log(crossOver.bias_h);
    
    //a = parentA.brain.bias_o.toArray();
    //b = parentB.brain.bias_o.toArray();
    //r = floor(random(a.size));
    //for (let i = 0; i < r; i++) {
    //  a[i] = b[i];
    //}
    //crossOver.bias_o = Matrix.fromArray(a);
    
    child = new Car(200, 100, 255, 0, 0, parentA.brain);
    child.mutate(mutation);
  }
  return child;
}

function calculateFitness() {
  let sum = 0;
  for (let car of evolCars) {
    sum += car.score;
  }
  for (let car of evolCars) {
    car.fitness = car.score / sum;
  }
}
