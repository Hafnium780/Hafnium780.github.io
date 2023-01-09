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
function keyboard(dt) {
	let move = { x: 0, y: 0 };
	if (isKeyDown("w") || isKeyDown("ArrowUp"))
		move.y -= (dt * camMoveSpd) / (camZ * 1.5);
	if (isKeyDown("a") || isKeyDown("ArrowLeft"))
		move.x -= (dt * camMoveSpd) / (camZ * 1.5);
	if (isKeyDown("s") || isKeyDown("ArrowDown"))
		move.y += (dt * camMoveSpd) / (camZ * 1.5);
	if (isKeyDown("d") || isKeyDown("ArrowRight"))
		move.x += (dt * camMoveSpd) / (camZ * 1.5);
	if (isKeyDown("q")) camR -= dt * camTurnSpd;
	if (isKeyDown("e")) camR += dt * camTurnSpd;
	if (isKeyDown("x")) camR = 0;
	move = inverseTransformDelta(move);
	camX += move.x;
	camY -= move.y;
}
