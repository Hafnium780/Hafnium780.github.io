let canvas = document.getElementById("canvas");
canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d");

let mouseX = 0;
let mouseY = 0;
let v, a;
let k = 0.15;
let g = 4;

canvas.addEventListener("mousemove", (e) => {
	mouseX = e.offsetX;
	mouseY = e.offsetY;
	let tmpCoordinate = inverseTransform(mouseX, mouseY);
	v =
		Math.sqrt(
			tmpCoordinate.x * tmpCoordinate.x + tmpCoordinate.y * tmpCoordinate.y
		) / 4.5;
	a =
		tmpCoordinate.x == 0
			? Math.PI / 2
			: Math.atan(tmpCoordinate.y / tmpCoordinate.x);
});

function update() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "white";

	let tmpCoordinate;

	ctx.beginPath();
	tmpCoordinate = transform(0, 0);
	ctx.arc(tmpCoordinate.x, tmpCoordinate.y, 10, 0, Math.PI * 2);
	ctx.fill();

	let vk = v / k;
	let vkcos = vk * Math.cos(a);
	let vksin = vk * Math.sin(a);
	let gk = g / k;
	let vksingkk = vksin + gk / k;
	for (let t = 0; t < 100; t += 0.3) {
		let e = 1 - Math.exp(-k * t);
		let x = vkcos * e;
		let y = vksingkk * e - gk * t;
		ctx.beginPath();
		tmpCoordinate = transform(x, y);
		ctx.arc(tmpCoordinate.x, tmpCoordinate.y, 2, 0, Math.PI * 2);
		ctx.fill();
	}
}

function transform(x, y) {
	return { x: x, y: canvas.height - y };
}

function inverseTransform(x, y) {
	return { x: x, y: canvas.height - y };
}

setInterval(update, 1000 / 60);
