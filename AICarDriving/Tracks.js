function NormalTrack() {
  pointVal = 400;
  walls.push(new Boundary(750, 50, 50, 50));
  walls.push(new Boundary(50, 50, 50, 550));
  walls.push(new Boundary(50, 550, 750, 550));
  walls.push(new Boundary(750, 550, 750, 50));
  
  walls.push(new Boundary(650, 150, 150, 150));
  walls.push(new Boundary(150, 150, 150, 450));
  walls.push(new Boundary(150, 450, 650, 450));
  walls.push(new Boundary(650, 450, 650, 150));
  
  checkpoints.push(new Checkpoint(300, 50, 300, 150));
  checkpoints.push(new Checkpoint(500, 50, 500, 150));
  checkpoints.push(new Checkpoint(750, 50, 650, 150));
  checkpoints.push(new Checkpoint(750, 150, 650, 150));
  checkpoints.push(new Checkpoint(750, 200, 650, 200));
  checkpoints.push(new Checkpoint(650, 300, 750, 300));
  checkpoints.push(new Checkpoint(750, 550, 650, 450));
  checkpoints.push(new Checkpoint(650, 450, 650, 550));
  checkpoints.push(new Checkpoint(500, 550, 500, 450));
  checkpoints.push(new Checkpoint(300, 550, 300, 450));
  checkpoints.push(new Checkpoint(50, 550, 150, 450));
  checkpoints.push(new Checkpoint(50, 450, 150, 450));
  checkpoints.push(new Checkpoint(50, 300, 150, 300));
  checkpoints.push(new Checkpoint(50, 50, 150, 150));
  checkpoints.push(new Checkpoint(150, 50, 150, 150));
}

function SharperTurns() {
  pointVal = 200;
  walls.push(new Boundary(500, 50, 50, 50));
  walls.push(new Boundary(50, 50, 50, 400));
  walls.push(new Boundary(50, 400, 200, 550));
  walls.push(new Boundary(200, 550, 600, 550));
  walls.push(new Boundary(600, 550, 650, 450));
  walls.push(new Boundary(650, 450, 500, 300));
  walls.push(new Boundary(500, 300, 550, 200));
  walls.push(new Boundary(550, 200, 500, 50));
  
  walls.push(new Boundary(383, 150, 150, 150));
  walls.push(new Boundary(150, 150, 150, 350));
  walls.push(new Boundary(150, 350, 250, 450));
  walls.push(new Boundary(250, 450, 500, 450));
  walls.push(new Boundary(500, 450, 350, 300));
  walls.push(new Boundary(350, 300, 400, 200));
  walls.push(new Boundary(400, 200, 383, 150));
  
  checkpoints.push(new Checkpoint(300, 50, 300, 150));
  checkpoints.push(new Checkpoint(350, 150, 350, 50));
  checkpoints.push(new Checkpoint(500, 50, 383, 150));
  checkpoints.push(new Checkpoint(400, 200, 550, 200));
  checkpoints.push(new Checkpoint(350, 300, 500, 300));
  checkpoints.push(new Checkpoint(400, 350, 550, 350));
  checkpoints.push(new Checkpoint(450, 400, 600, 400));
  checkpoints.push(new Checkpoint(500, 450, 650, 450));
  checkpoints.push(new Checkpoint(500, 450, 550, 550));
  checkpoints.push(new Checkpoint(500, 450, 500, 550));
  checkpoints.push(new Checkpoint(450, 450, 450, 550));
  checkpoints.push(new Checkpoint(400, 450, 400, 550));
  checkpoints.push(new Checkpoint(350, 450, 350, 550));
  checkpoints.push(new Checkpoint(250, 450, 200, 550));
  checkpoints.push(new Checkpoint(150, 350, 50, 400));
  checkpoints.push(new Checkpoint(150, 200, 50, 200));
  checkpoints.push(new Checkpoint(150, 150, 50, 50));
}
