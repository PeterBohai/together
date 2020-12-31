import React, { useState, useEffect, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import '../../stylesheets/CanvasApp.css';

const CanvasApp = forwardRef(({ width, height, userInfo}, ref) => {
	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [canvasServerEvent, setCanvasServerEvent] = useState(null);
	const [strokeColor, setStrokeColor] = useState('black');
	const [strokeMode, setStrokeMode] = useState('draw');
	const ws = ref;

	// Initialize the canvas
	useEffect(() => {
		const canvas = canvasRef.current;

		// support higher screen density (retina display)
		canvas.width = width * 2;
		canvas.height = height * 2;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		
		const context = canvas.getContext('2d');
		context.scale(2, 2);
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.lineWidth = 5;
		contextRef.current = context;

		// load previous drawing if there is one
		const dataUrl = localStorage.getItem('roomCanvas');
		if (dataUrl != null) {
			const img = new Image();
			img.src = dataUrl;
			img.onload = () => {
				contextRef.current.drawImage(img, 0, 0, width, height);
			};
		}
	}, []);

	// Update stroke color
	useEffect(() => {
		contextRef.current.strokeStyle = strokeColor;
	}, [strokeColor]);

	useEffect(() => {
		if (canvasServerEvent !== null) {
			// Sync a finished "stroke" instead of sending every single drawing coordinate and event (Reduce load on websocket send queue)
			// DataUrl is a string
			const img = new Image();
			img.src = canvasServerEvent.status;
			img.onload = () => {
				contextRef.current.drawImage(img, 0, 0, width, height);
			};
			if (canvasServerEvent.clear) {
				localStorage.removeItem('roomCanvas');
				contextRef.current.clearRect(0, 0, width, height);
			}
		}
	}, [canvasServerEvent]);

	// Clear the drawing when the Clear button is pressed in the Room
	useEffect(() => {
		if (strokeMode === 'clear') {
			localStorage.removeItem('roomCanvas');
			contextRef.current.clearRect(0, 0, width, height);
			updateMousePos({status: canvasRef.current.toDataURL(), clear: true});
			changeModeToDraw();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [strokeMode]);


	useEffect(() => {
		if (!ws.current) return;
		
		ws.current.addEventListener('message', event => {
			const data = JSON.parse(event.data);
			console.log('onmessage data:', data);

			if(data.command === 'new_canvas_coords' && data.username !== userInfo.username) {
				setCanvasServerEvent(data);
				console.log('new_canvas_coords RECEIVED', data);
			} else {
				console.log('command either for ListApp or invalid');
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ---------------
	// Draw functions
	// ---------------

	const startDrawing = (nativeEvent, username) => {
		const {offsetX, offsetY} = nativeEvent;
		// if (username === userInfo.username) {
		// 	updateMousePos({offsetX, offsetY, status: 'start'});
		// }
		contextRef.current.beginPath();
		contextRef.current.moveTo(offsetX, offsetY);
		setIsDrawing(true);
	};

	const finishDrawing = (username) => {
		contextRef.current.closePath();
		if (username === userInfo.username) {
			updateMousePos({status: canvasRef.current.toDataURL(), clear: false});
		}
		// save drawing to be loaded again when page is refreshed
		localStorage.setItem('roomCanvas', canvasRef.current.toDataURL());
		setIsDrawing(false);
	};

	const handleDraw = (nativeEvent, username) => {
		if (!isDrawing) {
			return;
		}
		const {offsetX, offsetY} = nativeEvent;
		// if (username === userInfo.username) {
		// 	updateMousePos({offsetX, offsetY, status: 'drawing'});
		// }
		
		if (strokeMode === 'erase') {
			contextRef.current.globalCompositeOperation = 'destination-out';
			contextRef.current.lineWidth = 20;		
		} else {
			contextRef.current.globalCompositeOperation = 'source-over';
			contextRef.current.lineWidth = 5;
		}
		contextRef.current.lineTo(offsetX, offsetY);
		contextRef.current.stroke();
	};

	// ---------------------------------------------
	// Handler Functions
	// ---------------------------------------------

	const changeStrokeColor = (color) => {
		setStrokeColor(color);
		setStrokeMode('draw');
	};

	const changeModeToDraw = () => {
		setStrokeMode('draw');
	};

	// Recieve mouse coords from the CanvasApp component when drawing (send data to server for braodcasting)
	const updateMousePos = (mouseEvent) => {
		if(ws.current.readyState === WebSocket.OPEN) {
			console.log('SENDing MouseEvent from CanvasApp', mouseEvent);
			ws.current.send(JSON.stringify({
				command: 'new_canvas_coords',
				username: userInfo.username,
				offset_x: mouseEvent.offsetX,
				offset_y: mouseEvent.offsetY,
				status: mouseEvent.status,
				clear: mouseEvent.clear
			}));	
		}
	};

	// ---------------------------------------------
	// Render
	// ---------------------------------------------
	return (
		<div className="card shadow mb-4">
			<div className="card-header py-2 d-flex flex-row align-items-center justify-content-between">
				<h6 className="m-0 font-weight-bold text-center" style={{display: 'block'}}>Canvas</h6>

				<div className="right-side-wrapper">
					<div className="canvas-btn btn mr-3" onClick={() => setStrokeMode('clear')} role='button'>
						<div className="justify-content-center h-100 d-flex align-items-center">
							Clear
						</div>
					</div>
					<div className="dropdown no-arrow" style={{display: 'inline-block'}}>
						<div className="dropdown-toggle" style={{color: 'black'}} role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						</div>
						<div className="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink">
							<div className="dropdown-header">Switch colors:</div>
							<button className="dropdown-item" style={{color: 'black'}} onClick={() => changeStrokeColor('black')}>Black</button>
							<button className="dropdown-item" style={{color: 'blue'}} onClick={() => changeStrokeColor('blue')}>Blue</button>
							<button className="dropdown-item" style={{color: 'red'}} onClick={() => changeStrokeColor('red')}>Red</button>
							<button className="dropdown-item" style={{color: 'green'}} onClick={() => changeStrokeColor('green')}>Green</button>
						
							<hr className='dropdown-divider' />

							<button className="dropdown-item" onClick={() => setStrokeMode('draw')}>Draw</button>
							<button className="dropdown-item font-weight-bold" onClick={() => setStrokeMode('erase')}>Eraser</button>
						</div>
					</div>
				</div>
			</div>
                
			<div className="card-body p-0" id="canvas-container" style={{overflow: 'hidden'}}>
				<canvas 
					id="room-canvas"
					width="800" height="320" 
					onMouseDown={({ nativeEvent }) => startDrawing(nativeEvent, userInfo.username)}
					onMouseUp={() => finishDrawing(userInfo.username)}
					onMouseMove={({ nativeEvent }) => handleDraw(nativeEvent, userInfo.username)}
					onMouseLeave={finishDrawing}
					ref={canvasRef}
				/>
			</div>		
		</div>
	);
});

CanvasApp.displayName = 'CanvasApp';

CanvasApp.propTypes = {
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	canvasEvent: PropTypes.object,
	userInfo: PropTypes.object
};

export default CanvasApp;