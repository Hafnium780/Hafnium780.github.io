let best = 0;
let generation = 1;
let idleGen = 0;
let checkpointGoal = 1;
let lapGoal = 1;
let TOTAL = 100;
let programmedCar;
let cars = [];
let savedCars = [];
let passedCars = [];
let walls = [];
let checkpoints = [];
let counter = 0;
let slider;
let checkpointsReached = [];
let retrain = true;
let evolCars = [];
let hitWalls = 0;
let tooSlow = 0;
let timeStep;
let pointVal;
let run = true;
let checkpointTicks = 50;

function setup() {
  slider = createSlider(1, 100, 1);
  createCanvas(800, 600);
  SharperTurns();
  programmedCar = new Car(200, 100, 0, 255, 0);
  for (let i = 0; i < TOTAL; i++) {
    cars.push(new Car(200, 100, 255, 0, 0));
  }
  for (let i = 0; i < checkpoints.length; i++) {
    checkpointsReached[i] = 0;
  }
  console.log("Generation 1");
}

function draw() {
  timeStep = slider.value();
  let timeGoal = checkpointGoal * checkpointTicks + (lapGoal-1) * checkpoints.length * checkpointTicks;
  for (let n = 0; n < timeStep; n++) {
    counter++;
    if ((counter == timeGoal || cars.length == 0) && run) {
      counter = 0;
      nextGeneration();
    }
    distances = programmedCar.raycaster.look(walls);
    programmedCar.programmedMove(distances);
    programmedCar.update();
    if (programmedCar.collisionCheck(walls)) {
      programmedCar = new Car(200, 100, 0, 255, 0);
    }
    
    if (run) {
      for (let i = 0; i < cars.length; i++) {
        let car = cars[i];
        car.score += car.vel.mag()/1000;
        car.think(car.raycaster.look(walls));
        car.update();
        if (car.collisionCheck(walls) || car.score <= 0) {
          if (car.score <= 0) {
            car.score = -cars.length;
            tooSlow++;
          }
          else {
            car.score *= 0.5;
            hitWalls++;
          }
          savedCars.push(cars.splice(i, 1)[0]);
          if (!savedCars[savedCars.length-1]) {
            savedCars.splice(savedCars.length-1, 1);
          }
        }
        else if (car.collisionCheck(new Array(checkpoints[car.nextCheckpoint]))) {
          car.score += pointVal;
          car.nextCheckpoint++;
          if (car.nextCheckpoint == checkpointGoal) {
            car.laps++;
            if (car.laps == lapGoal) {
              retrain = false;
              car.score += pointVal * 2 + timeGoal - counter;
              passedCars.push(cars.splice(i, 1)[0]);
              if (!passedCars[passedCars.length-1]) {
                passedCars.splice(passedCars.length-1, 1);
              }
            }
          }
          if (car.nextCheckpoint == checkpoints.length) {
            car.nextCheckpoint = 0;
          }
        }
      }
    }
  }
  background(0);
  
  //programmedCar.show();
  for (let car of cars) {
    car.show();
  }
  for (let wall of walls) {
    wall.show();
  }
  for (let checkpoint of checkpoints) {
    checkpoint.show();
  }
}
