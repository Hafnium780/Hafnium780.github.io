import React from "react";
import UI from "./UI.js";
import Node from "./Node.js";
import Edge from "./Edge.js";
import Probe from "./Probe.js";
import { dijkstra } from "./algorithms/dijkstra.js";
import { twoColor } from "./algorithms/twoColor.js";
import { prim } from "./algorithms/prim.js";
import { bridge } from "./algorithms/bridge.js";
import { scc } from "./algorithms/scc.js";
import { bf } from "./algorithms/bf.js";

/* TODO




*/

/*
mouseState

0 - Nothing
1 - Placing node
2 - First edge node
3 - Second edge node
4 - 
5 - 
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
	edgeForce = 0.01;
	cameraCutoff = 50;

	cameraMoveInterval = undefined;
	cameraMoveTick = 0;
	cameraPath = { x1: 0, y1: 0, x2: 0, y2: 0 };
	curFocusNode = 0;

	algDelay = { t: 1000, stop: false };
	algInProgress = false;

	// #region lifecycle

	constructor(props) {
		super(props);

		this.graphRef = React.createRef();
		this.state = {
			graph: {
				nodes: [],
				edges: [],
				startNode: undefined,
				endNode: undefined,
				directed: false,
			},
			probe: {
				x: -100,
				y: -100,
				inspecting: 0,
				i: -1,
			},
			mouseState: 0,
			selection: { type: -1, i: 0 },
			moving: true,
			wScale: 30,
			alg: "none",
			mov: { edge: -1, dir: 0 },
			UIWidth: 300,
			draggingNode: undefined,
			textError: "",
			camera: { x: 0, y: 0 },
			snapToGrid: false,
			inputDirected: false,
		};
	}

	componentDidMount() {
		this.mouseEvents();
		this.updateUIWidth();
		document.addEventListener("keydown", this.keyDown);
		if (localStorage.getItem("saveText")) {
			try {
				let save = localStorage.getItem("saveText");
				let directed = localStorage.getItem("directed") === "true";
				let dynamic = localStorage.getItem("dynamic") === "true";
				let snap = localStorage.getItem("snap") === "true";
				let positions = JSON.parse(localStorage.getItem("positions"));
				let camera = JSON.parse(localStorage.getItem("camera"));
				this.loadGraph(save, false, directed, positions ?? undefined);
				this.setState({ moving: dynamic, snapToGrid: snap, camera: camera });
				this.movement(dynamic, true);
			} catch (e) {
				console.log(e);
				this.movement(true, true);
			}
		} else this.movement(true, true);
		this.saveInterval = setInterval(() => {
			let save = this.getGraph(false, true);
			localStorage.setItem("saveText", save.text);
			localStorage.setItem("positions", JSON.stringify(save.pos));
			localStorage.setItem("directed", this.state.graph.directed);
			localStorage.setItem("dynamic", this.state.moving);
			localStorage.setItem("snap", this.state.snapToGrid);
			localStorage.setItem("camera", JSON.stringify(this.state.camera));
		}, 1000);
	}

	componentDidUpdate(pProps, pState) {
		if (
			(pState.graph.edges.length != this.state.graph.edges.length ||
				pState.graph.nodes.length != this.state.graph.nodes.length) &&
			this.algInProgress
		) {
			this.resetAlg();
		}
	}

	componentWillUnmount() {
		this.movement(false, true);
		this.stopCameraMovement();
		document.removeEventListener("keydown", this.keyDown);
		clearInterval(this.saveInterval);
	}

	// #endregion

	// #region mouseStates
	keyDown = (e) => {
		if (e.key === "Escape") {
			this.setState({ mouseState: 0 });
		}
	};

	createNode = () => {
		this.setState({ mouseState: 1 });
	};

	createEdge = () => {
		this.setState({ mouseState: 2 });
	};

	fix = () => {
		this.setState({ mouseState: 6 });
	};

	delete = () => {
		this.setState({ mouseState: 7 });
	};

	// #endregion

	// #region options

	directed = (enable) => {
		this.changeAlg("none");
		const curGraph = this.state.graph;
		let newGraph = {
			nodes: [],
			edges: [],
			startNode: curGraph.nodes.indexOf(curGraph.startNode),
			endNode: curGraph.nodes.indexOf(curGraph.endNode),
			directed: enable,
		};

		if (newGraph.startNode === -1) newGraph.startNode = undefined;
		if (newGraph.endNode === -1) newGraph.endNode = undefined;

		for (const node of curGraph.nodes) {
			this.addNode(node.x, node.y, newGraph);
		}
		for (const edge of curGraph.edges) {
			this.addEdge(
				curGraph.nodes.indexOf(edge.n1),
				curGraph.nodes.indexOf(edge.n2),
				newGraph,
				edge.w
			);
		}

		this.setState({ graph: newGraph });
	};

	dynamic = (enable) => {
		if (enable) {
			this.setState({ moving: true });
			this.movement(true, true);
		} else {
			this.setState({ moving: false });
			this.movement(false, true);
		}
	};

	// #endregion

	// #region dynamic

	movement = (start, ignoreState, i = undefined) => {
		if (!ignoreState && !this.state.moving) {
			return;
		}
		if (!start) {
			clearInterval(this.interval);
		} else {
			this.setState({ draggingNode: undefined });
			if (i != undefined) {
				this.setState({ draggingNode: i });
			}
			clearInterval(this.interval);
			this.interval = setInterval(() => {
				let newGraph = deepClone(this.state.graph);
				for (const edge of newGraph.edges) {
					const disp =
						Math.sqrt(
							Math.pow(edge.n2.x - edge.n1.x, 2) +
								Math.pow(edge.n2.y - edge.n1.y, 2)
						) /
							Math.max(Math.abs(edge.w), 1) /
							this.state.wScale -
						1;

					const fx1 = disp * (edge.n2.x - edge.n1.x) * this.edgeForce; // force in x direction applied to i1
					const fy1 = disp * (edge.n2.y - edge.n1.y) * this.edgeForce;
					if (
						!edge.n1.fixed &&
						newGraph.nodes.indexOf(edge.n1) != this.state.draggingNode
					) {
						edge.n1.vx += fx1;
						edge.n1.vy += fy1;
					}
					if (
						!edge.n2.fixed &&
						newGraph.nodes.indexOf(edge.n2) != this.state.draggingNode
					) {
						edge.n2.vx -= fx1;
						edge.n2.vy -= fy1;
					}
				}
				for (const node of newGraph.nodes) {
					for (const node1 of newGraph.nodes) {
						let dist =
							Math.pow(node.x - node1.x, 2) + Math.pow(node.y - node1.y, 2);
						if (node != node1 && dist < this.nodeRadius * this.nodeRadius * 4) {
							const f = Math.min(100 / dist, 200);
							const a =
								dist > this.nodeRadius / 20
									? Math.atan2(node1.y - node.y, node1.x - node.x)
									: Math.random() * Math.PI * 2;
							node.vx -= f * Math.cos(a);
							node.vy -= f * Math.sin(a);
						}
					}
				}
				for (let j = 0; j < newGraph.nodes.length; j++) {
					const node = newGraph.nodes[j];
					if (node.fixed) continue;
					if (this.state.draggingNode === j) {
						node.vx = 0;
						node.vy = 0;
						continue;
					}
					node.vx = Math.max(-30, Math.min(30, node.vx));
					node.vy = Math.max(-30, Math.min(30, node.vy));
					node.vx *= this.dampen;
					node.vy *= this.dampen;
					node.x += node.vx;
					node.y += node.vy;
					// node.x = this.snap(node.x);
					// node.y = this.snap(node.y);
					// ({ x: node.x, y: node.y } = this.clampToBoard(node.x, node.y));
				}

				this.setState({ graph: newGraph });
			}, 1000 / 60);
		}
	};

	updatePosition = (x, y, i) => {
		let newGraph = deepClone(this.state.graph);
		newGraph.nodes[i].x = this.snap(x);
		newGraph.nodes[i].y = this.snap(y);
		this.setState({ graph: newGraph });
	};

	// clampToBoard = (x, y) => {
	// 	return {
	// 		x: Math.min(
	// 			Math.max(x, this.nodeRadius),
	// 			window.innerWidth - this.nodeRadius - this.state.UIWidth - 10
	// 		),
	// 		y: Math.min(
	// 			Math.max(y, this.nodeRadius),
	// 			window.innerHeight - this.nodeRadius
	// 		),
	// 	};
	// };

	// #endregion

	// #region graphManipulation

	setSnap = (snap) => {
		let newGraph = deepClone(this.state.graph);
		if (snap) {
			for (const node of newGraph.nodes) {
				node.x = this.snap(node.x, true);
				node.y = this.snap(node.y, true);
			}
		}
		this.setState({ graph: newGraph, snapToGrid: snap });
	};

	snap = (x, force = false) => {
		if (this.state.snapToGrid || force) return Math.round(x / 40) * 40;
		return x;
	};

	boardClick = (x, y, shft) => {
		if (this.state.mouseState === 1) {
			let newGraph = deepClone(this.state.graph);
			this.addNode(x - this.state.camera.x, y - this.state.camera.y, newGraph);
			this.setState({
				graph: newGraph,
				mouseState: shft ? this.state.mouseState : 0,
			});
		}
	};

	addEdge = (i1, i2, newGraph, w = 10) => {
		if (
			i1 === i2 ||
			newGraph.nodes[i1].edges.some(
				(e) =>
					(!newGraph.directed && e.n1 === newGraph.nodes[i2]) ||
					e.n2 === newGraph.nodes[i2]
			)
		)
			return;
		let newEdge = {
			n1: newGraph.nodes[i1],
			n2: newGraph.nodes[i2],
			w: w,
			vis: 0,
			onPath: false,
			inTree: false,
			bridge: false,
			err: false,
		};
		newGraph.edges.push(newEdge);
		newGraph.nodes[i1].edges.push(newEdge);
		if (!newGraph.directed) newGraph.nodes[i2].edges.push(newEdge);
	};

	addNode = (x, y, newGraph) => {
		newGraph.nodes.push({
			x: this.snap(x),
			y: this.snap(y),
			edges: [],
			vx: 0,
			vy: 0,
			fixed: false,
			vis: 0,
			color: -1,
			dist: Infinity,
			disc: -1,
			low: -1,
		});
	};

	deleteEdge = (i, newGraph) => {
		let i1 = newGraph.nodes.indexOf(newGraph.edges[i].n1);
		newGraph.nodes[i1].edges.splice(
			newGraph.nodes[i1].edges.indexOf(newGraph.edges[i]),
			1
		);
		let i2 = newGraph.nodes.indexOf(newGraph.edges[i].n2);
		newGraph.nodes[i2].edges.splice(
			newGraph.nodes[i2].edges.indexOf(newGraph.edges[i]),
			1
		);
		this.refreshProbe();
		newGraph.edges.splice(i, 1);
	};

	deleteNode = (i, newGraph) => {
		let j = 0;
		while (j < newGraph.edges.length) {
			const edge = newGraph.edges[j];
			if (edge.n1 === newGraph.nodes[i] || edge.n2 === newGraph.nodes[i]) {
				this.deleteEdge(j, newGraph);
			} else {
				j++;
			}
		}
		newGraph.nodes.splice(i, 1);
		let selection;
		if (this.state.selection.i > i) {
			selection = {
				type: this.state.selection.type,
				i: this.state.selection.i - 1,
			};
		} else if (this.state.selection.i === i) {
			selection = { type: -1, i: 0 };
		} else {
			selection = this.state.selection;
		}
		this.refreshProbe();
		return selection;
	};

	clearGraph = () => {
		this.setState({
			graph: {
				nodes: [],
				edges: [],
				startNode: undefined,
				endNode: undefined,
				directed: this.state.graph.directed,
			},
			mouseState: 0,
			selection: { type: -1, i: 0 },
			mov: { edge: -1, dir: 0 },
			draggingNode: undefined,
		});
	};

	clickEdge = (i, shft) => {
		// if (this.state.mouseState != 7) this.selectEdge(i);
		switch (this.state.mouseState) {
			case 7: {
				let newGraph = deepClone(this.state.graph);
				this.deleteEdge(i, newGraph);
				this.setState({
					graph: newGraph,
					mouseState: shft ? this.state.mouseState : 0,
				});
				return false;
				break;
			}
		}
		return true;
	};

	clickNode = (i, shft) => {
		// if (this.state.mouseState != 7)
		// 	this.setState({
		// 		selection: {
		// 			type: 0,
		// 			i: i,
		// 			e: this.state.graph.nodes[i].edges.length,
		// 		},
		// 	});
		switch (this.state.mouseState) {
			case 2: {
				this.firstNode = i;
				this.setState({ mouseState: 3 });
				break;
			}
			case 3: {
				let newGraph = deepClone(this.state.graph);
				this.addEdge(this.firstNode, i, newGraph);
				this.setState({
					graph: newGraph,
					mouseState: shft ? this.state.mouseState - 1 : 0,
				});
				break;
			}
			case 6: {
				let newGraph = deepClone(this.state.graph);
				newGraph.nodes[i].fixed = !newGraph.nodes[i].fixed;
				this.setState({
					graph: newGraph,
					mouseState: shft ? this.state.mouseState : 0,
				});
				break;
			}
			case 7: {
				let newGraph = deepClone(this.state.graph);

				let selection = this.deleteNode(i, newGraph);

				this.setState({
					graph: newGraph,
					mouseState: shft ? this.state.mouseState : 0,
					selection: selection,
				});
				return false;
				break;
			}
		}
		return true;
	};

	setNode = (i, type) => {
		if (type === 0) {
			let newGraph = deepClone(this.state.graph);
			if (newGraph.startNode !== undefined) newGraph.startNode.dist = Infinity;
			newGraph.nodes[i].dist = 0;
			newGraph.startNode = newGraph.nodes[i];
			newGraph.endNode =
				newGraph.endNode === newGraph.nodes[i] ? undefined : newGraph.endNode;
			this.setState({
				graph: newGraph,
			});
		} else {
			let newGraph = deepClone(this.state.graph);
			if (newGraph.startNode === newGraph.nodes[i])
				newGraph.startNode.dist = Infinity;
			newGraph.endNode = newGraph.nodes[i];
			newGraph.startNode =
				newGraph.startNode === newGraph.nodes[i]
					? undefined
					: newGraph.startNode;
			this.setState({
				graph: newGraph,
			});
		}
	};

	updateCamera = (x, y) => {
		this.setState({ camera: { x: x, y: y } });
	};

	resetCamera = () => {
		this.stopCameraMovement();
		this.moveCamera(0, 0, 100);
	};

	mouseEvents = () => {
		let movement = this.movement;
		let update = this.updatePosition;
		let clickNode = this.clickNode;
		let clickEdge = this.clickEdge;
		let updateCamera = this.updateCamera;
		let refreshProbe = this.refreshProbe;
		let stopCameraMovement = this.stopCameraMovement;
		let boardClick = this.boardClick;
		let dragging = undefined;
		let dragType = 0;
		let offset = { x: 0, y: 0 };
		let t = this;
		let i;
		this.graphRef.current.addEventListener("mousedown", startDrag);
		this.graphRef.current.addEventListener("mousemove", (e) => {
			drag(e);
			hover(e);
		});
		this.graphRef.current.addEventListener("mouseup", endDrag);
		this.graphRef.current.addEventListener("mouseleave", endDrag);

		function startDrag(e) {
			stopCameraMovement();
			if (e.button === 0) {
				if (e.target.id === "graph") {
					refreshProbe();
					dragType = 1;
					dragging = e.target;
					offset.x = t.state.camera.x - e.x;
					offset.y = t.state.camera.y - e.y;
					boardClick(e.x, e.y, e.shiftKey);
				} else if (e.target.classList.contains("nodePart")) {
					dragType = 2;
					i = parseInt(e.target.getAttributeNS(null, "id"));
					refreshProbe();
					if (!clickNode(i, e.shiftKey)) return;
					dragging = e.target;
					movement(true, false, i);
					offset.x = t.state.graph.nodes[i].x - e.x;
					offset.y = t.state.graph.nodes[i].y - e.y;
				} else if (e.target.classList.contains("edgePart")) {
					refreshProbe();
					i = parseInt(e.target.getAttributeNS(null, "id"));
					if (!clickEdge(i, e.shiftKey)) return;
				}
			} else if (e.button === 2) {
				dragType = 0;
				dragging = undefined;
				if (e.target.id === "graph") {
					refreshProbe();
				} else if (e.target.classList.contains("nodePart")) {
					i = parseInt(e.target.getAttributeNS(null, "id"));
					t.setState({
						probe: {
							x: e.x,
							y: e.y,
							inspecting: 1,
							i: parseInt(e.target.getAttributeNS(null, "id")),
						},
					});
				} else if (e.target.classList.contains("edgePart")) {
					i = parseInt(e.target.getAttributeNS(null, "id"));
					t.setState({
						probe: {
							x: e.x,
							y: e.y,
							inspecting: 2,
							i: parseInt(e.target.getAttributeNS(null, "id")),
						},
					});
				}
			}
		}
		function drag(e) {
			if (dragging === undefined) return;
			if (dragType === 1) {
				e.preventDefault();
				updateCamera(e.x + offset.x, e.y + offset.y);
			} else if (dragType === 2) {
				e.preventDefault();
				update(e.x + offset.x, e.y + offset.y, i);
			}
		}
		function endDrag(e) {
			if (dragType === 1) {
				if (dragging !== undefined)
					updateCamera(e.x + offset.x, e.y + offset.y);
			} else if (dragType === 2) {
				movement(true, false);
				if (dragging !== undefined) update(e.x + offset.x, e.y + offset.y, i);
			}
			dragType = 0;
			dragging = undefined;
		}

		function hover(e) {
			// if (e.target.classList.contains("nodePart")) {
			// 	t.setState({
			// 		probe: {
			// 			x: e.x,
			// 			y: e.y,
			// 			inspecting: 1,
			// 			i: parseInt(e.target.getAttributeNS(null, "id")),
			// 		},
			// 	});
			// } else if (e.target.classList.contains("edgePart")) {
			// 	t.setState({
			// 		probe: {
			// 			x: e.x,
			// 			y: e.y,
			// 			inspecting: 2,
			// 			i: parseInt(e.target.getAttributeNS(null, "id")),
			// 		},
			// 	});
			// } else {
			// 	refreshProbe();
			// }
		}
	};

	refreshProbe = () => {
		this.setState({
			probe: {
				x: -100,
				y: -100,
				insepcting: 0,
				i: -1,
			},
		});
	};

	// #endregion

	// #region graphModification

	selectEdge = (i) => {
		this.setState({
			selection: {
				type: 1,
				i: i,
				i1: this.state.graph.nodes.findIndex((node) => {
					return this.state.graph.edges[i].n1 === node;
				}),
				i2: this.state.graph.nodes.findIndex((node) => {
					return this.state.graph.edges[i].n2 === node;
				}),
				w: this.state.graph.edges[i].w,
			},
		});
	};

	edgeWeight = (i, w) => {
		let newGraph = deepClone(this.state.graph);
		try {
			const a = parseInt(w);
			if (isNaN(a)) return;
			newGraph.edges[i].w = a;
			this.setState({ graph: newGraph });
		} catch (e) {
			return;
		}
	};

	randomizeWeights = () => {
		let newGraph = deepClone(this.state.graph);
		for (const edge of newGraph.edges) {
			edge.w = Math.floor(Math.random() * 15) + 5;
		}
		this.setState({ graph: newGraph });
	};

	randomizeEdges = () => {
		let newGraph = deepClone(this.state.graph);
		while (newGraph.edges.length) {
			this.deleteEdge(0, newGraph);
		}

		for (let i = 0; i < newGraph.nodes.length; i++) {
			let j = Math.floor(Math.random() * (newGraph.nodes.length - 2));
			if (j >= i) j++;
			this.addEdge(i, j, newGraph);
		}

		for (let i = 0; i < newGraph.nodes.length / 3; i++) {
			this.addEdge(
				Math.floor(Math.random() * (newGraph.nodes.length - 1)),
				Math.floor(Math.random() * (newGraph.nodes.length - 1)),
				newGraph
			);
		}
		this.setState({ graph: newGraph });
	};

	distToWeight = () => {
		let newGraph = deepClone(this.state.graph);
		for (const edge of newGraph.edges) {
			edge.w =
				Math.round(
					(Math.sqrt(
						Math.pow(edge.n1.x - edge.n2.x, 2) +
							Math.pow(edge.n1.y - edge.n2.y, 2)
					) /
						this.state.wScale) *
						100
				) / 100;
		}
		this.setState({ graph: newGraph });
	};

	setWScale = (val) => {
		this.setState({
			wScale: val,
		});
	};

	// #endregion

	// #region UI

	changeTab = (tab) => {
		this.setState({ mouseState: 0 });
	};

	resizeUI = (e) => {
		e.preventDefault();
		this.setState(
			{
				UIWidth: Math.max(
					300,
					Math.min(window.innerWidth - 10, window.innerWidth - e.x)
				),
			},
			this.updateUIWidth
		);
	};

	updateUIWidth = () => {
		document.documentElement.style.setProperty(
			"--UI-width",
			this.state.UIWidth + "px"
		);
	};

	// #endregion

	// #region algorithms

	changeAlg = (alg) => {
		this.resetAlg();
		this.setState({ alg: alg });
	};

	resetAlg = (c = () => {}) => {
		this.stopAlg();
		let newGraph = deepClone(this.state.graph);
		for (const node of newGraph.nodes) {
			if (node === newGraph.startNode) node.dist = 0;
			else node.dist = Infinity;
			node.color = -1;
			node.vis = false;
			node.disc = -1;
			node.low = -1;
			node.onStack = false;
		}
		for (const edge of newGraph.edges) {
			edge.vis = false;
			edge.onPath = false;
			edge.inTree = false;
			edge.bridge = false;
			edge.err = false;
		}
		this.setState({ graph: newGraph, mov: { edge: -1, dir: 0 } }, c);
	};

	alg = () => {
		this.resetAlg(() => {
			this.algInProgress = true;
			if (this.state.alg === "dijkstra") {
				dijkstra(
					deepClone(this.state.graph),
					this.updateAlg,
					this.algDelay,
					this.stopAlg
				);
			} else if (this.state.alg === "twoColor") {
				twoColor(
					deepClone(this.state.graph),
					this.updateAlg,
					this.algDelay,
					this.stopAlg
				);
			} else if (this.state.alg === "prim") {
				prim(
					deepClone(this.state.graph),
					this.updateAlg,
					this.algDelay,
					this.stopAlg
				);
			} else if (this.state.alg === "bridge") {
				bridge(
					deepClone(this.state.graph),
					this.updateAlg,
					this.algDelay,
					this.stopAlg
				);
			} else if (this.state.alg === "scc") {
				scc(
					deepClone(this.state.graph),
					this.updateAlg,
					this.algDelay,
					this.stopAlg
				);
			} else if (this.state.alg === "bf") {
				bf(
					deepClone(this.state.graph),
					this.updateAlg,
					this.algDelay,
					this.stopAlg
				);
			}
		});
	};

	nodeToEdge = (graph, i1, i2) => {
		let ei = graph.edges.findIndex((e) => {
			return (
				(graph.nodes.indexOf(e.n1) === i1 &&
					graph.nodes.indexOf(e.n2) === i2) ||
				(!graph.directed &&
					graph.nodes.indexOf(e.n1) === i2 &&
					graph.nodes.indexOf(e.n2) === i1)
			);
		});
		if (ei === -1) return { edge: -1, dir: 0 };
		let dir;
		if (graph.nodes.indexOf(graph.edges[ei].n1) === i1) dir = 1;
		else dir = 2;
		return { edge: ei, dir: dir };
	};

	updateAlg = (alg, data) => {
		if (alg === "dijkstra") {
			let [visNodes, visEdges, mov, prevPath, curDist] = data;
			let newGraph = deepClone(this.state.graph);
			for (let i = 0; i < newGraph.nodes.length; i++) {
				newGraph.nodes[i].vis = visNodes[i];
				newGraph.nodes[i].dist = curDist[i];
			}
			for (let i = 0; i < newGraph.edges.length; i++) {
				newGraph.edges[i].vis = visEdges[i];
				newGraph.edges[i].onPath = false;
			}
			let curNode = this.state.graph.nodes.indexOf(this.state.graph.endNode);
			if (curNode !== undefined)
				while (prevPath[curNode] !== undefined) {
					newGraph.edges[
						newGraph.edges.findIndex(
							(edge) =>
								(!newGraph.directed &&
									edge.n1 === newGraph.nodes[curNode] &&
									edge.n2 === newGraph.nodes[prevPath[curNode]]) ||
								(edge.n2 === newGraph.nodes[curNode] &&
									edge.n1 === newGraph.nodes[prevPath[curNode]])
						)
					].onPath = true;
					curNode = prevPath[curNode];
				}
			this.setState({ graph: newGraph, mov: mov });
		} else if (alg === "twoColor") {
			let [color, visEdges, err, mov] = data;
			let newGraph = deepClone(this.state.graph);
			for (let i = 0; i < newGraph.nodes.length; i++) {
				newGraph.nodes[i].color = color[i];
			}
			for (let i = 0; i < newGraph.edges.length; i++) {
				newGraph.edges[i].vis = visEdges[i];
				newGraph.edges[i].err = err[i];
			}
			this.setState({ graph: newGraph, mov: mov });
		} else if (alg === "prim") {
			let [visNodes, edgeInTree, visEdges, mov] = data;
			let newGraph = deepClone(this.state.graph);
			for (let i = 0; i < newGraph.nodes.length; i++) {
				newGraph.nodes[i].vis = visNodes[i];
			}
			for (let i = 0; i < newGraph.edges.length; i++) {
				newGraph.edges[i].inTree = edgeInTree[i];
				newGraph.edges[i].vis = visEdges[i];
			}
			this.setState({ graph: newGraph, mov: mov });
		} else if (alg === "bridge") {
			let [disc, low, visEdges, bridges, mov] = data;
			let newGraph = deepClone(this.state.graph);
			for (let i = 0; i < newGraph.nodes.length; i++) {
				newGraph.nodes[i].vis = disc[i] !== -1;
				newGraph.nodes[i].disc = disc[i];
				newGraph.nodes[i].low = low[i];
			}
			for (let i = 0; i < newGraph.edges.length; i++) {
				newGraph.edges[i].bridge = bridges[i];
				newGraph.edges[i].vis = visEdges[i];
			}
			this.setState({
				graph: newGraph,
				mov: mov,
			});
		} else if (alg === "scc") {
			let [disc, low, onStack, visEdges, mov] = data;
			let newGraph = deepClone(this.state.graph);
			for (let i = 0; i < newGraph.nodes.length; i++) {
				newGraph.nodes[i].vis = disc[i] !== -1;
				newGraph.nodes[i].disc = disc[i];
				newGraph.nodes[i].low = low[i];
				newGraph.nodes[i].onStack = onStack[i];
			}
			for (let i = 0; i < newGraph.edges.length; i++) {
				newGraph.edges[i].vis = visEdges[i];
				newGraph.edges[i].inTree =
					low[newGraph.nodes.indexOf(newGraph.edges[i].n1)] !== -1 &&
					low[newGraph.nodes.indexOf(newGraph.edges[i].n1)] ===
						low[newGraph.nodes.indexOf(newGraph.edges[i].n2)];
			}
			this.setState({ graph: newGraph, mov: mov });
		} else if (alg === "bf") {
			let [prevPath, visEdges, curDist, inCycle, mov] = data;
			let newGraph = deepClone(this.state.graph);
			for (let i = 0; i < newGraph.nodes.length; i++) {
				newGraph.nodes[i].dist = curDist[i];
			}
			for (let i = 0; i < newGraph.edges.length; i++) {
				newGraph.edges[i].vis = visEdges[i];
				newGraph.edges[i].onPath = false;
				newGraph.edges[i].inTree = inCycle[i];
			}
			let curNode = this.state.graph.nodes.indexOf(this.state.graph.endNode);
			let nodes = newGraph.nodes.length + 1;
			let onPath = Array(newGraph.edges.length).fill(false);
			if (curNode !== undefined) {
				while (prevPath[curNode] !== undefined && nodes) {
					nodes--;
					let ei = newGraph.edges.findIndex(
						(edge) =>
							(!newGraph.directed &&
								edge.n1 === newGraph.nodes[curNode] &&
								edge.n2 === newGraph.nodes[prevPath[curNode]]) ||
							(edge.n2 === newGraph.nodes[curNode] &&
								edge.n1 === newGraph.nodes[prevPath[curNode]])
					);
					onPath[ei] = true;
					curNode = prevPath[curNode];
				}
				if (nodes)
					for (let i = 0; i < newGraph.edges.length; i++) {
						newGraph.edges[i].onPath = onPath[i];
					}
				else {
					for (let i = 0; i < newGraph.nodes.length; i++) {
						if (curDist[i] === Number.NEGATIVE_INFINITY)
							newGraph.nodes[i].vis = true;
					}
				}
			}
			this.setState({
				graph: newGraph,
				mov: mov,
			});
		}
	};

	setAlgDelay = (val) => {
		this.algDelay.t = val;
		this.forceUpdate();
	};

	stopAlg = () => {
		this.algInProgress = false;
		this.algDelay.stop = true;
		this.algDelay = { t: this.algDelay.t, stop: false };
		this.forceUpdate();
	};

	// #endregion

	// #region graphText

	loadGraph = (s, msg = true, directed = false, pos = undefined) => {
		let err = undefined;
		this.resetAlg();
		const inp = s.trim().split(/\s+/);
		for (const i in inp) {
			inp[i] = parseInt(inp[i]);
			if (isNaN(inp[i])) {
				err = 0;
				break;
			}
		}
		if (err === undefined) {
			let n = inp[0];
			let e = inp[1];
			let newGraph = {
				nodes: [],
				edges: [],
				startNode: undefined,
				endNode: undefined,
				directed: directed,
			};
			let ind = 2;
			let minX = this.nodeRadius,
				maxX = window.innerWidth - this.state.UIWidth - this.nodeRadius - 10;
			let minY = this.nodeRadius,
				maxY = window.innerHeight - this.nodeRadius;
			for (let i = 0; i < n; i++) {
				if (pos === undefined)
					this.addNode(
						Math.floor(Math.random() * (maxX - minX + 1) + minX),
						Math.floor(Math.random() * (maxY - minY + 1) + minY),
						newGraph
					);
				else this.addNode(pos[i].x, pos[i].y, newGraph);
			}
			for (let i = 0; i < e; i++) {
				let i1 = inp[ind],
					i2 = inp[ind + 1],
					w = inp[ind + 2];
				ind += 3;
				if (i1 === undefined || i2 === undefined || w === undefined) {
					err = 1;
					break;
				}
				if (
					i1 >= newGraph.nodes.length ||
					i2 >= newGraph.nodes.length ||
					i1 < 0 ||
					i2 < 0
				) {
					err = 2;
					break;
				}
				this.addEdge(i1, i2, newGraph, w);
			}
			if (err === undefined) {
				if (inp[ind] !== undefined) {
					newGraph.startNode = newGraph.nodes[inp[ind]];
					if (newGraph.startNode === undefined) {
						err = 3;
					} else {
						newGraph.endNode = newGraph.nodes[inp[ind + 1]];
						if (inp[ind + 1] !== undefined && newGraph.endNode === undefined)
							err = 3;
					}
				}
				if (err === undefined) {
					this.setState({
						graph: newGraph,
						mouseState: 0,
						selection: { type: -1, i: 0 },
						mov: { edge: -1, dir: 0 },
						draggingNode: undefined,
					});
					if (msg) this.setState({ textError: "Successfully imported text" });
					return true;
				}
			}
		}
		switch (err) {
			case 0: {
				if (msg)
					this.setState({
						textError:
							"Error: Invalid character in input. There should only be numbers and whitespaces.",
					});
				break;
			}
			case 1: {
				if (msg)
					this.setState({
						textError:
							"Error: Invalid input format: Check if there is the right number of edges.",
					});
				break;
			}
			case 2: {
				if (msg)
					this.setState({
						textError: "Error: Invalid edge node: Edge node was out of bounds.",
					});
				break;
			}
			case 3: {
				if (msg)
					this.setState({
						textError:
							"Error: Invalid start/end node: Start/end node was out of bounds.",
					});
				break;
			}
		}
		return false;
	};

	getGraph = (msg = true, pos = false) => {
		const graph = this.state.graph;
		let g = "";
		g += graph.nodes.length + " ";
		g += graph.edges.length + "\n";
		for (const edge of graph.edges) {
			g += graph.nodes.indexOf(edge.n1) + " ";
			g += graph.nodes.indexOf(edge.n2) + " ";
			g += edge.w + "\n";
		}
		if (graph.startNode !== undefined) {
			g += graph.nodes.indexOf(graph.startNode);
			if (graph.endNode !== undefined) {
				g += " " + graph.nodes.indexOf(graph.endNode) + "\n";
			} else {
				g += "\n";
			}
		}
		if (msg) this.setState({ textError: "Successfully exported graph" });
		if (!pos) return g;
		else {
			let positions = [];
			for (let i = 0; i < graph.nodes.length; i++) {
				let node = graph.nodes[i];
				positions.push({ x: node.x, y: node.y });
			}
			return { text: g, pos: positions };
		}
	};

	setInputDirected = (dir) => {
		this.setState({ inputDirected: dir });
	};

	// #endregion

	edgeOnBoard(x1, y1, x2, y2) {
		if (x1 > x2) {
			let t = x1;
			x1 = x2;
			x2 = t;
		}
		if (y1 > y2) {
			let t = y1;
			y1 = y2;
			y2 = t;
		}

		if (
			x2 < -this.cameraCutoff ||
			x1 > window.innerWidth - this.state.UIWidth - 10 + this.cameraCutoff ||
			y2 < -this.cameraCutoff ||
			y1 > window.innerHeight + this.cameraCutoff
		) {
			// console.log("y");
			return false;
		}
		// console.log("n");
		return true;
	}

	nodeOnBoard(x, y) {
		if (
			x < -this.cameraCutoff ||
			x > window.innerWidth - this.state.UIWidth - 10 + this.cameraCutoff ||
			y < -this.cameraCutoff ||
			y > window.innerHeight + this.cameraCutoff
		) {
			return false;
		}
		return true;
	}

	// #region camera

	stopCameraMovement = () => {
		if (this.cameraMoveInterval !== undefined)
			clearInterval(this.cameraMoveInterval);
		this.cameraMoveInterval = undefined;
	};

	moveCamera = (x2, y2, t) => {
		this.cameraMoveTick = 0;
		this.cameraPath = {
			x1: this.state.camera.x,
			y1: this.state.camera.y,
			x2: x2,
			y2: y2,
		};
		this.cameraMoveInterval = setInterval(() => {
			if (this.cameraMoveTick >= 30) {
				this.setState({
					camera: {
						x: this.cameraPath.x2,
						y: this.cameraPath.y2,
					},
				});
				this.stopCameraMovement();
			}
			this.setState({
				camera: {
					x:
						((this.cameraPath.x2 - this.cameraPath.x1) * this.cameraMoveTick) /
							30 +
						this.cameraPath.x1,
					y:
						((this.cameraPath.y2 - this.cameraPath.y1) * this.cameraMoveTick) /
							30 +
						this.cameraPath.y1,
				},
			});
			this.cameraMoveTick++;
		}, t / 30);
	};

	cycleNodes = () => {
		if (this.state.graph.nodes.length === 0) return;
		this.stopCameraMovement();
		this.curFocusNode += 1;
		if (this.curFocusNode >= this.state.graph.nodes.length)
			this.curFocusNode = 0;

		this.moveCamera(
			Math.round(
				(window.innerWidth - this.state.UIWidth - 10) / 2 -
					this.state.graph.nodes[this.curFocusNode].x
			),
			Math.round(
				window.innerHeight / 2 - this.state.graph.nodes[this.curFocusNode].y
			),
			100
		);
	};

	// #endregion

	render() {
		const nodes = this.state.graph.nodes.map(
			(
				{
					x: x,
					y: y,
					fixed: fixed,
					vis: vis,
					dist: dist,
					color: color,
					disc: disc,
					low: low,
					onStack: onStack,
				},
				i
			) => {
				let xPos = x + this.state.camera.x;
				let yPos = y + this.state.camera.y;
				if (this.nodeOnBoard(xPos, yPos))
					return (
						<Node
							key={i}
							x={xPos}
							y={yPos}
							i={i}
							fixed={fixed}
							update={this.updatePosition}
							nodeRadius={this.nodeRadius}
							movement={this.movement}
							start={this.state.graph.nodes.indexOf(this.state.graph.startNode)}
							end={this.state.graph.nodes.indexOf(this.state.graph.endNode)}
							dist={dist}
							vis={vis}
							alg={this.state.alg}
							color={color}
							disc={disc}
							low={low}
							onStack={onStack}
							graphRef={this.graphRef}
							selected={
								this.state.probe.inspecting === 1 && this.state.probe.i === i
							}
						/>
					);
			}
		);
		const edges = this.state.graph.edges.map(
			(
				{
					n1: n1,
					n2: n2,
					w: w,
					vis: vis,
					onPath: onPath,
					inTree: inTree,
					bridge: bridge,
					err: err,
				},
				i
			) => {
				let x1 = n1.x + this.state.camera.x;
				let y1 = n1.y + this.state.camera.y;
				let x2 = n2.x + this.state.camera.x;
				let y2 = n2.y + this.state.camera.y;
				if (this.edgeOnBoard(x1, y1, x2, y2))
					return (
						<Edge
							key={i}
							p1={{
								x: x1,
								y: y1,
							}}
							p2={{
								x: x2,
								y: y2,
							}}
							i={i}
							w={w}
							vis={vis}
							onPath={onPath}
							inTree={inTree}
							mov={this.state.mov}
							directed={this.state.graph.directed}
							bridge={bridge}
							err={err}
							algDelay={this.algDelay.t}
							selected={
								this.state.probe.inspecting === 2 && this.state.probe.i === i
							}
						/>
					);
			}
		);

		let UIVariables = {
			UIWidth: this.state.UIWidth,
			mouseState: this.state.mouseState,
			dynamicEnabled: this.state.moving,
			directedEnabled: this.state.graph.directed,
			wScale: this.state.wScale,
			curAlg: this.state.alg,
			textError: this.state.textError,
			algDelay: this.algDelay.t,
			snapEnabled: this.state.snapToGrid,
			inputDirected: this.state.inputDirected,
		};

		let UIFunctions = {
			createNode: this.createNode,
			createEdge: this.createEdge,
			randomize: this.randomizeWeights,
			randomizeEdges: this.randomizeEdges,
			distToWeight: this.distToWeight,
			delete: this.delete,
			dynamic: this.dynamic,
			directed: this.directed,
			setWScale: this.setWScale,
			fix: this.fix,
			changeAlg: this.changeAlg,
			startAlg: this.alg,
			reset: this.resetAlg,
			loadGraph: this.loadGraph,
			getGraph: this.getGraph,
			resetGraph: this.clearGraph,
			setAlgDelay: this.setAlgDelay,
			snap: this.setSnap,
			changeTab: this.changeTab,
			setInputDirected: this.setInputDirected,
		};

		return (
			<div id="board">
				<div
					id="grid"
					style={{
						backgroundPositionX: this.state.camera.x % 40,
						backgroundPositionY: this.state.camera.y % 40,
					}}
				></div>
				<Probe
					x={this.state.probe.x}
					y={this.state.probe.y}
					inspecting={this.state.probe.inspecting}
					i={this.state.probe.i}
					graph={this.state.graph}
					changeW={this.edgeWeight}
					setNode={this.setNode}
				></Probe>
				<div id="homeButton" onClick={this.resetCamera}></div>
				<div id="positionText">
					{-Math.round(this.state.camera.x) +
						", " +
						Math.round(this.state.camera.y)}
				</div>
				<div id="algText">
					{"Currently Running: " +
						(this.state.alg === "none" || !this.algInProgress
							? "None"
							: this.state.alg === "dijkstra"
							? "Dijkstra's"
							: this.state.alg === "twoColor"
							? "Two Color"
							: this.state.alg === "prim"
							? "Prim's MST"
							: this.state.alg === "bridge"
							? "Tarjan's Bridges"
							: this.state.alg === "scc"
							? "Tarjan's SCCs"
							: this.state.alg === "bf"
							? "Bellman Ford's"
							: "")}
				</div>
				<div id="cycleButton" onClick={this.cycleNodes}></div>
				<div id="graph-container">
					<svg
						id="graph"
						width={window.innerWidth - this.state.UIWidth - 10}
						height={window.innerHeight}
						ref={this.graphRef}
					>
						{edges}
						{nodes}
					</svg>
				</div>
				<div
					id="slider"
					onMouseDown={() => {
						document.addEventListener("mousemove", this.resizeUI, false);
						document.addEventListener(
							"mouseup",
							() => {
								document.removeEventListener("mousemove", this.resizeUI, false);
							},
							false
						);
					}}
				></div>
				<UI variables={UIVariables} functions={UIFunctions} />
			</div>
		);
	}
}

// https://stackoverflow.com/questions/40291987/javascript-deep-clone-object-with-circular-references
function deepClone(obj, hash = new WeakMap()) {
	// Do not try to clone primitives or functions
	if (Object(obj) !== obj || obj instanceof Function) return obj;
	if (hash.has(obj)) return hash.get(obj); // Cyclic reference
	try {
		// Try to run constructor (without arguments, as we don't know them)
		var result = new obj.constructor();
	} catch (e) {
		// Constructor failed, create object without running the constructor
		result = Object.create(Object.getPrototypeOf(obj));
	}
	// Optional: support for some standard constructors (extend as desired)
	if (obj instanceof Map)
		Array.from(obj, ([key, val]) =>
			result.set(deepClone(key, hash), deepClone(val, hash))
		);
	else if (obj instanceof Set)
		Array.from(obj, (key) => result.add(deepClone(key, hash)));
	// Register in hash
	hash.set(obj, result);
	// Clone and assign enumerable own properties recursively
	return Object.assign(
		result,
		...Object.keys(obj).map((key) => ({ [key]: deepClone(obj[key], hash) }))
	);
}
