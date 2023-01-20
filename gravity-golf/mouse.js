let mouseX = 0, // Screen coordinates of start of mouse click, 0, 0 at center
	mouseY = 0,
	mouseDownLeft = false,
	mouseDownRight = false,
	mouseMoveBoard = false;
let mouseDownStart = { x: 0, y: 0 }; // Screen coordinates of start of mouse click
let mouseDownStartWorld = { x: 0, y: 0 }; // World coordinates of start of mouse click
let camMouseDownStart = { x: 0, y: 0 }; // Camera coordinates at start of mouse click

let mouseState = undefined;

const mouseVelScale = 0.01;

document.addEventListener("mousemove", (e) => {
	mouseX = e.clientX - width / 2;
	mouseY = e.clientY - height / 2;
});

document.addEventListener("mousedown", (e) => {
	mouseX = e.clientX - width / 2;
	mouseY = e.clientY - height / 2;
});

board.addEventListener("mousemove", (e) => {
	if (mouseMoveBoard) {
		const delta = inverseTransformDelta({
			x: e.clientX - mouseDownStart.x,
			y: e.clientY - mouseDownStart.y,
		});
		animateCamPos(camMouseDownStart.x - delta.x, camMouseDownStart.y + delta.y);
		mouseDownStart = {
			x: e.clientX,
			y: e.clientY,
		};
		camMouseDownStart = { x: camXG, y: camYG };
	}
});

board.addEventListener("mousedown", (e) => {
	mouseDownStart = {
		x: e.clientX,
		y: e.clientY,
	};
	mouseDownStartWorld = inverseTransform({
		x: e.clientX - width / 2,
		y: e.clientY - height / 2,
	});
	camMouseDownStart = { x: camX, y: camY };
	if (e.button === 0) {
		mouseDownLeft = true;
		if (mouseState === undefined) {
			mouseMoveBoard = true;
			moveBoardOverride = true;
		} else if (mouseState === "createPlanet") {
		} else {
			console.log("mouse state " + mouseState + " unrecognized");
		}
	} else if (e.button === 2) {
		mouseDownRight = true;
		if (mouseState === undefined) {
			mouseMoveBoard = true;
			moveBoardOverride = true;
		} else if (mouseState === "createPlanet") {
			if (mouseDownLeft) mouseDownLeft = false;
			else {
				mouseMoveBoard = true;
				moveBoardOverride = true;
			}
		}
	}
});

board.addEventListener("mouseup", (e) => {
	mouseMoveBoard = false;
	lastMoveBoardAction = Date.now();
	if (e.button === 0) {
		if (mouseState === "createPlanet") {
			if (mouseDownLeft) {
				const vel = inverseTransformDelta({
					x: (e.clientX - mouseDownStart.x) * mouseVelScale,
					y: (e.clientY - mouseDownStart.y) * mouseVelScale,
				});
				vel.y = -vel.y;
				map.addPlanet(mouseDownStartWorld, vel, map.massToRadius(mass), mass);
			}
		}
		mouseDownLeft = false;
	} else if (e.button === 2) {
		mouseDownRight = false;
	}
});

// board.addEventListener("mouseleave", (e) => {
// 	if (e.button === 0) {
// 		mouseDownLeft = false;
// 	} else if (e.button === 2) {
// 		mouseDownRight = false;
// 	}
// });

addEventListener("wheel", (e) => {
	lastMoveBoardAction = Date.now();
	// scuffed trickery to get old and new mouse position
	const curCamZ = camZ;
	camZ = camZG;
	let pos1 = inverseTransform({
		x: e.clientX - width / 2,
		y: e.clientY - height / 2,
	});
	camZ = curCamZ;
	animateCamZ(Math.max(0.05, camZG * (1 - e.deltaY / 1000)));
	if (focusMode === "none") {
		const curCamZ = camZ;
		camZ = camZG;
		let pos2 = inverseTransform({
			x: e.clientX - width / 2,
			y: e.clientY - height / 2,
		});
		camZ = curCamZ;
		animateCamPos(camXG + pos1.x - pos2.x, camYG + pos1.y - pos2.y);
	}
});

// let sliderMoveInterval = undefined;
// slider.addEventListener("mousedown", (e) => {
// 	clearInterval(sliderMoveInterval);
// 	sliderMoveInterval = setInterval(() => {
// 		sidebarHeight = Math.max(
// 			Math.min(window.innerHeight - mouseY - 5, 400),
// 			120
// 		);
// 		updateHeights();
// 	}, 20);
// });

document.addEventListener("mouseup", (e) => {
	// clearInterval(sliderMoveInterval);
});

// let shotInterval = undefined;

// const maxv = 200;
// const maxvsq = maxv * maxv;
// const mult = 3;

// function shoot(ball) {
// 	mouseDown = false;
// 	const dvx = (ball.x - mouseX) * mult;
// 	const dvy = (ball.y - mouseY) * mult;
// 	const sq = Math.pow(dvx, 2) + Math.pow(dvy, 2);
// 	if (sq > maxvsq) {
// 		const ang = Math.atan2(dvy, dvx);
// 		ball.vx += maxv * Math.cos(ang);
// 		ball.vy += maxv * Math.sin(ang);
// 	} else {
// 		ball.vx += dvx;
// 		ball.vy += dvy;
// 	}
// }
