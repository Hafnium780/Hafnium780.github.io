import React from "react";

export default class Probe extends React.Component {
	render() {
		// let probeText = "";
		// if (this.state.probe.inspecting === 1) {
		// 	probeText =
		// 		"Outgoing edges: " +
		// 		this.state.graph.nodes[this.state.probe.i].edges.length;
		// } else if (this.state.probe.inspecting === 2) {
		// 	probeText =
		// 		"Connects nodes " +
		// 		this.state.graph.nodes.indexOf(
		// 			this.state.graph.edges[this.state.probe.i].n1
		// 		) +
		// 		" and " +
		// 		this.state.graph.nodes.indexOf(
		// 			this.state.graph.edges[this.state.probe.i].n2
		// 		);
		// }

		if (this.props.inspecting === 1)
			return (
				<div id="probe" style={{ top: this.props.y, left: this.props.x }}>
					<p>Node {this.props.i}</p>
					<p className="small">
						{this.props.graph.nodes[this.props.i].edges.length} outgoing
						connection
						{this.props.graph.nodes[this.props.i].edges.length === 1 ? "" : "s"}
					</p>
					<p className="small">Set node to</p>
					<button
						className={
							"probeSetNode probeButton" +
							(this.props.graph.nodes[this.props.i] ===
							this.props.graph.startNode
								? " start"
								: "")
						}
						onClick={() => {
							this.props.setNode(this.props.i, 0);
						}}
					>
						Start
					</button>
					<button
						className={
							"probeSetNode probeButton" +
							(this.props.graph.nodes[this.props.i] === this.props.graph.endNode
								? " goal"
								: "")
						}
						onClick={() => {
							this.props.setNode(this.props.i, 1);
						}}
					>
						Goal
					</button>
				</div>
			);
		else if (this.props.inspecting === 2)
			return (
				<div id="probe" style={{ top: this.props.y, left: this.props.x }}>
					<p>Edge {this.props.i}</p>
					<p className="small">
						Connects node{this.props.graph.directed ? " " : "s "}
						{this.props.graph.nodes.indexOf(
							this.props.graph.edges[this.props.i].n1
						)}
						{this.props.graph.directed ? " to " : " and "}
						{this.props.graph.nodes.indexOf(
							this.props.graph.edges[this.props.i].n2
						)}
					</p>
					<div id="probeWeight">
						<span className="small">Weight:</span>
						<input
							id="weightInp"
							type="text"
							defaultValue={this.props.graph.edges[this.props.i].w}
							key={this.props.graph.edges[this.props.i].w}
						></input>
						<div id="adjustWeight">
							<button
								id="weightUp"
								onClick={() => {
									this.props.changeW(
										this.props.i,
										parseInt(document.getElementById("weightInp").value) + 1
									);
								}}
							>
								▲
							</button>
							<button
								id="weightDown"
								onClick={() => {
									this.props.changeW(
										this.props.i,
										parseInt(document.getElementById("weightInp").value) - 1
									);
								}}
							>
								▼
							</button>
						</div>
					</div>
					<button
						className="probeButton"
						onClick={() => {
							this.props.changeW(
								this.props.i,
								document.getElementById("weightInp").value
							);
						}}
					>
						Set Weight
					</button>
				</div>
			);
		return <></>;
	}
}
