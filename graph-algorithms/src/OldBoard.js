import React from "react";
import UI from "./UI.js";
import Node from "./Node.js";
import Edge from "./Edge.js";
import { dijkstra } from "./algorithms/dijkstra.js";

/*
mouseState

0 - Nothing
1 - Placing node
2 - First edge node
3 - Second edge node
4 - Assign start node
5 - Assign end node
6 - Fix/unfix node
7 - Delete node/edge

*/

export default class Board extends React.Component {
	state = {};
	firstNode = -1;
	nodeRadius = 20;
	interval;
	saveInterval;
	dampen = 0.9;

	constructor(props) {
		super(props);

		this.state = {
			nodes: [],
			edges: [],
			weights: [],
			startNode: -1,
			endNode: -1,
			mouseState: 0,
			selection: { type: -1, i: 0 },
			edgeForce: 0.01,
			moving: true,
			wScale: 30,
			mov: { edge: -1, dir: 0 },
		};
	}

	delete = () => {
		this.setState({ mouseState: 7 });
	};

	clickEdge = (i, shft) => {
		this.setState({
			selection: {
				type: 1,
				i: i,
				i1: this.state.edges[i].i1,
				i2: this.state.edges[i].i2,
				w: this.state.edges[i].w,
				changeW: this.edgeWeight,
			},
		});
		switch (this.state.mouseState) {
			case 7: {
				let newNodes = this.state.nodes.slice();
				let newEdges = this.state.edges.slice();
				let i1 = newEdges[i].i1;
				let i2 = newEdges[i].i2;
				// newNodes[i1]

				newEdges.splice(i, 1);

				for (const node of newNodes) {
					for (const edge of node.edges) {
						if (edge.edgeI > i) edge.edgeI--;
					}
				}

				this.setState({
					nodes: newNodes,
					edges: newEdges,
					mouseState: shft ? this.state.mouseState : 0,
				});
				break;
			}
		}
	};

	clickNode = (i, shft) => {
		this.setState({
			selection: {
				type: 0,
				i: i,
				e: this.state.nodes[i].edges.length,
			},
		});
		switch (this.state.mouseState) {
			case 2: {
				this.firstNode = i;
				this.setState({ mouseState: 3 });
				break;
			}
			case 3: {
				if (
					this.firstNode === i ||
					this.state.nodes[this.firstNode].edges.some((e) => e.node === i)
				)
					break;
				let newNodes = this.state.nodes.slice();
				newNodes[this.firstNode].edges.push({
					node: i,
					edgeI: this.state.edges.length,
				});
				newNodes[i].edges.push({
					node: this.firstNode,
					edgeI: this.state.edges.length,
				});
				this.setState({
					nodes: newNodes,
					edges: this.state.edges.concat([
						{ i1: this.firstNode, i2: i, w: 10, vis: 0, onPath: false },
					]),
					mouseState: shft ? this.state.mouseState - 1 : 0,
				});
				break;
			}
			case 6: {
				let newNodes = this.state.nodes.slice();
				newNodes[i].fixed = !newNodes[i].fixed;
				this.setState({
					nodes: newNodes,
					mouseState: shft ? this.state.mouseState : 0,
				});
				break;
			}
			case 7: {
				let newNodes = this.state.nodes.slice();
				let newEdges = this.state.edges.slice();

				this.setState({
					nodes: newNodes,
					edges: newEdges,
					mouseState: shft ? this.state.mouseState : 0,
				});
			}
		}
	};

	alg = () => {
		dijkstra(
			this.state.nodes.slice(),
			this.state.edges.slice(),
			this.state.startNode,
			this.state.endNode,
			this.updateAlg
		);
	};

	updateAlg = (visNodes, visEdges, mov, prevPath, curDist) => {
		let newNodes = this.state.nodes.slice();
		let newEdges = this.state.edges.slice();
		for (let i = 0; i < visNodes.length; i++) {
			newNodes[i].vis = visNodes[i];
			newNodes[i].dist = curDist[i];
		}
		for (let i = 0; i < visEdges.length; i++) {
			newEdges[i].vis = visEdges[i];
			newEdges[i].onPath = false;
		}
		let curNode = this.state.endNode;
		if (curNode !== -1)
			while (prevPath[curNode] !== -1) {
				newEdges[
					newEdges.findIndex(
						(edge) =>
							(edge.i1 === curNode && edge.i2 === prevPath[curNode]) ||
							(edge.i2 === curNode && edge.i1 === prevPath[curNode])
					)
				].onPath = true;
				curNode = prevPath[curNode];
			}
		this.setState({ nodes: newNodes, mov: mov, edges: newEdges });
	};

	keyDown = (e) => {
		if (e.key === "Escape") {
			this.setState({ mouseState: 0 });
		}
	};

	setWScale = (val) => {
		this.setState({
			wScale: val,
		});
	};

	clampToBoard = (x, y) => {
		return {
			x: Math.min(
				Math.max(x, this.nodeRadius),
				window.innerWidth -
					this.nodeRadius -
					parseInt(
						getComputedStyle(document.documentElement).getPropertyValue(
							"--UI-width"
						)
					)
			),
			y: Math.min(
				Math.max(y, this.nodeRadius),
				window.innerHeight - this.nodeRadius
			),
		};
	};

	componentDidMount() {
		this.movement(true, true);
		document.addEventListener("keydown", this.keyDown);
		if (localStorage.getItem("nodes")) {
			let newNodes = JSON.parse(localStorage.getItem("nodes"));
			for (const node of newNodes) {
				if (node.dist == null) {
					node.dist = Infinity;
				}
			}
			this.setState({
				nodes: newNodes,
				edges: JSON.parse(localStorage.getItem("edges")),
				startNode: JSON.parse(localStorage.getItem("startNode")),
				endNode: JSON.parse(localStorage.getItem("endNode")),
				moving: JSON.parse(localStorage.getItem("moving")),
			});
			if (JSON.parse(localStorage.getItem("moving")) == false)
				this.movement(false, true);
		}
		this.saveInterval = setInterval(() => {
			localStorage.setItem("nodes", JSON.stringify(this.state.nodes));
			localStorage.setItem("edges", JSON.stringify(this.state.edges));
			localStorage.setItem("startNode", this.state.startNode);
			localStorage.setItem("endNode", this.state.endNode);
			localStorage.setItem("moving", this.state.moving);
		}, 10000);
	}

	dynamic = (enable) => {
		if (enable) {
			this.setState({ moving: true });
			this.movement(true, true);
		} else {
			this.setState({ moving: false });
			this.movement(false, true);
		}
	};

	movement = (start, ignoreState) => {
		if (!ignoreState && !this.state.moving) {
			return;
		}
		if (!start) {
			clearInterval(this.interval);
		} else {
			clearInterval(this.interval);
			this.interval = setInterval(() => {
				let newNodes = this.state.nodes.slice();
				for (const edge of this.state.edges) {
					const disp =
						Math.sqrt(
							Math.pow(
								this.state.nodes[edge.i2].x - this.state.nodes[edge.i1].x,
								2
							) +
								Math.pow(
									this.state.nodes[edge.i2].y - this.state.nodes[edge.i1].y,
									2
								)
						) /
							edge.w /
							this.state.wScale -
						1;

					const fx1 =
						disp *
						(this.state.nodes[edge.i2].x - this.state.nodes[edge.i1].x) *
						this.state.edgeForce; // force in x direction applied to i1
					const fy1 =
						disp *
						(this.state.nodes[edge.i2].y - this.state.nodes[edge.i1].y) *
						this.state.edgeForce;
					if (!newNodes[edge.i1].fixed) {
						newNodes[edge.i1].vx += fx1;
						newNodes[edge.i1].vy += fy1;
					}
					if (!newNodes[edge.i2].fixed) {
						newNodes[edge.i2].vx -= fx1;
						newNodes[edge.i2].vy -= fy1;
					}
				}

				for (const node of newNodes) {
					if (node.fixed) continue;
					node.vx *= this.dampen;
					node.vy *= this.dampen;
					node.x += node.vx;
					node.y += node.vy;
					({ x: node.x, y: node.y } = this.clampToBoard(node.x, node.y));
				}

				this.setState({ nodes: newNodes });
			}, 10);
		}
	};

	componentWillUnmount() {
		this.movement(false, true);
		document.removeEventListener("keydown", this.keyDown);
		clearInterval(this.saveInterval);
	}

	createNode = () => {
		this.setState({ mouseState: 1 });
	};

	createEdge = () => {
		this.setState({ mouseState: 2 });
	};

	randomizeWeights = () => {
		let newEdges = this.state.edges.slice();
		for (const edge of newEdges) {
			edge.w = Math.floor(Math.random() * 15) + 5;
		}
		this.setState({ edges: newEdges });
	};

	edgeWeight = (i, w) => {
		let newEdges = this.state.edges.slice();
		try {
			const a = parseInt(w);
			if (isNaN(a)) return;
			newEdges[i].w = a;
			this.setState(newEdges);
			this.selectEdge(i);
		} catch (e) {
			return;
		}
	};

	boardClick = (x, y, shft) => {
		if (this.state.mouseState === 1) {
			this.setState({
				nodes: this.state.nodes.concat([
					{
						x: x,
						y: y,
						edges: [],
						vx: 0,
						vy: 0,
						fixed: false,
						vis: 0,
						dist: Infinity,
					},
				]),
				mouseState: shft ? this.state.mouseState : 0,
			});
		}
	};

	fix = () => {
		this.setState({ mouseState: 6 });
	};

	setNode = (i, type) => {
		if (type === 0) {
			let newNodes = this.state.nodes.slice();
			if (this.state.startNode != -1)
				newNodes[this.state.startNode].dist = Infinity;
			newNodes[i].dist = 0;
			this.setState({
				startNode: i,
				endNode: this.state.endNode === i ? -1 : this.state.endNode,
				nodes: newNodes,
			});
		} else {
			let newNodes = this.state.nodes.slice();
			if (this.state.startNode === i)
				newNodes[this.state.startNode].dist = Infinity;
			this.setState({
				endNode: i,
				startNode: this.state.startNode === i ? -1 : this.state.startNode,
				nodes: newNodes,
			});
		}
	};

	update = (x, y, i) => {
		let newNodes = this.state.nodes.slice();
		newNodes[i].x = x;
		newNodes[i].y = y;
		this.setState({ nodes: newNodes });
	};

	render() {
		const nodes = this.state.nodes.map(
			({ x: x, y: y, fixed: fixed, vis: vis, dist: dist }, i) => {
				return (
					<Node
						key={i}
						x={x}
						y={y}
						i={i}
						fixed={fixed}
						update={this.update}
						click={this.clickNode}
						nodeRadius={this.nodeRadius}
						movement={this.movement}
						start={this.state.startNode}
						end={this.state.endNode}
						dist={dist}
						vis={vis}
					/>
				);
			}
		);
		const edges = this.state.edges.map(
			({ i1: i1, i2: i2, w: w, vis: vis, onPath: onPath }, i) => {
				return (
					<Edge
						key={i}
						p1={{ x: this.state.nodes[i1].x, y: this.state.nodes[i1].y }}
						p2={{ x: this.state.nodes[i2].x, y: this.state.nodes[i2].y }}
						i={i}
						click={this.clickEdge}
						w={w}
						vis={vis}
						onPath={onPath}
						mov={this.state.mov}
					/>
				);
			}
		);

		return (
			<div id="board">
				<div
					id="graph-container"
					onClick={(e) => {
						this.boardClick(
							Math.min(
								Math.max(e.clientX, this.nodeRadius),
								window.innerWidth -
									this.nodeRadius -
									parseInt(
										getComputedStyle(document.documentElement).getPropertyValue(
											"--UI-width"
										)
									)
							),
							Math.min(
								Math.max(e.clientY, this.nodeRadius),
								window.innerHeight - this.nodeRadius
							),
							e.shiftKey
						);
					}}
				>
					{nodes}
					{edges}
				</div>
				<UI
					createNode={this.createNode}
					createEdge={this.createEdge}
					randomize={this.randomizeWeights}
					mouseState={this.state.mouseState}
					selection={this.state.selection}
					delete={this.delete}
					dynamic={this.dynamic}
					dynamicEnabled={this.state.moving}
					wScale={this.state.wScale}
					setWScale={this.setWScale}
					fix={this.fix}
					setNode={this.setNode}
					dijkstra={this.alg}
				/>
			</div>
		);
	}
}
