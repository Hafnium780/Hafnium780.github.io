class Ball {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
		this.stopped = true;
	}

	update(dt, walls) {
		const x1 = this.x;
		const y1 = this.y;
		this.vx *= 0.98;
		this.vy *= 0.98;
		this.x += this.vx * dt;
		this.y += this.vy * dt;
		const x2 = this.x;
		const y2 = this.y;
		const a1 = Math.atan2(y2 - y1, x2 - x1);
		for (const wall of walls) {
			const x3 = wall.x1;
			const y3 = wall.y1;
			const x4 = wall.x2;
			const y4 = wall.y2;
			const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
			const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
			const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / d;
			if (0 <= t && t <= 1 && 0 <= u && u <= 1) {
				const px = u * (x4 - x3) + x3;
				const py = u * (y4 - y3) + y3;
				const a2 = Math.atan2(y4 - y3, x4 - x3);
				// let a = Math.min(Math.abs(a2 - a1), Math.abs(a1 - a2));
				let a = a2 - a1;
				const cv = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
				// console.log((a1 / Math.PI) * 180, ((a + a2) / Math.PI) * 180);
				this.vy = cv * Math.sin(a + a2);
				this.vx = cv * Math.cos(a + a2);
				if (a > Math.PI / 2) {
					a = Math.PI - a;
				}
				// console.log(px + u * this.vx * dt, py + u * this.vy * dt);
				this.x = px + u * this.vx * dt;
				this.y = py + u * this.vy * dt;
				break;
			}
		}
		if (Math.abs(this.vx) < 1 && Math.abs(this.vy) < 1) {
			this.vx = 0;
			this.vy = 0;
			this.stopped = true;
		} else if (this.stopped) {
			this.stopped = false;
		}
	}
}
