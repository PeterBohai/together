import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import NavBarHome from './NavBarHome';
import Canvas from './app-components/CanvasApp';
import ListApp from './app-components/ListApp';
import FooterHome from './FooterHome';
import '../stylesheets/Room.css';

const Room = (props) => {
	const [userInfo, setUserInfo] = useState({});
	
	// ---------------------------------------------
	// Effect Hooks
	// ---------------------------------------------

	// Get User information
	useEffect(() => {
		const user = localStorage.getItem('user');	
		setUserInfo(JSON.parse(user));
		console.log('User data from localStorage', user);
	}, []);

	// Initialize and open a websocket connection to the server
	const ws = useRef(null);
	const [wsRefReady, setWsRefReady] = useState(false);
	useEffect(() => {
		ws.current = new WebSocket('ws://127.0.0.1:8000/ws/room/testing/');
		ws.current.onopen = () => {
			console.log('websocket conneciton opened');
			const data = {
				command: 'fetch_lists', 
				username: userInfo.username || JSON.parse(localStorage.getItem('user')).username
			};
			console.log('fetching lists with:', data);
			ws.current.send(JSON.stringify(data));
		};
		ws.current.onclose = () => console.log('websocket conneciton closed');
		// Close the websocket connection when the component unmounts
		return () => {
			ws.current.close();
		};
	}, [props.isAuthenticated]);

	useEffect(() => {
		setWsRefReady(true);
	}, []);

	// Handle receiving websocket messages from the server
	const [roomLists, setRoomLists] = useState([]);
	const [canvasServerEvent, setCanvasServerEvent] = useState(null);
	useEffect(() => {
		if (!ws.current) return;

		ws.current.onmessage = e => {
			const data = JSON.parse(e.data);
			// console.log('onmessage data:', data);

			if (data.command === 'new_message'){
				setRoomLists([...roomLists, data.message.content]);
				console.log('new_message recieved', data.message.content);

			} else if(data.command === 'new_canvas_coords' && data.username !== userInfo.username) {
				setCanvasServerEvent(data);
				console.log('new_canvas_coords RECEIVED', canvasServerEvent);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [roomLists, canvasServerEvent]);

	// Get updated value of window width when resizing or on different screen sizes
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);
	useEffect(() => {
		function handleResize() {
			setWindowWidth(window.innerWidth);
		}
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Get a random daily tip from the server
	const [dailyTip, setDailyTip] = useState({});
	useEffect(() => {
		let isMounted = true;
		axios.get('http://127.0.0.1:8000/api/2')
			.then(res => {
				if (isMounted){
					setDailyTip(res.data);
				}
			})
			.catch(err => {
				console.log(`Error getting daily tip: ${err.response}`);
			});
		return () => isMounted = false;
	}, []);

	// ---------------------------------------------
	// Handler Functions
	// ---------------------------------------------

	// Set the Canvas properties and pass the values to the Canvas component
	const [strokeColor, setStrokeColor] = useState('black');
	const [strokeMode, setStrokeMode] = useState('draw');
	const changeModeToDraw = () => {
		setStrokeMode('draw');
	};
	const changeStrokeColor = (color) => {
		setStrokeColor(color);
		setStrokeMode('draw');
	};

	// Recieve mouse coords from the Canvas component when drawing (send data to server for braodcasting)
	const updateMousePos = (mouseEvent) => {
		if(ws.current.readyState === WebSocket.OPEN) {
			console.log('SENDing MouseEvent from Canvas', mouseEvent);
			ws.current.send(JSON.stringify({
				command: 'new_canvas_coords',
				username: userInfo.username,
				offset_x: mouseEvent.offsetX,
				offset_y: mouseEvent.offsetY,
				status: mouseEvent.status
			}));	
		}
	};

	// Conditional renders for more responsive elements
	let statCardContainerClasses = 'col-lg-3';
	if (windowWidth <= 992) {
		statCardContainerClasses += ' p-5';
	} else {
		statCardContainerClasses += ' pl-0 pr-5 pb-5 pt-5';
	}
	// ---------------------------------------------
	// Render
	// ---------------------------------------------

	return (
		<div id="room-page">
			<NavBarHome {...props} />
			<div className="text-center w-100 mt-3">
				Current user: <strong>{userInfo.username}</strong>
			</div>
			<div className="upper-container row mt-4" style={{margin: '0'}}>
				<div className="col-lg-9 canvas-card-wrapper p-5">
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
							<Canvas 
								width={1000} height={330} 
								color={strokeColor} 
								mode={strokeMode} 
								canvasEvent={canvasServerEvent}
								handleClear={changeModeToDraw} 
								updateMousePos={updateMousePos}
								userInfo={userInfo}
							/>
						</div>
					</div>
				</div>

				<div className={statCardContainerClasses}>
					<div className="mb-4">
						<div id="top-data-card" className="data-card card border-left-primary  h-100 py-2">
							<div className="card-body">
								<div className="row no-gutters align-items-center">
									<div className="col mr-2">
										<div className="text-xs font-weight-bold text-red mb-1">Days Together</div>
										<div className="h5 mb-0 font-weight-bold text-gray-800">736</div>
									</div>
									<div id="top-data-card-icon" className="data-card-icon col-auto">
										<FontAwesomeIcon icon={['fas', 'heart']} />
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="mb-4">
						<div id="middle-data-card" className="data-card card border-left-primary h-100 py-2">
							<div className="card-body">
								<div className="row no-gutters align-items-center">
									<div className="col mr-2">
										<div className="text-xs font-weight-bold text-blue mb-1">Other Stats</div>
										<div className="h5 mb-0 font-weight-bold text-gray-800">23</div>
									</div>
									<div id="middle-data-card-icon" className="data-card-icon col-auto">
										<FontAwesomeIcon icon={['fas', 'address-card']} />
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="mb-4">
						<div id="bottom-data-card" className="data-card card border-left-primary  h-100 py-2">
							<div className="card-body">
								<div className="row no-gutters align-items-center">
									<div className="col mr-2">
										<div className="text-xs font-weight-bold text-green mb-1">More Cool Data</div>
										<div className="h5 mb-0 font-weight-bold text-gray-800">3279</div>
									</div>
									<div id="bottom-data-card-icon" className="data-card-icon col-auto">
										<FontAwesomeIcon icon={['fas', 'comment']} />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<div className="lower-container row" style={{margin: '0'}}>
				<div className="col-lg-6 pr-5 pl-5">
					{wsRefReady ? <ListApp {...props} ref={ws} userInfo={userInfo}/> : null}
				</div>

				<div className="col-lg-6 pr-5 pl-5 mb-5">
					<div className="card shadow mb-4" style={{minHeight: '500px'}}>
						<div className="card-header py-2" style={{backgroundColor: '#ff0048'}}>
							<h6 className="m-0 font-weight-bold" style={{color: 'white'}}>Happy Time</h6>
						</div>
                
						<div className="card-body" style={{backgroundColor: '#ffe6ed'}}>
							
							<div className="play-btn card shadow-sm mb-3" role='button'>
								<div className="card-body">
									<div className="play-text-container justify-content-center h-100 d-flex align-items-center h3">
										<span className="mr-2">Play quiz!</span>
										<span>
											<FontAwesomeIcon icon={['fas', 'play-circle']} />
										</span>
									</div>
								</div>
							</div>

							<div className="card shadow-sm" style={{height: '250px'}}>
								<div className="card-header p-3 h6 font-weight-bold">Tip of the day</div>
								<div className="card-body" style={{overflow: 'auto'}}>
									<h6 className="card-title text-center font-weight-bold">{dailyTip.title}</h6>
									<div className="card-text">{dailyTip.content}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<FooterHome />
		</div>
	);
};

Room.propTypes = {
	isAuthenticated: PropTypes.bool
};


export default Room;
