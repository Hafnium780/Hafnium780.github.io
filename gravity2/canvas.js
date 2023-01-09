let camX = 0,
	camY = 0,
	RcamX = 0,
	RcamY = 0,
	camR = 0,
	camZ = 1;
let camF = undefined,
	camFR = undefined,
	camFA = 0;
const board = document.getElementById("board");

function createCanvas() {
	width = window.innerWidth;
	height = window.innerHeight - (currentSidebar === -1 ? 0 : sidebarHeight);
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
	const s = Math.sin(camR);
	const c = Math.cos(camR);
	return {
		x: camZ * ((pos.x - RcamX) * c - (pos.y - RcamY) * s),
		y: camZ * ((pos.x - RcamX) * s + (pos.y - RcamY) * c),
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
	const s = -Math.sin(camR);
	const c = Math.cos(camR);
	return {
		x: (pos.x * c - pos.y * s) / camZ,
		y: (-pos.x * s - pos.y * c) / camZ,
	};
}

function focus(p, r = -1) {
	unFocus();
	camF = map.planets[p];
	if (r !== -1) {
		camFR = map.planets[r];
		camFA =
			Math.atan2(camFR.pos.y - camF.pos.y, camFR.pos.x - camF.pos.x) + camR;
	}
	camX = 0;
	camY = 0;
}

function unFocus() {
	if (camF !== undefined) {
		camX += camF.pos.x;
		camY += camF.pos.y;
		if (camFR !== undefined) {
			camR =
				camFA - Math.atan2(camFR.pos.y - camF.pos.y, camFR.pos.x - camF.pos.x);
			camFR = undefined;
		}
	}
	camF = undefined;
}

function draw() {
	RcamX = camX;
	RcamY = camY;
	if (camF != undefined) {
		RcamX += camF.pos.x;
		RcamY += camF.pos.y;
		if (camFR != undefined) {
			camR =
				camFA - Math.atan2(camFR.pos.y - camF.pos.y, camFR.pos.x - camF.pos.x);
		}
	}
	ctx.clearRect(-width / 2, -height / 2, width, height);
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.fillRect(-width / 2, -height / 2, width, height);
	ctx.fillStyle = "rgb(255, 255, 255)";
	if (showPath) {
		for (const planet of map.planets) {
			ctx.beginPath();
			for (const poss of planet.path) {
				const tpos = transform(poss);
				ctx.lineTo(tpos.x, tpos.y);
			}
			ctx.stroke();
		}
	}

	let bounded;
	if (calculateEscapeEnergy) {
		bounded = map.calcBoundedlessnesses();
	}
	for (let i = 0; i < map.planets.length; i++) {
		const planet = map.planets[i];
		if (calculateEscapeEnergy) {
			ctx.strokeStyle = "rgb(255, 255, 255)";
			for (const oplanet of bounded[i]) {
				ctx.beginPath();
				const pos = transform(planet.pos),
					pos1 = transform(map.planets[oplanet].pos);
				ctx.moveTo(pos.x, pos.y);
				ctx.lineTo(pos1.x, pos1.y);
				ctx.stroke();
			}
			// const tpe = pe[i].reduce((a, b) => a + b);
			// if (-tpe < ke[i]) ctx.fillStyle = "rgb(255, 0, 0)";
			// else ctx.fillStyle = "rgb(255, 255, 255)";
		} else ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.beginPath();
		const pos = transform(planet.pos);
		ctx.arc(pos.x, pos.y, transformRadius(planet.r), 0, 2 * Math.PI);
		ctx.fill();
	}

	const origin = transform({ x: 0, y: 0 });
	ctx.fillStyle = "rgb(255, 0, 0)";
	ctx.beginPath();
	ctx.arc(origin.x, origin.y, transformRadius(2), 0, 2 * Math.PI);
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

	pos = transform(map.getCM());
	ctx.fillStyle = "rgb(0, 255, 0)";
	ctx.beginPath();
	ctx.arc(pos.x, pos.y, transformRadius(2), 0, 2 * Math.PI);
	ctx.fill();

	if (mouseDownLeft && mouseState === "createPlanet") {
		pos = transform(mouseDownStartWorld);
		ctx.fillStyle = "rgb(255, 255, 0)";
		ctx.beginPath();
		ctx.arc(
			pos.x,
			pos.y,
			transformRadius(map.massToRadius(mass)),
			0,
			2 * Math.PI
		);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(pos.x, pos.y);
		ctx.lineTo(mouseX, mouseY);
		ctx.stroke();
	}
}
