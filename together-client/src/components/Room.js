import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import NavBarHome from './NavBarHome';
import CanvasApp from './app-components/CanvasApp';
import QuizApp from './app-components/QuizApp';
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
		let wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
		let roomName = userInfo.user_room_pk || JSON.parse(localStorage.getItem('user')).user_room_pk;
		let host = '127.0.0.1:8000';
		let wsUrl = `${wsScheme}://${host}/ws/room/${roomName}/`;
		ws.current = new WebSocket(wsUrl);
		
		ws.current.onopen = () => {
			console.log(`WebSocket connection opened --> ${wsUrl}`);
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

	// Get updated value of window width when resizing or on different screen sizes
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);
	useEffect(() => {
		function handleResize() {
			setWindowWidth(window.innerWidth);
		}
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// ---------------------------------------------
	// Conditional Renders
	// ---------------------------------------------
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
			<NavBarHome {...props} userInfo={userInfo} />
			
			<div className="upper-container row mt-4" style={{margin: '0'}}>
				<div className="col-lg-9 canvas-card-wrapper p-5">
					{wsRefReady ? 
						<CanvasApp 
							width={1000} height={330} 
							userInfo={userInfo}
							ref={ws}
						/> 
						: null}
				</div>

				<div className={statCardContainerClasses}>
					<div className="mb-4">
						<div id="top-data-card" className="data-card card border-left-primary  h-100 py-2">
							<div className="card-body">
								<div className="row no-gutters align-items-center">
									<div className="col mr-2">
										<div className="text-xs font-weight-bold text-red mb-1">Days Together</div>
										<div className="h5 mb-0 font-weight-bold text-gray-800">N/A</div>
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
										<div className="text-xs font-weight-bold text-blue mb-1">Anniversary Date</div>
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
										<div className="text-xs font-weight-bold text-green mb-1">Partner Status</div>
										<div className="h5 mb-0 font-weight-bold text-gray-800">Online</div>
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
					{wsRefReady ? 
						<ListApp 
							{...props} 
							ref={ws} 
							userInfo={userInfo}
						/> 
						: null}
				</div>

				<div className="col-lg-6 pr-5 pl-5 mb-5">
					{wsRefReady ? 
						<QuizApp 
							width={1000} height={330} 
							userInfo={userInfo}
							ref={ws}
						/> 
						: null}
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
