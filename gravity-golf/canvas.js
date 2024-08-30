let camX = 0, // Camera coordinates, relative to focus
  camY = 0,
  RcamX = 0, // Real camera coordinates, relative to 0, 0
  RcamY = 0,
  camR = 0, // Camera rotation
  camZ = 0.1; // Camera zoom
let camRSin = 0, // Calculate sin and cos values for rotation
  camRCos = 1;
let camXG = camX, // Goal values for camera, for animation
  camYG = camY,
  camRG = camR,
  camZG = camZ;
// let camF = undefined,
// 	camFR = undefined,
// 	camFA = 0;
const board = document.getElementById("board");

function createCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  board.style = "height: " + height + "px";
  board.innerHTML =
    "<canvas id='canvas' width='" +
    width +
    "' height='" +
    height +
    "'></canvas>";
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.translate(width / 2, height / 2);
  draw();
}

window.addEventListener("resize", (e) => {
  updateHeights();
});

function transform(pos) {
  // World space to camera space
  return {
    x: camZ * ((pos.x - RcamX) * camRCos - (pos.y - RcamY) * camRSin),
    y: camZ * ((pos.x - RcamX) * camRSin + (pos.y - RcamY) * camRCos),
  };
}

function transformRadius(r) {
  return camZ * r;
}

// setInterval(() => {
// camR += 0.01;
// }, 100);

function inverseTransform(pos) {
  // Camera space to world space
  const delta = inverseTransformDelta(pos);
  return { x: delta.x + RcamX, y: -delta.y + RcamY };
}

function inverseTransformDelta(pos) {
  // Rotate vector
  return {
    x: (pos.x * camRCos + pos.y * camRSin) / camZ,
    y: (pos.x * camRSin - pos.y * camRCos) / camZ,
  };
}

// Update = set values
// Set = set values + stop animation

function updateCamPos(x, y) {
  camX = x;
  camY = y;
}

function setCamPos(x, y) {
  updateCamPos(x, y);
  camXG = x;
  camYG = y;
}

function updateCamR(r) {
  camR = r;
  camRSin = Math.sin(r);
  camRCos = Math.cos(r);
}

function setCamR(r) {
  updateCamR(r);
  camRG = r;
}

function updateCamZ(z) {
  camZ = z;
}

function setCamZ(z) {
  updateCamZ(z);
  camZG = z;
}

// Animate towards values
function animateCamPos(x, y) {
  camXG = x;
  camYG = y;
}

function animateCamR(r) {
  camRG = r;
}

function animateCamZ(z) {
  camZG = z;
}

const moveAnimationSpeed = 0.3;
const rotateAnimationSpeed = 0.3;
const zoomAnimationSpeed = 0.3;

function draw() {
  // Handle focused camera
  // Dragging and using wasd overrides focus
  // console.log(mouseMoveBoard);
  if (!moveBoardOverride) {
    if (focusMode === "ball") {
      animateCamPos(ball.x, ball.y);
      // if (camFR != undefined) {
      // 	setCamR(
      // 		camFA - Math.atan2(camFR.pos.y - camF.pos.y, camFR.pos.x - camF.pos.x)
      // 	);
      // }
    }
  }

  // Animate camera values
  updateCamPos(
    camX + (camXG - camX) * moveAnimationSpeed,
    camY + (camYG - camY) * moveAnimationSpeed
  );
  updateCamR(camR + (camRG - camR) * rotateAnimationSpeed);
  updateCamZ(camZ + (camZG - camZ) * zoomAnimationSpeed);
  RcamX = camX;
  RcamY = camY;

  // Init canvas
  ctx.clearRect(-width / 2, -height / 2, width, height);
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(-width / 2, -height / 2, width, height);
  ctx.fillStyle = "rgb(255, 255, 255)";

  // Draw paths
  // for (const planet of map.planets) {
  // 	ctx.beginPath();
  // 	for (const poss of planet.path) {
  // 		const tpos = transform(poss);
  // 		ctx.lineTo(tpos.x, tpos.y);
  // 	}
  // 	ctx.stroke();
  // }

  // Draw paths
  for (let i = 0; i < map.planets.length; i++) {
    const planet = map.planets[i];
    ctx.beginPath();
    ctx.strokeStyle = "rgb(100, 100, 100)";
    const pos = transform(map.centerOfPath(planet));
    ctx.ellipse(
      pos.x,
      pos.y,
      transformRadius(planet.a),
      transformRadius(planet.b),
      -planet.theta + camR,
      0,
      TWOPI
    );
    ctx.stroke();
  }

  // Draw planets
  for (let i = 0; i < map.planets.length; i++) {
    const planet = map.planets[i];
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.beginPath();
    const pos = transform({ x: planet.x, y: planet.y });
    ctx.arc(pos.x, pos.y, transformRadius(planet.r), 0, TWOPI);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(
      pos.x + transformRadius(planet.r) * Math.sin(-planet.rotation - camR),
      pos.y + transformRadius(planet.r) * Math.cos(-planet.rotation - camR)
    );
    ctx.stroke();
  }

  // Velocity/accel
  const ballPos = transform({ x: ball.x, y: ball.y });
  if (!fullControl) {
    ctx.strokeStyle = "rgba(255, 0, 0, 50)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ballPos.x, ballPos.y);
    ctx.lineTo(
      ballPos.x + transformRadius(ball.ax) * 5000,
      ballPos.y + transformRadius(ball.ay) * 5000
    );
    ctx.stroke();

    ctx.strokeStyle = "rgba(0, 255, 0, 50)";
    ctx.beginPath();
    ctx.moveTo(ballPos.x, ballPos.y);
    ctx.lineTo(
      ballPos.x + transformRadius(ball.vx) * 100,
      ballPos.y + transformRadius(ball.vy) * 100
    );
    ctx.stroke();
    ctx.lineWidth = 2;
  }

  // Ball
  ctx.fillStyle = "rgb(255, 255, 0)";
  ctx.beginPath();
  ctx.arc(ballPos.x, ballPos.y, transformRadius(ball.r), 0, 2 * Math.PI);
  ctx.fill();

  // Project path
  //   if (fullControl) {
  const projectedVelocity = ball.projectedVelocity();
  const projection = ball.projectPath(
    stepDt,
    projectedVelocity.x,
    projectedVelocity.y
  );
  let i = 0;
  let prev = undefined;
  for (const point of projection.path) {
    ctx.fillStyle =
      "rgba(100, 100, 100, " + (1.4 - i / projection.path.length) + ")";
    const pos = transform(point);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, transformRadius(ball.r), 0, TWOPI);
    ctx.fill();
    // for (const planet of point.planets) {
    // 	const pos = transform(planet);
    // 	ctx.fillStyle =
    // 		"rgba(160, 10, 10, " + (1 - i / projection.path.length) + ")";
    // 	ctx.beginPath();
    // 	ctx.arc(pos.x, pos.y, transformRadius(planet.r), 0, TWOPI);
    // 	ctx.fill();
    // }
    i++;
  }
  // console.log(JSON.stringify(projection.minDist));
  for (const dist of projection.minDist) {
    ctx.fillStyle = "rgba(160, 10, 10, 0.6)";
    ctx.strokeStyle = "rgba(160, 10, 160, 0.6)";
    drawPlanetInTime(dist.i, dist.t, true, { x: dist.bx, y: dist.by });
    const bPos = transform({ x: dist.bx, y: dist.by });
    ctx.fillStyle = "rgba(130, 130, 10, 0.6)";
    ctx.beginPath();
    ctx.arc(bPos.x, bPos.y, transformRadius(ball.r), 0, TWOPI);
    ctx.fill();
  }
  if (projection.planet) {
    const pos = transform(projection.planet);
    ctx.fillStyle = "rgba(10, 160, 10, 0.6)";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, transformRadius(projection.planet.r), 0, TWOPI);
    ctx.fill();
    const pos1 = transform(projection.finalPos);
    ctx.fillStyle = "rgba(160, 160, 10, 0.6)";
    ctx.beginPath();
    ctx.arc(pos1.x, pos1.y, transformRadius(ball.r), 0, TWOPI);
    ctx.fill();
  }
  //   }

  // Debug x-y axis stuff
  const origin = transform({ x: 0, y: 0 });
  ctx.fillStyle = "rgb(255, 0, 0)";
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, transformRadius(2), 0, TWOPI);
  ctx.fill();

  let pos = transform({ x: 0, y: -100 });
  ctx.strokeStyle = "rgb(255, 0, 0)";
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(pos.x, pos.y);
  ctx.lineWidth = 3;
  ctx.stroke();

  pos = transform({ x: 100, y: 0 });
  ctx.strokeStyle = "rgb(0, 0, 255)";
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(pos.x, pos.y);
  ctx.lineWidth = 3;
  ctx.stroke();

  // CoM
  // pos = transform(map.getCM());
  // ctx.fillStyle = "rgb(0, 255, 0)";
  // ctx.beginPath();
  // ctx.arc(pos.x, pos.y, transformRadius(2), 0, 2 * Math.PI);
  // ctx.fill();

  // Bounds of ball projection
  const pos1 = transform({ x: -ball.posBounds, y: -ball.posBounds });
  const pos2 = transform({ x: -ball.posBounds, y: ball.posBounds });
  const pos3 = transform({ x: ball.posBounds, y: ball.posBounds });
  const pos4 = transform({ x: ball.posBounds, y: -ball.posBounds });
  ctx.strokeStyle = "rgb(255, 255, 255)";
  ctx.beginPath();
  ctx.moveTo(pos1.x, pos1.y);
  ctx.lineTo(pos2.x, pos2.y);
  ctx.lineTo(pos3.x, pos3.y);
  ctx.lineTo(pos4.x, pos4.y);
  ctx.lineTo(pos1.x, pos1.y);
  ctx.stroke();
}

function drawPlanetInTime(i, t, lines = false, prev = undefined) {
  const planets = map.getFuturePositions(t);
  let cur = planets[i];
  let first = true;
  // console.log(cur.par || (cur && i == 0), i);
  while (cur) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(150, 150, 250, 0.6)";
    const pathPos = transform(map.centerOfPath(cur));
    ctx.ellipse(
      pathPos.x,
      pathPos.y,
      transformRadius(cur.a),
      transformRadius(cur.b),
      -cur.theta + camR,
      -cur.eccAngle - 0.8,
      -cur.eccAngle + 0.8
    );
    ctx.stroke();
    ctx.fillStyle = "rgba(160, 10, 10, 0.3)";
    ctx.beginPath();
    const planetPos = transform({ x: cur.x, y: cur.y });
    ctx.arc(planetPos.x, planetPos.y, transformRadius(cur.r), 0, TWOPI);
    ctx.fill();
    if (lines && prev) {
      const prevPos = transform(prev);
      const curPos = transform(cur);
      if (first) {
        ctx.strokeStyle = "rgba(160, 10, 160, 0.6)";
        first = false;
      } else {
        ctx.strokeStyle = "rgba(10, 160, 160, 0.2)";
      }
      ctx.beginPath();
      ctx.moveTo(prevPos.x, prevPos.y);
      ctx.lineTo(curPos.x, curPos.y);
      ctx.stroke();
    }
    prev = cur;
    cur = cur.par;
  }
}
