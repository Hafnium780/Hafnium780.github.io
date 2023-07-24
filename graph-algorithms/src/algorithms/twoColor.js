const sleep = (milliseconds, timeout) => {
	return new Promise((r) => {
		timeout.timeout = setTimeout(r, milliseconds.t);
	});
};

export async function twoColor(graph, update, delay, finish) {
	let color = Array(graph.nodes.length).fill(-1);
	let timeout = { timeout: undefined };
	let queue = [
		graph.startNode === undefined ? 0 : graph.nodes.indexOf(graph.startNode),
	];
	let visE = Array(graph.edges.length).fill(false);
	let err = Array(graph.edges.length).fill(false);
	let mov;
	if (graph.nodes.length === 0) {
		finish();
		return;
	}
	color[queue[0]] = 0;
	while (queue.length > 0) {
		let cur = queue[0];
		queue.splice(0, 1);
		for (const edge of graph.nodes[cur].edges) {
			let edgeI = graph.edges.indexOf(edge);
			if (visE[edgeI]) continue;
			let dir;
			if (edge.n1 === graph.nodes[cur]) {
				dir = 1;
				let i = graph.nodes.indexOf(edge.n2);
				if (color[i] === -1) {
					color[i] = swap(color[cur]);
					queue.push(i);
				} else if (color[i] != swap(color[cur])) {
					err[edgeI] = true;
				}
			} else {
				dir = 2;
				let i = graph.nodes.indexOf(edge.n1);
				if (color[i] === -1) {
					color[i] = swap(color[cur]);
					queue.push(i);
				} else if (color[i] != swap(color[cur])) {
					err[edgeI] = true;
				}
			}
			visE[edgeI] = true;
			mov = { edge: edgeI, dir: dir };
			update("twoColor", [color, visE, err, mov]);
			mov = { edge: -1, dir: 0 };
			await sleep(delay, timeout);
			if (delay.stop === true) return;
		}
	}
	finish();
}

function swap(c) {
	return c ? 0 : 1;
}
