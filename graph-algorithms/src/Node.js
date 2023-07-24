import React from "react";

export default class Node extends React.Component {
	nodeRadius;

	constructor(props) {
		super(props);
		this.rectRef = React.createRef();
		this.subRef = React.createRef();
		this.nodeRadius = this.props.nodeRadius;
	}

	componentDidUpdate() {
		let bbox = this.subRef.current.getBBox();
		this.rectRef.current.setAttribute("x", bbox.x - 2);
		this.rectRef.current.setAttribute("y", bbox.y - 2);
		this.rectRef.current.setAttribute("width", bbox.width + 4);
		this.rectRef.current.setAttribute("height", bbox.height + 4);
	}

	componentDidMount() {
		let bbox = this.subRef.current.getBBox();
		this.rectRef.current.setAttribute("x", bbox.x - 2);
		this.rectRef.current.setAttribute("y", bbox.y - 2);
		this.rectRef.current.setAttribute("width", bbox.width + 4);
		this.rectRef.current.setAttribute("height", bbox.height + 4);
		// 	$(".node#" + this.props.i).draggable({
		// 		scroll: false,
		// 		containment: "parent",
		// 		drag: () => {
		// 			this.props.update(
		// 				$(".node#" + this.props.i).offset().left + this.nodeRadius,
		// 				$(".node#" + this.props.i).offset().top + this.nodeRadius,
		// 				this.props.i
		// 			);
		// 		},
		// 		stop: () => {
		// 			this.props.movement(true, false);
		// 			this.props.update(
		// 				$(".node#" + this.props.i).offset().left + this.nodeRadius,
		// 				$(".node#" + this.props.i).offset().top + this.nodeRadius,
		// 				this.props.i
		// 			);
		// 		},
		// 		start: () => {
		// 			this.props.movement(true, false, this.props.i);
		// 			this.props.update(
		// 				$(".node#" + this.props.i).offset().left + this.nodeRadius,
		// 				$(".node#" + this.props.i).offset().top + this.nodeRadius,
		// 				this.props.i
		// 			);
		// 		},
		// 	});
	}

	render() {
		return (
			<g className={"nodeButton" + (this.props.selected ? " selected" : "")}>
				<circle
					className={
						"node nodePart" +
						(this.props.fixed ? " fixed" : "") +
						(this.props.i === this.props.start ? " start" : "") +
						(this.props.i === this.props.end ? " end" : "") +
						(" vis" + this.props.vis) +
						(" c" + this.props.color) +
						(this.props.onStack ? " onStack" : "")
					}
					id={this.props.i}
					key={this.props.i}
					cx={this.props.x}
					cy={this.props.y}
					r={this.nodeRadius}
				></circle>
				<text
					x={this.props.x}
					y={this.props.y}
					id={this.props.i}
					className="nodeText nodePart"
				>
					{this.props.i}
				</text>
				<rect
					ref={this.rectRef}
					rx="4"
					className="nodeRect nodePart"
					id={this.props.i}
				>
					{" "}
				</rect>
				<text
					ref={this.subRef}
					x={this.props.x}
					y={this.props.y + 35}
					id={this.props.i}
					className="nodeSub nodePart"
				>
					{this.props.alg === "dijkstra"
						? this.props.dist
						: this.props.alg === "bridge"
						? this.props.disc + "/" + this.props.low
						: this.props.alg === "scc"
						? this.props.disc + "/" + this.props.low
						: this.props.alg === "bf"
						? this.props.dist
						: "N/A"}
				</text>
			</g>
		);
	}
}
