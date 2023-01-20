// wasd - move camera
// qe - rotate camera
// x - reset rotation
// <> - change time
// Enter - launch
// arrow keys - adjust ball trajectory

let keydown = {};

document.addEventListener("keydown", (e) => {
	if (!e.repeat) {
		keydown[e.key] = true;
		if (e.key === "Escape") {
			mouseState = undefined;
			mouseDownLeft = false;
			mouseDownRight = false;
		}
	}
});

document.addEventListener("keyup", (e) => {
	keydown[e.key] = false;
});

function isKeyDown(k) {
	return keydown[k] || false;
}

const camMoveSpd = 0.2,
	camTurnSpd = 0.001;
let timeStep = 3,
	velStep = 0.01,
	angStep = 0.01;

let moveBoardOverride = false;
let lastMoveBoardAction = 0;

function keyboard(dt) {
	let move = { x: 0, y: 0 }; // Move camera
	if (isKeyDown("w")) move.y -= dt * camMoveSpd;
	if (isKeyDown("a")) move.x -= dt * camMoveSpd;
	if (isKeyDown("s")) move.y += dt * camMoveSpd;
	if (isKeyDown("d")) move.x += dt * camMoveSpd;
	if (isKeyDown("q")) {
		animateCamR(camRG + dt * camTurnSpd);
		lastMoveBoardAction = Date.now();
	}
	if (isKeyDown("e")) {
		animateCamR(camRG - dt * camTurnSpd);
		lastMoveBoardAction = Date.now();
	}
	if (isKeyDown("x")) animateCamR(0);
	if (move.x !== 0 || move.y !== 0) {
		moveBoardOverride = true;
		lastMoveBoardAction = Date.now();
		move = inverseTransformDelta(move);
		animateCamPos(camXG + move.x, camYG - move.y);
	}
	if (
		!mouseMoveBoard &&
		moveBoardOverride &&
		Date.now() - lastMoveBoardAction > 2000
	)
		moveBoardOverride = false;

	if (fullControl) {
		// Control time + ball
		if (isKeyDown(",")) {
			// shift does not work
			updateMap(-timeStep);
		} else if (isKeyDown("<")) {
			updateMap(-1);
		}
		if (isKeyDown(".")) {
			updateMap(timeStep);
		} else if (isKeyDown(">")) {
			updateMap(1);
		}
		if (isKeyDown("Enter")) {
			const projectedVelocity = ball.projectedVelocity();
			ball.launchBall(projectedVelocity.x, projectedVelocity.y);
		}
		if (isKeyDown("ArrowUp"))
			launchVel += isKeyDown("Shift") ? velStep / 10 : velStep;
		if (isKeyDown("ArrowDown"))
			launchVel -= isKeyDown("Shift") ? velStep / 10 : velStep;
		if (isKeyDown("ArrowLeft"))
			launchAng += isKeyDown("Shift") ? angStep / 10 : angStep;
		if (isKeyDown("ArrowRight"))
			launchAng -= isKeyDown("Shift") ? angStep / 10 : angStep;
		launchVel = Math.max(0, launchVel);
	}
}
