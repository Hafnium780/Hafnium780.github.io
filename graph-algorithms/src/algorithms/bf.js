const sleep = (milliseconds, timeout) => {
	return new Promise((r) => {
		timeout.timeout = setTimeout(r, milliseconds.t);
	});
};

export async function bf(graph, update, delay, finish) {
	if (graph.startNode === undefined) return;
	let timeout = { timeout: undefined };
	let prev = Array(graph.nodes.length).fill(undefined);
	let visE = Array(graph.edges.length).fill(0);
	let curDist = Array(graph.nodes.length).fill(Infinity);
	let inCycle = Array(graph.edges.length);
	curDist[graph.nodes.indexOf(graph.startNode)] = 0;

	for (let i = 0; i < graph.nodes.length - 1; i++) {
		for (const edge of graph.edges) {
			if (graph.directed) {
				if (
					curDist[graph.nodes.indexOf(edge.n1)] + edge.w <
					curDist[graph.nodes.indexOf(edge.n2)]
				) {
					curDist[graph.nodes.indexOf(edge.n2)] =
						curDist[graph.nodes.indexOf(edge.n1)] + edge.w;
					prev[graph.nodes.indexOf(edge.n2)] = graph.nodes.indexOf(edge.n1);
				}
				visE[graph.edges.indexOf(edge)] = true;
				let mov = { edge: graph.edges.indexOf(edge), dir: 1 };
				update("bf", [prev, visE, curDist, inCycle, mov]);
				await sleep(delay, timeout);
				if (delay.stop === true) return;
			} else {
				let dir = 1;
				if (
					curDist[graph.nodes.indexOf(edge.n1)] + edge.w <
					curDist[graph.nodes.indexOf(edge.n2)]
				) {
					curDist[graph.nodes.indexOf(edge.n2)] =
						curDist[graph.nodes.indexOf(edge.n1)] + edge.w;
					prev[graph.nodes.indexOf(edge.n2)] = graph.nodes.indexOf(edge.n1);
				}
				if (
					curDist[graph.nodes.indexOf(edge.n2)] + edge.w <
					curDist[graph.nodes.indexOf(edge.n1)]
				) {
					curDist[graph.nodes.indexOf(edge.n1)] =
						curDist[graph.nodes.indexOf(edge.n2)] + edge.w;
					prev[graph.nodes.indexOf(edge.n1)] = graph.nodes.indexOf(edge.n2);
					dir = 2;
				}
				visE[graph.edges.indexOf(edge)] = true;
				let mov = { edge: graph.edges.indexOf(edge), dir: dir };
				update("bf", [prev, visE, curDist, inCycle, mov]);
				await sleep(delay, timeout);
				if (delay.stop === true) return;
			}
		}
	}

	for (let i = 0; i < graph.nodes.length - 1; i++) {
		for (const edge of graph.edges) {
			if (graph.directed) {
				if (
					curDist[graph.nodes.indexOf(edge.n1)] + edge.w <
					curDist[graph.nodes.indexOf(edge.n2)]
				)
					curDist[graph.nodes.indexOf(edge.n2)] = Number.NEGATIVE_INFINITY;
			} else {
				if (
					curDist[graph.nodes.indexOf(edge.n1)] + edge.w <
					curDist[graph.nodes.indexOf(edge.n2)]
				)
					curDist[graph.nodes.indexOf(edge.n2)] = Number.NEGATIVE_INFINITY;
				if (
					curDist[graph.nodes.indexOf(edge.n2)] + edge.w <
					curDist[graph.nodes.indexOf(edge.n1)]
				)
					curDist[graph.nodes.indexOf(edge.n1)] = Number.NEGATIVE_INFINITY;
			}
		}
	}
	for (let i = 0; i < graph.nodes.length; i++) {
		let c = i;
		for (let j = 0; j <= graph.nodes.length; j++) {
			c = prev[c];
			if (c === i || c === undefined) break;
		}
		if (c === undefined || c !== i) continue;
		for (let j = 0; j <= graph.nodes.length; j++) {
			let ei = graph.edges.findIndex((e) => {
				return (
					graph.nodes.indexOf(e.n1) === prev[c] &&
					graph.nodes.indexOf(e.n2) === c
				);
			});
			inCycle[ei] = true;
			update("bf", [prev, visE, curDist, inCycle, { edge: ei, dir: 1 }]);
			await sleep(delay, timeout);
			if (delay.stop === true) return;
			c = prev[c];
			if (c === i) break;
		}
	}
	update("bf", [prev, visE, curDist, inCycle, { edge: -1, dir: 0 }]);
	finish();
}
