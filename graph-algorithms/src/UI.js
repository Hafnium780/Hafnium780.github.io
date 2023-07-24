import React from "react";

export default class UI extends React.Component {
	dijkstraDesc = (
		<>
			<p className="algorithmDescription">
				Finds the shortest path from one node to any other, negative weights not
				supported.
			</p>
			<h2>Algorithm</h2>
			<ol className="algorithmSteps">
				<li>
					Give each node an infinite distance. The starting node is given a
					distance of 0.
				</li>
				<li>Choose the smallest distance node that is unvisited.</li>
				<li>
					Visit every edge connected to the node. If the distance to the next
					node through that edge is less than its current distance, update it.
				</li>
				<li>
					Mark the selected node as visited and repeat from step 2 until all
					nodes are visited.
				</li>
				<br />
				Note: When the goal node is visited, the shortest path to it has been
				found and the algorithm can be terminated.
			</ol>
		</>
	);
	twoColorDesc = (
		<>
			<p className="algorithmDescription">
				Tries to color each node with one of two colors, such that no node is
				connected to a node of the same color.
			</p>
			<h2>Algorithm</h2>
			<ol className="algorithmSteps">
				<li>Color the initial node one color and call it the current node.</li>
				<li>
					For each unvisited node connected to the current node, set it to the
					opposite color.
				</li>
				<li>
					Add each connected unvisited node to a queue and mark them as visited.
				</li>
				<li>
					Set the current node to the front of the queue, then remove it from
					the queue.
				</li>
				<li>Repeat from step 2 until all nodes are visited.</li>
				<br />
				Note: If a graph can be two-colored, it is bipartite (able to be split
				into two sets of nodes such that every node in one set only connects to
				nodes in the other, and vice versa).
			</ol>
		</>
	);
	primDesc = (
		<>
			<p className="algorithmDescription">
				Creates a minimum spanning tree (a set of edges which connect every node
				with the least cost) by picking the lowest reachable edge. Prim's
				algorithm does not work with directed graphs.
			</p>
			<h2>Algorithm</h2>
			<ol className="algorithmSteps">
				<li>Mark the initial node as visited.</li>
				<li>
					Find the edge with the smallest weight connected to a visited node.
				</li>
				<li>
					If the edge also connects an unvisited node, add it to the tree and
					mark the connected node as visited. Otherwise, skip it.
				</li>
				<li>Repeat from step 2 until all nodes are visited.</li>
				<br />
				Note: Although this minimizes the total weight of the edges, it does not
				minimize the weight of edges between nodes and cannot be used to find
				the shortest path.
			</ol>
		</>
	);
	bridgeDesc = (
		<>
			<p className="algorithmDescription">
				Finds bridges in a graph, or edges that are the only way to get from
				nodes on one side of the edge to the other. For directed graphs, see
				Tarjan's algorithm for SCC's.
			</p>
			<h2>Algorithm</h2>
			<ol className="algorithmSteps">
				<li>Call the initial node the current node. Set the time to 0.</li>
				<li>
					Set the time of discovery and earliest reachable time of the current
					node to the time counter, then increment the time.
				</li>
				<li>
					For every node connected to the current node that is not where we came
					from:
				</li>
				<ul>
					<li>
						If the node has been discovered already, set the current node's
						earliest reachable node to itself or the new node's discovery time,
						whichever is earlier.
					</li>
					<li>
						If the node has not been discovered, recursively run step 2 on it.
						Set the current node's earliest reachable node to itself or the new
						node's earliest reachable node, whichever is earlier.
					</li>
				</ul>
				<li>
					After finishing all recursive calls, it is possible some nodes are not
					visited. If so, pick any one and repeat from step 2 on it.
				</li>
				<br />
				Note: A bridge can also be defined as an edge that is not a part of any
				cycle.
			</ol>
		</>
	);
	sccDesc = (
		<>
			<p className="algorithmDescription">
				Finds strongly connect components in a <b>directed</b> graph, or groups
				of nodes where every node is reachable from any other.
			</p>
			<h2>Algorithm</h2>
			<ol className="algorithmSteps">
				<li>Call the initial node the current node. Set the time to 0.</li>
				<li>
					Set the time of discovery and earliest reachable time of the current
					node to the time counter, then increment the time. Push the current
					node onto the stack.
				</li>
				<li>For every node reachable from the current node:</li>
				<ul>
					<li>If it is undiscovered, recursively run step 2 on it.</li>
					<li>
						If it is on the stack, update the current node's earliest reachable
						to the new node's or itself, whichever is smaller.
					</li>
				</ul>
				<li>
					If the earliest reachable value is still the discovery time of the
					node, this node is the start of a SCC, and the current node and all
					nodes above it on the stack are popped out of the stack.
				</li>
				<li>
					After finishing all recursive calls, it is likely some nodes are not
					visited. If so, pick any one and repeat from step 2 on it.
				</li>
				<br />
				Node: Although any undirected graph is just a directed graph with each
				edge duplicated, every component would be a strongly connected
				component, making this algorithm needlessly complicated on undirected
				graphs.
			</ol>
		</>
	);
	bfDesc = (
		<>
			<p className="algorithmDescription">
				Finds the shortest path from one node to any others. Negative weights
				are supported, and if a negative cycle occurs the cycle and nodes which
				are affected are shown.
			</p>
			<h2>Algorithm</h2>
			<ol className="algorithmSteps">
				<li>
					Set the initial node's distance to 0, and all others to Infinity.
				</li>
				<li>
					For every edge, <b>relax</b> it by checking if the distance of the
					node it starts at plus the weight of the edge is less than the current
					distance of the node it ends at. If so, update the distance of the end
					node.
				</li>
				<li>Repeat step 2 a total of (number of nodes) - 1 times.</li>
				<li>
					If no negative cycle exists, the shortest path to every node must have
					been found, since no path can go through the same node twice unless it
					includes a negative cycle.
				</li>
				<li>
					By repeating step 2 another (number of nodes) - 1 times, but setting
					the distance to -Infinity if an edge can be relaxed, all nodes
					affected will be found.
				</li>
				<br />
				Node: To extract the cycles themselves, store the latest edge used to
				update each node. Traveling backwards from every node, you will
				eventually end up in a cycle or a dead end.
			</ol>
		</>
	);

	constructor(props) {
		super(props);
	}

	tab = (e, tabName) => {
		this.props.functions.changeTab(tabName);
		Array.from(document.getElementsByClassName("tabs")).forEach(
			(tab) => (tab.style.display = "none")
		);

		Array.from(document.getElementsByClassName("tab-button")).forEach(
			(button) => {
				button.className = button.className.replace(" active", "");
			}
		);

		document.getElementById(tabName).style.display = "flex";
		e.currentTarget.className += " active";
	};

	componentDidMount() {
		document.getElementById("builder-button").click();
	}

	render() {
		let mouseState;
		switch (this.props.variables.mouseState) {
			case 0: {
				mouseState = "No current action";
				break;
			}
			case 1: {
				mouseState = "Click to place node";
				break;
			}
			case 2: {
				mouseState = "Create edge: Select first node";
				break;
			}
			case 3: {
				mouseState = "Create edge: Select second node";
				break;
			}
			case 4: {
				mouseState = "Click on a node to assign start";
				break;
			}
			case 5: {
				mouseState = "Click on a node to assign goal";
				break;
			}
			case 6: {
				mouseState = "Click to fix a node";
				break;
			}
			case 7: {
				mouseState = "Click to delete an object";
				break;
			}
		}
		// let selection;
		// switch (this.props.variables.selection.type) {
		// 	case 0: {
		// 		// Node
		// 		selection = (
		// 			<div id="selection">
		// 				<h2>Selected</h2>
		// 				<p>Node Selected: {this.props.variables.selection.i}</p>
		// 				<p className="small">
		// 					Connected to {this.props.variables.selection.e} other node(s)
		// 				</p>
		// 				<button
		// 					className="selectButton node-left"
		// 					onClick={() => {
		// 						this.props.functions.setNode(
		// 							this.props.variables.selection.i,
		// 							0
		// 						);
		// 					}}
		// 				>
		// 					Set start node
		// 				</button>
		// 				<button
		// 					className="selectButton node-right"
		// 					onClick={() => {
		// 						this.props.functions.setNode(
		// 							this.props.variables.selection.i,
		// 							1
		// 						);
		// 					}}
		// 				>
		// 					Set goal node
		// 				</button>
		// 			</div>
		// 		);
		// 		break;
		// 	}
		// 	case 1: {
		// 		// Edge
		// 		selection = (
		// 			<div id="selection">
		// 				<h2>Selected</h2>
		// 				<p>Edge Selected: {this.props.variables.selection.i}</p>
		// 				<p className="small">
		// 					Connects nodes {this.props.variables.selection.i1} and{" "}
		// 					{this.props.variables.selection.i2}
		// 				</p>
		// 				<p className="small">Weight: {this.props.variables.selection.w}</p>
		// 				<input
		// 					id="weightInp"
		// 					type="text"
		// 					defaultValue={this.props.variables.selection.w}
		// 				></input>
		// 				<button
		// 					className="selectButton edge-middle"
		// 					onClick={() => {
		// 						this.props.variables.selection.changeW(
		// 							this.props.variables.selection.i,
		// 							document.getElementById("weightInp").value
		// 						);
		// 					}}
		// 				>
		// 					Change Weight
		// 				</button>
		// 			</div>
		// 		);
		// 		break;
		// 	}
		// 	default: {
		// 		selection = (
		// 			<div id="selection">
		// 				<h2>Selected</h2>
		// 				<p>None</p>
		// 			</div>
		// 		);
		// 	}
		// }
		return (
			<div id="ui-box" style={{ flexBasis: this.props.variables.UIWidth }}>
				<div className="tab">
					<button
						className="tab-button"
						id="builder-button"
						onClick={(e) => this.tab(e, "builder")}
					>
						Builder
					</button>
					<button
						className="tab-button"
						onClick={(e) => this.tab(e, "algorithms")}
					>
						Algorithms
					</button>
					<button
						className="tab-button"
						id="builder-button"
						onClick={(e) => this.tab(e, "text")}
					>
						Text
					</button>
					<button className="tab-button" onClick={(e) => this.tab(e, "help")}>
						Help
					</button>
				</div>
				<div id="builder" className="tabs">
					<h1 className="ui-title">Builder</h1>
					<h3>Create</h3>
					<div className="createButtons">
						<button
							onClick={this.props.functions.createNode}
							className="createButton createNode"
						></button>
						<button
							onClick={this.props.functions.createEdge}
							className="createButton createEdge"
						></button>
						<button
							onClick={this.props.functions.fix}
							className="createButton createFix"
						></button>
						<button
							onClick={this.props.functions.delete}
							className="createButton createTrash"
						></button>
					</div>
					<p id="mouseState">{mouseState}</p>
					{this.props.variables.mouseState ? (
						<p className="small">
							Press escape to cancel <br /> Hold shift to repeat
						</p>
					) : (
						<></>
					)}
					<h3>Modify</h3>
					<div>
						<button
							onClick={this.props.functions.randomize}
							className="halfWidth"
						>
							Random Weights
						</button>
						<button
							onClick={this.props.functions.randomizeEdges}
							className="halfWidth"
						>
							Random Edges
						</button>
					</div>
					<button onClick={this.props.functions.distToWeight}>
						Assign Weights Based on Distance
					</button>
					<h3>Options</h3>
					<div>
						<button
							className="halfWidth"
							onClick={(e) => {
								this.props.functions.dynamic(
									!this.props.variables.dynamicEnabled
								);
								this.props.functions.snap(false);
							}}
						>
							<span className="small">Dynamic Graph </span>
							<br />
							<span style={{ fontSize: 9 }}>May cause performance issues</span>
							<br />
							<span
								style={{
									color: this.props.variables.dynamicEnabled
										? "darkgreen"
										: "red",
								}}
							>
								{this.props.variables.dynamicEnabled ? "Enabled" : "Disabled"}
							</span>
						</button>
						<button
							className="halfWidth"
							onClick={(e) => {
								this.props.functions.directed(
									!this.props.variables.directedEnabled
								);
							}}
						>
							<span className="small">Directed Graph </span>
							<br />
							<span style={{ fontSize: 9 }}>Will remove duplicate edges</span>
							<br />
							<span
								style={{
									color: this.props.variables.directedEnabled
										? "darkgreen"
										: "red",
								}}
							>
								{this.props.variables.directedEnabled ? "Enabled" : "Disabled"}
							</span>
						</button>
					</div>
					<button
						className="snapButton"
						onClick={(e) => {
							this.props.functions.snap(!this.props.variables.snapEnabled);
							this.props.functions.dynamic(false);
						}}
					>
						<span className="small">Snap to Grid </span>
						<span
							style={{
								color: this.props.variables.snapEnabled ? "darkgreen" : "red",
							}}
						>
							{this.props.variables.snapEnabled ? "Enabled" : "Disabled"}
						</span>
						<br />
						<span className="small" style={{ fontSize: 9 }}>
							Incompatible With Dynamic Graph
						</span>
					</button>
					<p className="small">Weight to Distance Ratio</p>
					<input
						type="range"
						min="3"
						max="50"
						className="range"
						id="wScale"
						value={this.props.variables.wScale}
						onChange={() => {
							this.props.functions.setWScale(
								document.getElementById("wScale").value
							);
						}}
					></input>
					<button
						id="deleteGraph"
						onClick={() => {
							this.props.functions.resetGraph();
						}}
						style={{ color: "white", background: "red" }}
					>
						Delete Graph
					</button>
				</div>
				<div id="algorithms" className="tabs">
					<h1 className="ui-title">Algorithms</h1>
					<div className="algorithm-select">
						<select
							id="algorithm"
							value={this.props.variables.curAlg}
							onChange={() => {
								this.props.functions.changeAlg(
									document.getElementById("algorithm").value
								);
							}}
						>
							{!this.props.variables.directedEnabled ? (
								<>
									<option value="none">Select an Algorithm</option>
									<optgroup label="Works for undirected graphs">
										<option value="dijkstra">Dijkstra's</option>
										<option value="twoColor">Two Color</option>
										<option value="prim">Prim's MST</option>
										<option value="bridge">Tarjan's for Bridges</option>
										<option value="bf">Bellman Ford's</option>
									</optgroup>
									<optgroup label="Will not work as intended"></optgroup>
									<optgroup label="Switch to directed graph">
										<option value="scc">Tarjan's for SCC's</option>
									</optgroup>
								</>
							) : (
								<>
									<option value="none">Select an Algorithm</option>
									<optgroup label="Works for directed graphs">
										<option value="dijkstra">Dijkstra's</option>
										<option value="twoColor">Two Color</option>
										<option value="bf">Bellman Ford's</option>
										<option value="scc">Tarjan's for SCC's</option>
									</optgroup>
									<optgroup label="Will not work as intended"></optgroup>
									<optgroup label="Switch to undirected graph">
										<option value="prim">Prim's MST</option>
										<option value="bridge">Tarjan's for Bridges</option>
									</optgroup>
								</>
							)}
						</select>
					</div>
					<button
						className="algorithmButton"
						onClick={() => {
							this.props.functions.startAlg();
						}}
					>
						Start
					</button>
					<button
						className="algorithmButton"
						onClick={() => {
							this.props.functions.reset();
						}}
					>
						Reset Algorithm State
					</button>
					<p className="small">
						Algorithm Step Time: {this.props.variables.algDelay / 1000.0 + "s"}
					</p>
					<input
						type="range"
						min="100"
						max="2000"
						className="range"
						id="algDelay"
						value={this.props.variables.algDelay}
						onChange={() => {
							this.props.functions.setAlgDelay(
								document.getElementById("algDelay").value
							);
						}}
					></input>
					{this.props.variables.curAlg === "dijkstra"
						? this.dijkstraDesc
						: this.props.variables.curAlg === "twoColor"
						? this.twoColorDesc
						: this.props.variables.curAlg === "prim"
						? this.primDesc
						: this.props.variables.curAlg === "bridge"
						? this.bridgeDesc
						: this.props.variables.curAlg === "scc"
						? this.sccDesc
						: this.props.variables.curAlg === "bf"
						? this.bfDesc
						: ""}
				</div>
				<div id="text" className="tabs">
					<h1 className="ui-title">Graph as Text</h1>
					<p className="textInstructions">
						First line contains # of nodes and edges <br />
						Next [edges] lines contain node index of start, end, and weight
						<br />
						All numbers seperated by whitespace, nodes are 0-indexed. Duplicate
						and self-edges are ignored (for now). <br /> Optionally, append the
						start and end nodes at the bottom.
					</p>
					<textarea id="graphText"></textarea>
					<div style={{ display: "flex" }}>
						<button
							className="textButton halfWidth"
							onClick={() => {
								this.props.functions.loadGraph(
									document.getElementById("graphText").value,
									true,
									this.props.variables.inputDirected
								);
							}}
						>
							Import Text as Graph
						</button>
						<button
							className="textButton halfWidth"
							onClick={(e) => {
								this.props.functions.setInputDirected(
									!this.props.variables.inputDirected
								);
							}}
						>
							<span className="small">Directed Graph? </span>
							<span
								style={{
									color: this.props.variables.inputDirected
										? "darkgreen"
										: "red",
								}}
							>
								{this.props.variables.inputDirected ? "Yes" : "No"}
							</span>
						</button>
					</div>
					<button
						className="textButton"
						onClick={() => {
							document.getElementById("graphText").value =
								this.props.functions.getGraph();
						}}
					>
						Export Graph as Text
					</button>
					<p className="textError">{this.props.variables.textError}</p>
				</div>
				<div id="help" className="tabs">
					<h1 className="ui-title">Help</h1>
					<div id="helpText">
						<p className="textInstructions">
							This web application allows you to simulate some algorithms on
							graphs.
						</p>
						<p className="textInstructions">
							You can drag the black bar between the graph and the menu to
							resize it.
						</p>
						<h3>Builder</h3>
						<p className="textInstructions">
							In the builder, you can place nodes and connect them with edges,
							fix nodes in place (when using dynamic graph) and delete objects.{" "}
							<br />
							<b>Right click a node</b> to make it the start or goal node, and{" "}
							<b>right click an edge</b> to change its weight. <br />
							<b>Click anywhere</b> on the board to close the context menu.
							<br />
							In the modify section, give each edge a <b>
								random weight
							</b> or <b>randomly create edges</b> between nodes. You can{" "}
							<b>assign weights to edges based on their distance</b>, and toggle
							a <b>dynamic</b> and/or <b>directed graph</b>. <br />
							When dynamic graph is enabled, edges will act like springs and try
							to rearrange the graph so the distances correspond to weights.{" "}
							<br />
							With the <b>slider</b>, you can change the constant used to
							convert between weight and distance.
							<br />
							Clear the board with the <b>delete graph button</b>.
							<br /> <b>Drag nodes</b> to move them around, and{" "}
							<b>drag the board</b> to move around.
							<br />
							In the bottom left, there are 2 buttons that let you{" "}
							<b>go back to (0, 0)</b> and <b>cycle between nodes</b> if you
							lose them. <br />
						</p>
						<h3>Algorithms</h3>
						<p className="textInstructions">
							In the algorithms tab, you can select and simulate algorithms on
							your graph. Below, you will find a description and the steps of
							the algorithm. You can change how fast the algorithm runs with the
							slider.
						</p>
						<h3>Text</h3>
						<p className="textInstructions">
							In the text tab, you can import or export a graph as text. See the
							page for more details on formatting.
						</p>
					</div>
				</div>
			</div>
		);
	}
}
