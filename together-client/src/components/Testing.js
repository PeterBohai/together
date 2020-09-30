import React, { useState, useEffect, useRef } from 'react';

const Testing = () => {
	const [counter, setCounter] = useState(0);

	// Initialize and open a websocket connection to the server
	const ws = useRef(null);
	useEffect(() => {
		ws.current = new WebSocket('ws://127.0.0.1:8000/ws/room/');
		ws.current.onopen = () => {
			console.log('websocket conneciton opened');
			ws.current.send(JSON.stringify({'command': 'fetch_messages' }));
			console.log('bufferedAmount', ws.current.bufferedAmount);
		};
		ws.current.onclose = () => console.log('websocket conneciton closed');

		// Close the websocket connection when the component unmounts
		return () => {
			ws.current.close();
		};
	}, []);

	useEffect(() => {
		if (!ws.current) return;

		ws.current.onmessage = e => {
			const data = JSON.parse(e.data);
			console.log('onmessage data:', data);
			setCounter(counter + 1);
		};
	}, [counter]);
	let i = 0;
	async function handleClick(mouseEvent) {
		// setInterval( () => {
		// 	console.log("Clicked");
		// 		console.log("SENDING", {
		// 			command: 'new_canvas_coords',
		// 			username: 'PeterBohai',
		// 			offset_x: i * 2,
		// 			offset_y: i,
		// 			status: 'testing'
		// 		});
		// 		ws.current.send(JSON.stringify({
		// 			command: 'new_canvas_coords',
		// 			username: 'PeterBohai',
		// 			offset_x: i * 2,
		// 			offset_y: i,
		// 			status: 'testing'
		// 		}));
		// 		console.log('bufferedAmount', ws.current.bufferedAmount);
		// i++;
		// }, 100);


		for (let m = 0; m < 300; m++) {
			console.log("Clicked");
			console.log("SENDING", {
				command: 'new_canvas_coords',
				username: 'PeterBohai',
				offset_x: i * 2,
				offset_y: i,
				status: 'testing'
			});
			ws.current.send(JSON.stringify({
				command: 'new_canvas_coords',
				username: 'PeterBohai',
				offset_x: i * 2,
				offset_y: i,
				status: 'testing'
			}));

			console.log('bufferedAmount', ws.current.bufferedAmount);
		}
	
	}

	
	// --------
	// Render 
	// --------

	return (
		<div>
			<button onClick={handleClick}>
			Click Me
		</button>
		<div>Counter: {counter}</div>
		</div>

		
	);
};

export default Testing;