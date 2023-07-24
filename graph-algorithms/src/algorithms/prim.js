const sleep = (milliseconds, timeout) => {
	return new Promise((r) => {
		timeout.timeout = setTimeout(r, milliseconds.t);
	});
};

export async function prim(graph, update, delay, finish) {
	let visNodes = Array(graph.nodes.length).fill(false);
	let edgeInTree = Array(graph.edges.length).fill(false);
	let visEdges = Array(graph.edges.length).fill(false);
	let startNode =
		graph.startNode === undefined ? 0 : graph.nodes.indexOf(graph.startNode);
	visNodes[startNode] = true;
	let timeout = { timeout: undefined };
	let nodesLeft = graph.nodes.length - 1;
	let mov;
	while (nodesLeft > 0) {
		let curMin = Infinity;
		let curEdge = undefined;
		for (const nodeI in graph.nodes) {
			if (!visNodes[nodeI]) continue;
			const node = graph.nodes[nodeI];
			for (const edge of node.edges) {
				if (!visEdges[graph.edges.indexOf(edge)]) {
					if (edge.w < curMin) {
						curEdge = edge;
						curMin = edge.w;
					}
				}
			}
		}
		if (curEdge === undefined) {
			for (const nodeI in graph.nodes) {
				if (!visNodes[nodeI]) {
					visNodes[nodeI] = true;
					break;
				}
			}
			nodesLeft--;
			continue;
		}
		let edgeI = graph.edges.indexOf(curEdge);
		visEdges[edgeI] = true;
		let dir = 1;
		if (
			!visNodes[graph.nodes.indexOf(curEdge.n1)] ||
			!visNodes[graph.nodes.indexOf(curEdge.n2)]
		) {
			edgeInTree[edgeI] = true;
			if (visNodes[graph.nodes.indexOf(curEdge.n1)]) {
				dir = 1;
				visNodes[graph.nodes.indexOf(curEdge.n2)] = true;
			} else {
				dir = 2;
				visNodes[graph.nodes.indexOf(curEdge.n1)] = true;
			}

			nodesLeft--;
		}
		mov = { edge: graph.edges.indexOf(curEdge), dir: dir };
		update("prim", [visNodes, edgeInTree, visEdges, mov]);
		mov = { edge: -1, dir: 0 };
		await sleep(delay, timeout);
		if (delay.stop === true) return;
	}
	finish();
}
