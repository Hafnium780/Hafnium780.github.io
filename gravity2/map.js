class Map {
	constructor(random = false) {
		this.g = 10;
		this.maxPathLength = 1000;
		this.planets = [
			// { pos: { x: 0, y: 100 }, vel: { x: 0.5, y: 0 }, r: 20, m: 30 },
			// { pos: { x: 0, y: -100 }, vel: { x: -0.5, y: 0 }, r: 20, m: 30 },
			// { pos: { x: -100, y: -100 }, vel: { x: 0.5, y: 1 }, r: 20, m: 30 },
			// { pos: { x: 100, y: -100 }, vel: { x: -2.5, y: 0 }, r: 6, m: 10 },
			// { pos: { x: 100, y: 10 }, vel: { x: 0.5, y: -1.5 }, r: 20, m: 20 },
			// { pos: { x: 10, y: 100 }, vel: { x: 0, y: 0 }, r: 10, m: 10 },
		];
		// this.addPlanet({ x: 0, y: 0 }, { x: 0.5, y: 0.1 }, 10, 10);
		// this.addPlanet({ x: 100, y: 0 }, { x: -0.25, y: -0.05 }, 10, 20);
		this.addPlanet({ x: 100, y: 100 }, { x: -1, y: -1 }, 10, 20);
		this.addPlanet({ x: -100, y: 100 }, { x: 1, y: 1 }, 10, 20);
	}

	massToRadius(m) {
		return m;
	}

	addPlanet(pos, vel, r, m) {
		this.planets.push({
			pos: pos,
			vel: vel,
			r: r,
			m: m,
			path: [],
		});
	}

	calcPE() {
		let ret = [];
		for (let i = 0; i < this.planets.length; i++) {
			ret[i] = [];
		}
		for (let i = 0; i < this.planets.length; i++) {
			ret[i][i] = 0;
			for (let j = i + 1; j < this.planets.length; j++) {
				const p1 = this.planets[i],
					p2 = this.planets[j];
				const e =
					-(this.g * p1.m * p2.m) /
					Math.sqrt(
						Math.pow(p1.pos.x - p2.pos.x, 2) + Math.pow(p1.pos.y - p2.pos.y, 2)
					);
				ret[i][j] = e;
				ret[j][i] = e;
			}
		}
		return ret;
	}

	calcKE() {
		let ret = [];
		for (const p of this.planets) {
			ret.push((p.m * (Math.pow(p.vel.x, 2) + Math.pow(p.vel.y, 2))) / 2);
		}
		return ret;
	}

	calcBoundedlessnesses() {
		const pe = this.calcPE();
		const ke = this.calcKE();
		const ret = [];
		for (let i = 0; i < this.planets.length; i++) {
			ret[i] = [];
		}
		for (let i = 0; i < this.planets.length; i++) {
			for (let j = 1; j < this.planets.length; j++) {
				if (-pe[i][j] > ke[i] + ke[j]) {
					ret[i].push(j);
					// ret[j].push(i);
				}
			}
		}
		return ret;
	}

	update(dt) {
		for (let i = 0; i < this.planets.length; i++) {
			for (let j = i + 1; j < this.planets.length; j++) {
				const p1 = this.planets[i],
					p2 = this.planets[j];
				const dvx = p1.pos.x - p2.pos.x;
				const dvy = p1.pos.y - p2.pos.y;
				const sq = Math.pow(dvx, 2) + Math.pow(dvy, 2);
				const ang = Math.atan2(dvy, dvx);
				const c = Math.cos(ang);
				const s = Math.sin(ang);
				if (sq > Math.pow(p1.r, 2) + 2 * p1.r * p2.r + Math.pow(p2.r, 2)) {
					const f = this.g / sq;
					p1.vel.x -= dt * f * p2.m * c;
					p1.vel.y -= dt * f * p2.m * s;
					p2.vel.x += dt * f * p1.m * c;
					p2.vel.y += dt * f * p1.m * s;
				} else {
					const dot =
						((p1.vel.x - p2.vel.x) * (p1.pos.x - p2.pos.x) +
							(p1.vel.y - p2.vel.y) * (p1.pos.y - p2.pos.y)) /
						(Math.pow(p1.pos.x - p2.pos.x, 2) +
							Math.pow(p1.pos.y - p2.pos.y, 2));
					const scal1 = ((2 * p2.m) / (p1.m + p2.m)) * dot;
					const scal2 = ((2 * p1.m) / (p2.m + p1.m)) * dot;
					const nv1 = {
						x: p1.vel.x - scal1 * (p1.pos.x - p2.pos.x),
						y: p1.vel.y - scal1 * (p1.pos.y - p2.pos.y),
					};
					const nv2 = {
						x: p2.vel.x - scal2 * (p2.pos.x - p1.pos.x),
						y: p2.vel.y - scal2 * (p2.pos.y - p1.pos.y),
					};
					p1.vel = nv1;
					p2.vel = nv2;
				}
			}
		}
		for (const planet of this.planets) {
			planet.pos.x += dt * planet.vel.x;
			planet.pos.y += dt * planet.vel.y;
		}
	}

	updatePath() {
		for (const planet of this.planets) {
			planet.path.push({ x: planet.pos.x, y: planet.pos.y });
			if (planet.path.length > this.maxPathLength) planet.path.splice(0, 1);
		}
	}

	getCM() {
		let m = 0,
			x = 0,
			y = 0;
		for (const planet of this.planets) {
			x += planet.pos.x * planet.m;
			y += planet.pos.y * planet.m;
			m += planet.m;
		}
		return { x: x / m, y: y / m };
	}
}
