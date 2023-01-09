const body = document.body;
const slider = document.getElementById("slider");
let width;
let height;
let canvas, ctx;

const map = new Map();
openSidebar(currentSidebar);
// const ball = new Ball(10, 50);

let pt = Date.now();

let spd = 100;
let frameRateCapture = 0;
let frameRateCaptureTotal;

function update() {
	let ct = Date.now();
	if (frameRateCapture > 0) {
		frameRateCapture--;
		if (frameRateCapture === 0) printFrameRate();
	}
	if (ct - pt > 100) {
		pt = ct;
		return;
	}
	const dt = ct - pt;
	keyboard(dt);
	const time = (spd * dt) / 1000;
	for (let i = 0; i < time; i++) map.update(0.4);
	if (showPath) map.updatePath();
	draw();
	// if (mouseDown) shoot(ball);
	// ball.update((ct - pt) / 1000, map.walls);
	// pt = ct;
}

function frameRate(x = 100) {
	frameRateCapture = x;
	frameRateCaptureTotal = x;
	frameRateStartTime = Date.now();
}

function printFrameRate() {
	console.log(
		"Frame Rate Over Last " +
			frameRateCaptureTotal +
			" Frames: " +
			(frameRateCaptureTotal / (Date.now() - frameRateStartTime)) * 1000
	);
}

function updateHeights() {
	createCanvas();
	sidebar.style = "height: " + sidebarHeight + "px";
}

let interval = setInterval(update, 1000 / 60);

document.addEventListener("visibilitychange", () => {
	keydown = {};
	// clearInterval(sliderMoveInterval);
	mouseDownLeft = false;
	mouseDownRight = false;
});
