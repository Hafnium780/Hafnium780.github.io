class Map {
	constructor(random = false) {
		this.g = 25;
		this.maxPathLength = 1000;
		this.planets = [];
	}

	radiusToMass(r) {
		return r;
	}

	// mean anomaly -> eccentric anomaly using newton method
	meanToEccentric(mean, ecc) {
		let guess = mean;
		const precision = 1e-3;
		let maxIt = 100;
		while (maxIt--) {
			let diff = guess - ecc * Math.sin(guess) - mean;
			if (Math.abs(diff) < precision) break;
			let diffdiff = 1 - ecc * Math.cos(guess);
			guess = guess - diff / diffdiff;
		}
		return guess;
	}

	getPlanetPosDelta(planet) {
		const eccAngle = this.meanToEccentric(
			planet.curTheta - planet.theta,
			planet.ecc
		);
		planet.eccAngle = eccAngle;
		const x = Math.cos(eccAngle) * planet.a - planet.c;
		const y = -Math.sin(eccAngle) * planet.b;
		return {
			x: x * planet.cos + y * planet.sin,
			y: y * planet.cos - x * planet.sin,
		};
	}

	// get world planet position, takes its a, b, mean theta + rotation
	getPlanetPos(planet) {
		const delta = this.getPlanetPosDelta(planet);
		return {
			x: delta.x + planet.par.x,
			y: delta.y + planet.par.y,
		};
	}

	// center of ellipse
	centerOfPath(planet) {
		return {
			x: (planet.par ? planet.par.x : 0) - planet.c * planet.cos,
			y: (planet.par ? planet.par.y : 0) + planet.c * planet.sin,
		};
	}

	addPlanet(parI, a, b, theta, theta_0, r, rotRate) {
		const ecc = a === 0 ? 1 : Math.sqrt(1 - (b / a) ** 2);
		const cos = Math.cos(theta);
		const sin = Math.sin(theta);
		const planet = {
			par: parI >= 0 ? this.planets[parI] : { x: 0, y: 0 },
			parI: parI,
			a: a,
			b: b,
			c: Math.sqrt(a ** 2 - b ** 2),
			theta: theta,
			curTheta: theta_0,
			w: a === 0 ? 0 : Math.sqrt((this.g * this.radiusToMass(r)) / a ** 3),
			r: r,
			cos: cos,
			sin: sin,
			ecc: ecc,
			eccAngle: 0,
			rotation: 0,
			rotationRate: rotRate,
		};
		({ x: planet.x, y: planet.y } = this.getPlanetPos(planet));
		this.planets.push(planet);
	}

	generateRandom(n) {
		// const orbits = 1 + Math.floor(Math.random() * (n - 1));
		this.planets = [];
		this.addPlanet(-1, 0, 0, 0, 0, 500, 0.003); // center, motionless
		this.addPlanet(0, 1800, 1500, Math.PI / 3, 0, 100, 0.001);
		this.addPlanet(1, 320, 300, Math.PI, 0, 20, 0.002);
		this.addPlanet(0, 2000, 1900, 0, 0, 80, 0.005);
		this.addPlanet(0, 4000, 3800, 0, 0, 120, 0.005);
		this.addPlanet(4, 640, 600, 0, 0, 70, 0.007);
		this.addPlanet(5, 200, 190, 0, 0, 40, 0.002);
	}

	// calcPE() {
	// 	let ret = [];
	// 	for (let i = 0; i < this.planets.length; i++) {
	// 		ret[i] = [];
	// 	}
	// 	for (let i = 0; i < this.planets.length; i++) {
	// 		ret[i][i] = 0;
	// 		for (let j = i + 1; j < this.planets.length; j++) {
	// 			const p1 = this.planets[i],
	// 				p2 = this.planets[j];
	// 			const e =
	// 				-(this.g * p1.m * p2.m) /
	// 				Math.sqrt(
	// 					Math.pow(p1.pos.x - p2.pos.x, 2) + Math.pow(p1.pos.y - p2.pos.y, 2)
	// 				);
	// 			ret[i][j] = e;
	// 			ret[j][i] = e;
	// 		}
	// 	}
	// 	return ret;
	// }

	// calcKE() {
	// 	let ret = [];
	// 	for (const p of this.planets) {
	// 		ret.push((p.m * (Math.pow(p.vel.x, 2) + Math.pow(p.vel.y, 2))) / 2);
	// 	}
	// 	return ret;
	// }

	// calcBoundedlessnesses() {
	// 	const pe = this.calcPE();
	// 	const ke = this.calcKE();
	// 	const ret = [];
	// 	for (let i = 0; i < this.planets.length; i++) {
	// 		ret[i] = [];
	// 	}
	// 	for (let i = 0; i < this.planets.length; i++) {
	// 		for (let j = 1; j < this.planets.length; j++) {
	// 			if (-pe[i][j] > ke[i] + ke[j]) {
	// 				ret[i].push(j);
	// 				// ret[j].push(i);
	// 			}
	// 		}
	// 	}
	// 	return ret;
	// }

	update(dt) {
		for (const planet of this.planets) {
			planet.curTheta += dt * planet.w;
			planet.rotation += dt * planet.rotationRate;
			planet.curTheta = ((planet.curTheta % TWOPI) + TWOPI) % TWOPI;
			planet.rotation = ((planet.rotation % TWOPI) + TWOPI) % TWOPI;
			({ x: planet.x, y: planet.y } = this.getPlanetPos(planet));
		}
	}

	getFuturePositions(dt) {
		const ret = [];
		for (const planet of this.planets) {
			planet.origTheta = planet.curTheta;
			planet.origEccAngle = planet.eccAngle;
			planet.origX = planet.x;
			planet.origY = planet.y;
			planet.curTheta += dt * planet.w;
			planet.curTheta = ((planet.curTheta % TWOPI) + TWOPI) % TWOPI;
			const pos = this.getPlanetPos(planet);
			planet.x = pos.x;
			planet.y = pos.y;
			ret.push({
				x: pos.x,
				y: pos.y,
				a: planet.a,
				b: planet.b,
				c: planet.c,
				cos: planet.cos,
				sin: planet.sin,
				theta: planet.theta,
				par: planet.parI >= 0 ? ret[planet.parI] : undefined,
				m: this.radiusToMass(planet.r),
				r: planet.r,
			});
		}

		for (const planet of this.planets) {
			planet.curTheta = planet.origTheta;
			planet.eccAngle = planet.origEccAngle;
			planet.x = planet.origX;
			planet.y = planet.origY;
		}
		return ret;
	}

	// updatePath() {
	// 	for (const planet of this.planets) {
	// 		planet.path.push({ x: planet.pos.x, y: planet.pos.y });
	// 		if (planet.path.length > this.maxPathLength) planet.path.splice(0, 1);
	// 	}
	// }

	// getCM() {
	// 	let m = 0,
	// 		x = 0,
	// 		y = 0;
	// 	for (const planet of this.planets) {
	// 		x += planet.pos.x * planet.m;
	// 		y += planet.pos.y * planet.m;
	// 		m += planet.m;
	// 	}
	// 	return { x: x / m, y: y / m };
	// }
}
