import React from "react";

export default class Edge extends React.Component {
	edgeThick = 16;

	constructor(props) {
		super(props);
		this.rectRef = React.createRef();
		this.wRef = React.createRef();
	}

	componentDidUpdate() {
		let bbox = this.wRef.current.getBBox();
		this.rectRef.current.setAttribute("x", bbox.x - 2);
		this.rectRef.current.setAttribute("y", bbox.y - 2);
		this.rectRef.current.setAttribute("width", bbox.width + 4);
		this.rectRef.current.setAttribute("height", bbox.height + 4);
	}

	componentDidMount() {
		let bbox = this.wRef.current.getBBox();
		this.rectRef.current.setAttribute("x", bbox.x - 2);
		this.rectRef.current.setAttribute("y", bbox.y - 2);
		this.rectRef.current.setAttribute("width", bbox.width + 4);
		this.rectRef.current.setAttribute("height", bbox.height + 4);
	}

	render() {
		const p1 = this.props.p1;
		const p2 = this.props.p2;
		// const len = Math.sqrt(
		// 	(p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
		// );
		const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
		const sin = Math.sin(-ang);
		const cos = Math.cos(-ang);
		const path =
			"M " +
			p1.x +
			"," +
			p1.y +
			" C " +
			(p1.x + 50 * sin) +
			"," +
			(p1.y + 50 * cos) +
			" " +
			(p2.x + 50 * sin) +
			"," +
			(p2.y + 50 * cos) +
			" " +
			p2.x +
			"," +
			p2.y;
		return (
			<g className={"edgeButton" + (this.props.selected ? " selected" : "")}>
				{this.props.directed ? (
					<>
						<path
							id={"edge" + this.props.i}
							className={"edgeTextPath"}
							d={path}
						></path>
						<path
							className="edgeEdge edgePart"
							id={this.props.i}
							d={path}
							strokeWidth={this.edgeThick}
						></path>
						<path
							className="edge edgePart"
							id={this.props.i}
							d={path}
							strokeWidth={this.edgeThick - 5}
							markerStart="url(#arrow)"
							markerEnd="url(#arrow)"
							markerMid="url(#arrow)"
						></path>
						<path
							className={
								"cover edgePart" +
								(this.props.vis ? " vis" : "") +
								(this.props.onPath ? " on-path" : "") +
								(this.props.inTree ? " in-tree" : "") +
								(this.props.bridge ? " bridge" : "") +
								(this.props.err ? " err" : "") +
								(this.props.mov.edge === this.props.i ? " moving s1" : "")
							}
							id={this.props.i}
							d={path}
							strokeWidth={this.edgeThick - 5}
							pathLength="1"
							style={{ animationDuration: this.props.algDelay + "ms" }}
						></path>
						<text className="edgeArrow">
							<textPath
								id={this.props.i}
								className="edgePart"
								href={"#edge" + this.props.i}
								startOffset="30%"
							>
								➤
							</textPath>
							<textPath
								id={this.props.i}
								className="edgePart"
								href={"#edge" + this.props.i}
								startOffset="70%"
							>
								➤
							</textPath>
						</text>
						<rect
							className="edgeRect edgePart"
							id={this.props.i}
							ref={this.rectRef}
							rx="4"
						></rect>
						<text
							className="edgeText edgePart"
							id={this.props.i}
							x={(this.props.p1.x + this.props.p2.x) / 2 + 37.5 * sin}
							y={(this.props.p1.y + this.props.p2.y) / 2 + 37.5 * cos}
							ref={this.wRef}
						>
							{this.props.w}
						</text>
					</>
				) : (
					<>
						<line
							className="edgeEdge edgePart"
							id={this.props.i}
							x1={this.props.p1.x}
							y1={this.props.p1.y}
							x2={this.props.p2.x}
							y2={this.props.p2.y}
							strokeWidth={this.edgeThick}
						></line>
						<line
							className={
								"edge edgePart" +
								(this.props.vis && this.props.mov.edge !== this.props.i
									? " vis"
									: "") +
								(this.props.onPath && this.props.mov.edge !== this.props.i
									? " on-path"
									: "") +
								(this.props.inTree && this.props.mov.edge !== this.props.i
									? " in-tree"
									: "") +
								(this.props.bridge && this.props.mov.edge !== this.props.i
									? " bridge"
									: "")
							}
							id={this.props.i}
							x1={this.props.p1.x}
							y1={this.props.p1.y}
							x2={this.props.p2.x}
							y2={this.props.p2.y}
							strokeWidth={this.edgeThick - 5}
						></line>
						<line
							className={
								"cover edgePart" +
								(this.props.vis ? " vis" : "") +
								(this.props.onPath ? " on-path" : "") +
								(this.props.inTree ? " in-tree" : "") +
								(this.props.bridge ? " bridge" : "") +
								(this.props.err ? " err" : "") +
								(this.props.mov.edge === this.props.i
									? this.props.mov.dir === 1
										? " moving s1"
										: " moving s2"
									: "")
							}
							id={this.props.i}
							x1={this.props.p1.x}
							y1={this.props.p1.y}
							x2={this.props.p2.x}
							y2={this.props.p2.y}
							strokeWidth={this.edgeThick - 5}
							pathLength="1"
							style={{ animationDuration: this.props.algDelay + "ms" }}
						></line>
						<rect
							className="edgeRect edgePart"
							id={this.props.i}
							ref={this.rectRef}
							rx="4"
						></rect>
						<text
							className="edgeText edgePart"
							id={this.props.i}
							x={(this.props.p1.x + this.props.p2.x) / 2}
							y={(this.props.p1.y + this.props.p2.y) / 2}
							ref={this.wRef}
						>
							{this.props.w}
						</text>
					</>
				)}
			</g>
		);
	}
}
