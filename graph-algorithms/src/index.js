import React from "react";
import ReactDOM from "react-dom/client";
import Board from "./Board.js";
import "./index.css";

class Main extends React.Component {
	render() {
		return (
			<div id="main">
				<Board />
			</div>
		);
	}
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Main />);

/* TODO



*/
