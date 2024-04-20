class Ball {
  constructor(x, y, m, r) {
    this.x = x;
    this.y = y;
    this.vx = 2;
    this.vy = 1;
    this.ax = 0;
    this.ay = 0;
    this.stopped = false;
    this.offsetR = 0;
    this.offsetPlanet = undefined;
    this.m = m;
    this.r = r;
    this.posBounds = 12000;
  }

  update(dt) {
    if (this.stopped) {
      this.x =
        this.offsetPlanet.x +
        (this.offsetPlanet.r + this.r) *
          Math.cos(this.offsetR + this.offsetPlanet.rotation);
      this.y =
        this.offsetPlanet.y +
        (this.offsetPlanet.r + this.r) *
          Math.sin(this.offsetR + this.offsetPlanet.rotation);
      return;
    }
    this.ax = 0;
    this.ay = 0;
    for (const planet of map.planets) {
      const r = Math.sqrt((this.x - planet.x) ** 2 + (this.y - planet.y) ** 2);
      this.ax +=
        (map.g * map.radiusToMass(planet.r) * (planet.x - this.x)) / r ** 3;
      this.ay +=
        (map.g * map.radiusToMass(planet.r) * (planet.y - this.y)) / r ** 3;
    }
    this.vx += this.ax * dt;
    this.vy += this.ay * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    for (const planet of map.planets) {
      if (
        (planet.r + this.r) ** 2 >
        (planet.x - this.x) ** 2 + (planet.y - this.y) ** 2
      ) {
        this.stopped = true;
        ballStop();
        this.offsetPlanet = planet;
        this.offsetR =
          Math.atan2(this.y - planet.y, this.x - planet.x) -
          this.offsetPlanet.rotation;
        this.x =
          this.offsetPlanet.x +
          (this.offsetPlanet.r + this.r) *
            Math.cos(this.offsetR + this.offsetPlanet.rotation);
        this.y =
          this.offsetPlanet.y +
          (this.offsetPlanet.r + this.r) *
            Math.sin(this.offsetR + this.offsetPlanet.rotation);
        // if (focusMode === "ball") {
        // 	animateCamR(-this.offsetR - this.offsetPlanet.rotation - Math.PI / 2);
        // }
        // 	const vel =
        // 		planet.a === 0
        // 			? 0
        // 			: Math.sqrt(
        // 					map.g *
        // 						map.radiusToMass(planet.r) *
        // 						(2 /
        // 							Math.sqrt(
        // 								(planet.x - planet.par.x) ** 2 +
        // 									(planet.y - planet.par.y) ** 2
        // 							) -
        // 							1 / planet.a)
        // 			  );
        // 	const ang = Math.atan2(
        // 		-planet.y * planet.a * planet.a,
        // 		planet.x * planet.b * planet.b
        // 	);
        // 	const vel1 = { x: vel * Math.cos(ang), y: vel * Math.sin(ang) };
        // 	// console.log(vel1);
        // 	const vel2 = { x: this.vx, y: this.vy };
        // 	const dot =
        // 		((vel1.x - vel2.x) * (planet.x - this.x) +
        // 			(vel1.y - vel2.y) * (planet.y - this.y)) /
        // 		(Math.pow(planet.x - this.x, 2) + Math.pow(planet.y - this.y, 2));
        // 	// const scal1 = ((2 * p2.m) / (p1.m + p2.m)) * dot;
        // 	const scal2 =
        // 		((2 * map.radiusToMass(planet.r)) /
        // 			(this.m + map.radiusToMass(planet.r))) *
        // 		dot;
        // 	// if (Math.abs(scal2) < 0.0001) this.stopped = true;
        // 	// const nv1 = {
        // 	// 	x: vel1.x - scal1 * (planet.x - this.x),
        // 	// 	y: vel1.y - scal1 * (planet.y - this.y),
        // 	// };
        // 	this.vx = vel2.x - scal2 * (this.x - planet.x);
        // 	this.vy = vel2.y - scal2 * (this.y - planet.y);
      }
    }
  }

  projectPath(dt, vx, vy) {
    let x = this.x;
    let y = this.y;
    const path = [];
    const prevDist = []; // previous
    const pprevDist = []; // previous previous
    const minDistOut = []; // If current distance < prev and next dist, add it
    for (const i in map.planets) {
      prevDist[i] = {
        d: Infinity,
        bx: x,
        by: y,
        px: map.planets[i].x,
        py: map.planets[i].y,
        pr: map.planets[i].r,
      };
      pprevDist[i] = { d: Infinity };
    }
    let time = 0;
    let steps = 0;
    while (steps < maxProjectionSteps) {
      time += dt;
      steps++;
      const curPlanets = map.getFuturePositions(time);
      let ax = 0,
        ay = 0;
      for (const i in curPlanets) {
        const planet = curPlanets[i];
        const r = Math.sqrt((x - planet.x) ** 2 + (y - planet.y) ** 2);
        if (
          prevDist[i].d < 8 * curPlanets[i].r &&
          prevDist[i].d < pprevDist[i].d &&
          prevDist[i].d < r
        )
          minDistOut.push(prevDist[i]);
        pprevDist[i] = prevDist[i];
        prevDist[i] = {
          d: r,
          bx: x,
          by: y,
          i: i,
          t: time,
        };
        // console.log(prevDist[i]);
        ax += (map.g * planet.m * (planet.x - x)) / r ** 3;
        ay += (map.g * planet.m * (planet.y - y)) / r ** 3;
      }
      vx += ax * dt;
      vy += ay * dt;
      x += vx * dt;
      y += vy * dt;
      if (steps % projectStep === 0) {
        const toPush = { x: x, y: y, planets: [] };
        // if (showPlanetProjection)
        // 	for (const planet of curPlanets) {
        // 		toPush.planets.push({ x: planet.x, y: planet.y, r: planet.r });
        // 	}
        path.push(toPush);
      }
      if (Math.abs(x) > this.posBounds || Math.abs(y) > this.posBounds)
        return {
          planet: undefined,
          path: path,
          finalPos: undefined,
          minDist: minDistOut,
        };
      for (const planet of curPlanets) {
        if (
          (planet.r + this.r) ** 2 >
          (planet.x - x) ** 2 + (planet.y - y) ** 2
        ) {
          const ang = Math.atan2(y - planet.y, x - planet.x);
          return {
            planet: planet,
            path: path,
            finalPos: {
              x: planet.x + (planet.r + this.r) * Math.cos(ang),
              y: planet.y + (planet.r + this.r) * Math.sin(ang),
            },
            minDist: minDistOut,
          };
        }
      }
    }
    return {
      planet: undefined,
      path: path,
      finalPos: undefined,
      minDist: minDistOut,
    };
  }

  projectedVelocity() {
    if (this.stopped) {
      return {
        x:
          launchVel *
          Math.sin(launchAng - this.offsetPlanet.rotation - this.offsetR),
        y:
          launchVel *
          Math.cos(launchAng - this.offsetPlanet.rotation - this.offsetR),
      };
    } else {
      return { x: this.vx, y: this.vy };
    }
  }

  launchBall(vx, vy) {
    skipUpdate = true;
    ballStart();
    this.stopped = false;
    this.vx = vx;
    this.vy = vy;
  }
}
