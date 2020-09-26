import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import '../stylesheets/Canvas.css';

const Canvas = ({ width, height, color, mode, mouseCoords, handleClear, updateMousePos}) => {
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

	// TODO: Fix draw only when the coords are from the other person (draw start and end needs to be specified as well)
	useEffect(() => {
		if (mouseCoords !== null) {
			console.log('Canvas mouseCoords useEffect', mouseCoords);
			// const {offsetX, offsetY} = mouseCoords;
			// draw
		}
	}, [mouseCoords]);

	// Clear the drawing when the Clear button is pressed in the Room
	useEffect(() => {
		if (mode === 'clear') {
			localStorage.removeItem('roomCanvas');
			contextRef.current.clearRect(0, 0, width, height);
			handleClear();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode]);

	const startDrawing = ({ nativeEvent }) => {
		const {offsetX, offsetY} = nativeEvent;

		contextRef.current.beginPath();
		contextRef.current.moveTo(offsetX, offsetY);
		setIsDrawing(true);
	};

	// ---------------
	// Draw functions
	// ---------------
	const finishDrawing = () => {
		contextRef.current.closePath();

		// save drawing to be loaded again when page is refreshed
		localStorage.setItem('roomCanvas', canvasRef.current.toDataURL());
		setIsDrawing(false);
	};

	const handleDraw = ({ nativeEvent }) => {
		if (!isDrawing) {
			return;
		}
		const {offsetX, offsetY} = nativeEvent;
		draw(offsetX, offsetY);
	};

	const draw = (offsetX, offsetY) => {
		// Send coords up to parent component Room to be processed and delivered to server
		if (isDrawing) {
			updateMousePos({offsetX, offsetY});
		}
		
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
			onMouseDown={startDrawing}
			onMouseUp={finishDrawing}
			onMouseMove={handleDraw}
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
	mouseCoords: PropTypes.object,
	handleClear: PropTypes.func.isRequired,
	updateMousePos: PropTypes.func
};

export default Canvas;