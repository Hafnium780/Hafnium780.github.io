const sleep = (milliseconds, timeout) => {
	return new Promise((r) => {
		timeout.timeout = setTimeout(r, milliseconds.t);
	});
};

export async function dijkstra(graph, update, delay, finish) {
	if (graph.startNode === undefined) return;
	let visN = Array(graph.nodes.length).fill(0);
	let timeout = { timeout: undefined };
	let prev = Array(graph.nodes.length).fill(undefined);
	let nodesLeft = graph.nodes.length;
	let visE = Array(graph.edges.length).fill(0);
	let curDist = Array(graph.nodes.length).fill(Infinity);
	let mov = { edge: -1, dir: 0 };
	curDist[graph.nodes.indexOf(graph.startNode)] = 0;

	while (nodesLeft > 0) {
		let minDist = Infinity,
			curInd = -1;
		for (let i = 0; i < graph.nodes.length; i++) {
			if (visN[i] === 0 && curDist[i] < minDist) {
				minDist = curDist[i];
				curInd = i;
			}
		}
		if (minDist === Infinity) break;
		visN[curInd] = 2;
		nodesLeft--;

		for (let ei = 0; ei < graph.nodes[curInd].edges.length; ei++) {
			const edge = graph.nodes[curInd].edges[ei];
			let edgeI = graph.edges.findIndex((e) => {
				return edge === e;
			});
			if (visE[edgeI]) continue;
			const newDist = graph.edges[edgeI].w + curDist[curInd];
			let dir;
			if (graph.edges[edgeI].n1 === graph.nodes[curInd]) {
				dir = 1;
				if (newDist < curDist[graph.nodes.indexOf(edge.n2)]) {
					let i2 = graph.nodes.indexOf(edge.n2);
					curDist[i2] = newDist;
					prev[i2] = curInd;
				}
			} else {
				dir = 2;
				if (newDist < curDist[graph.nodes.indexOf(edge.n1)]) {
					let i1 = graph.nodes.indexOf(edge.n1);
					curDist[i1] = newDist;
					prev[i1] = curInd;
				}
			}
			visE[edgeI] = 1;
			mov.edge = edgeI;
			mov.dir = dir;
			update("dijkstra", [visN, visE, mov, prev, curDist]);
			mov = { edge: -1, dir: 0 };
			await sleep(delay, timeout);
			if (delay.stop === true) return;
		}
		visN[curInd] = 1;
	}
	visN.fill(1);
	update("dijkstra", [visN, visE, mov, prev, curDist]);
	finish();
}
