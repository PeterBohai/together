import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import '../stylesheets/Canvas.css';

const Canvas = ({ width, height, color, mode, canvasEvent, handleClear, userInfo, updateMousePos}) => {
	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	const [isDrawing, setIsDrawing] = useState(false);

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Change stroke color
	useEffect(() => {
		contextRef.current.strokeStyle = color;
	}, [color]);

	useEffect(() => {
		if (canvasEvent !== null) {
			// Sync a finished "stroke" instead of sending every single drawing coordinate and event (Reduce load on websocket send queue)
			const img = new Image();
			img.src = canvasEvent.status;
			img.onload = () => {
				contextRef.current.drawImage(img, 0, 0, width, height);
			};

			// (Ideally) Sync every drawing coordinate and event for smoother real-time interaction

			// console.log('RECEIVing Canvas Event useEffect', canvasEvent);
			// if (canvasEvent.status === 'start') {
			// 	const mouseCoords = {offsetX: canvasEvent.offset_x, offsetY: canvasEvent.offset_y};
			// 	startDrawing(mouseCoords, canvasEvent.username);
			// } else if (canvasEvent.status === 'drawing') {
			// 	const mouseCoords = {offsetX: canvasEvent.offset_x, offsetY: canvasEvent.offset_y};
			// 	handleDraw(mouseCoords, canvasEvent.username);
			// } else if (canvasEvent.status === 'stop') {
			// 	finishDrawing(canvasEvent.username);
			// }
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canvasEvent]);

	// Clear the drawing when the Clear button is pressed in the Room
	useEffect(() => {
		if (mode === 'clear') {
			localStorage.removeItem('roomCanvas');
			contextRef.current.clearRect(0, 0, width, height);
			handleClear();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode]);

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
			updateMousePos({status: canvasRef.current.toDataURL()});
		}
		// save drawing to be loaded again when page is refreshed
		localStorage.setItem('roomCanvas', canvasRef.current.toDataURL());
		console.log(typeof(canvasRef.current.toDataURL()));
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
		
		if (mode === 'erase') {
			contextRef.current.globalCompositeOperation = 'destination-out';
			contextRef.current.lineWidth = 20;		
		} else {
			contextRef.current.globalCompositeOperation = 'source-over';
			contextRef.current.lineWidth = 5;
		}
		contextRef.current.lineTo(offsetX, offsetY);
		contextRef.current.stroke();
	};

	// --------
	// Render 
	// --------

	return (
		<canvas 
			id="room-canvas"
			width="800" height="320" 
			onMouseDown={({ nativeEvent }) => startDrawing(nativeEvent, userInfo.username)}
			onMouseUp={() => finishDrawing(userInfo.username)}
			onMouseMove={({ nativeEvent }) => handleDraw(nativeEvent, userInfo.username)}
			onMouseLeave={finishDrawing}
			ref={canvasRef}
		/>
	);
};

Canvas.propTypes = {
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	color: PropTypes.string.isRequired,
	mode: PropTypes.string.isRequired,
	canvasEvent: PropTypes.object,
	handleClear: PropTypes.func.isRequired,
	updateMousePos: PropTypes.func,
	userInfo: PropTypes.object
};

export default Canvas;