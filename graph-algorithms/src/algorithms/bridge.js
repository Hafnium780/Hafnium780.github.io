const sleep = (milliseconds, timeout) => {
	return new Promise((r) => {
		timeout.timeout = setTimeout(r, milliseconds.t);
	});
};
let timeout = { timeout: undefined };
let time = 0;
let nodesLeft;

export async function bridge(graph, update, delay, finish) {
	time = 0;
	let disc = Array(graph.nodes.length).fill(-1);
	let low = Array(graph.nodes.length).fill(-1);
	let bridges = Array(graph.edges.length).fill(false);
	let startNode =
		graph.startNode === undefined ? graph.nodes[0] : graph.startNode;
	let visEdges = Array(graph.edges.length).fill(false);
	nodesLeft = graph.nodes.length;
	while (nodesLeft > 0) {
		await dfs(
			graph,
			disc,
			low,
			visEdges,
			bridges,
			startNode,
			undefined,
			update,
			delay
		);
		if (delay.stop === true) return;
		for (const node of disc) {
			if (node === -1) {
				startNode = graph.nodes[disc.indexOf(node)];
				break;
			}
		}
	}
	finish();
}

async function dfs(
	graph,
	disc,
	low,
	visEdges,
	bridges,
	curNode,
	prevEdge,
	update,
	delay
) {
	let i = graph.nodes.indexOf(curNode);
	let vis = true;
	if (disc[i] === -1) {
		vis = false;
		disc[i] = time;
		low[i] = time;
		nodesLeft--;
		time++;
	}
	if (prevEdge !== undefined) {
		let mov = {
			edge: graph.edges.indexOf(prevEdge),
			dir: curNode === prevEdge.n2 ? 1 : 2,
		};
		update("bridge", [disc, low, visEdges, bridges, mov]);
		await sleep(delay, timeout);
		if (delay.stop === true) return;
	}
	if (vis) {
		return false;
	}
	for (const edge of curNode.edges) {
		if (edge === prevEdge) continue;
		// travel along edge
		let dir, nextNode;
		if (edge.n1 === curNode) {
			dir = 1;
			nextNode = edge.n2;
		} else {
			dir = 2;
			nextNode = edge.n1;
		}
		let nextI = graph.nodes.indexOf(nextNode);
		visEdges[graph.edges.indexOf(edge)] = true;
		if (
			await dfs(
				graph,
				disc,
				low,
				visEdges,
				bridges,
				nextNode,
				edge,
				update,
				delay
			)
		) {
			low[i] = Math.min(low[i], low[nextI]);
		} else {
			low[i] = Math.min(low[i], disc[nextI]);
		}
		if (delay.stop === true) return;
		if (disc[i] < low[nextI]) {
			bridges[graph.edges.indexOf(edge)] = true;
			update("bridge", [disc, low, visEdges, bridges, { edge: -1, dir: 0 }]);
		}
	}
	return true;
}
