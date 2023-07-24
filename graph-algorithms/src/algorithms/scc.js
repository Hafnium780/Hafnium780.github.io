const sleep = (milliseconds, timeout) => {
	return new Promise((r) => {
		timeout.timeout = setTimeout(r, milliseconds.t);
	});
};
let timeout = { timeout: undefined };
let time = 0;
let nodesLeft;

export async function scc(graph, update, delay, finish) {
	time = 0;
	let disc = Array(graph.nodes.length).fill(-1);
	let low = Array(graph.nodes.length).fill(-1);
	let onStack = Array(graph.nodes.length).fill(false);
	let stack = [];
	let startNode =
		graph.startNode === undefined ? graph.nodes[0] : graph.startNode;
	let visEdges = Array(graph.edges.length).fill(false);
	nodesLeft = graph.nodes.length;
	while (nodesLeft > 0) {
		await dfs(
			graph,
			disc,
			low,
			onStack,
			stack,
			visEdges,
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
	onStack,
	stack,
	visEdges,
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
		stack.push(i);
		onStack[i] = true;
	}
	if (prevEdge !== undefined) {
		visEdges[graph.edges.indexOf(prevEdge)] = true;
		let mov = {
			edge: graph.edges.indexOf(prevEdge),
			dir: curNode === prevEdge.n2 ? 1 : 2,
		};
		update("scc", [disc, low, onStack, visEdges, mov]);
		await sleep(delay, timeout);
		if (delay.stop === true) return;
	}
	if (vis) {
		return;
	}

	for (const edge of curNode.edges) {
		let n2 = edge.n1 === curNode ? edge.n2 : edge.n1;
		let i2 = graph.nodes.indexOf(n2);
		await dfs(
			graph,
			disc,
			low,
			onStack,
			stack,
			visEdges,
			n2,
			edge,
			update,
			delay
		);
		if (delay.stop === true) return;
		if (onStack[i2]) low[i] = Math.min(low[i], low[i2]);
	}

	if (disc[i] === low[i]) {
		do {
			let i1 = stack.pop();
			onStack[i1] = false;
			low[i1] = disc[i];
		} while (onStack[i]);
	}
	update("scc", [disc, low, onStack, visEdges, { edge: -1, dir: 0 }]);
}
