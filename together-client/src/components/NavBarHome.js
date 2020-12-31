import React, { useState }from 'react';
import { Link, useHistory }  from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../store/actions/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import axios from 'axios';
import $ from 'jquery';
import '../stylesheets/NavBarHome.css';

const NavBarHome = (props) => {
	const history = useHistory();
	const pathName = window.location.pathname;
	const [roomNumberInput, setRoomNumberInput] = useState('');
	
	const handleLogout = () => {
		props.logout();
		history.push('/');
	};

	const handleRoomConnect = (event) => {
		event.preventDefault();
		
		axios.put(`http://127.0.0.1:8000/api/user-info/${props.userInfo.username}`, {
			user_room_pk: roomNumberInput
		})
			.then(result => {
				console.log('Connecting to room status: ' + result.data.status);
				
				const user = JSON.parse(localStorage.getItem('user'));
				console.log(user);
				user.user_room_pk = roomNumberInput;
				console.log(user);
				localStorage.setItem('user', JSON.stringify(user));
				console.log(localStorage);
				setRoomNumberInput('');
				
				// Dismiss the modal after submitting
				$('#room-connect-modal').modal('toggle');
				window.location.reload();
			})
			.catch(err => {console.log('Error connecting to new room ' + err);});
	};

	const loginOut = props.isAuthenticated
		? null
		: <Link className="nav-link login-link" to="/login">Login</Link>;

	const rightAnchor = pathName === '/login' 
		? <Link className="nav-link login-link" to="/register">Sign up</Link>
		: loginOut;

	let userProfile = null;
	if (props.isAuthenticated && props.userInfo) {
		userProfile = (
			<div className="dropdown">
				<button className="btn user-profile d-flex align-items-center" 
					id="dropdownMenuButton" 
					data-toggle="dropdown" 
					aria-haspopup="true" aria-expanded="false">
					<span className="user-profile-name">{props.userInfo.first_name} {props.userInfo.last_name}</span>
					<div className="user-profile-pic ml-2">
					</div>
				</button>
				<div className="dropdown-menu dropdown-menu-right shadow" aria-labelledby="dropdownMenuButton">
					<div className="dropdown-item" role="button" onClick={handleLogout}>
						<FontAwesomeIcon icon={['fas', 'sign-out-alt']} className="mr-2 dropdown-item-icon"/>
						Logout
					</div>
					<div className="dropdown-item" role="button" data-toggle="modal" data-target="#room-connect-modal">
						<FontAwesomeIcon icon={['fas', 'link']} className="mr-2 dropdown-item-icon"/>
						Connect partner
					</div>
					<div className="dropdown-item">
						My Room #: {props.userInfo.user_room_pk}
					</div>
				</div>
			</div>
			
		);
	}
	
	let navbarClasses = 'navbar navbar-expand-lg navbar-light';
	
	if (pathName === '/login') {
		navbarClasses += ' pt-3 pb-0 pl-3 pr-3';
	} else if (pathName === '/room') {
		navbarClasses += ' shadow white-background';
	} else {
		navbarClasses += ' py-3';
	}

	return (
		<nav className={navbarClasses} id="mainNav">
			<div className="container">
				<Link className="navbar-brand js-scroll-trigger" to="/">Together</Link>
				<div className="ml-auto my-2 my-lg-0">
					<div className="nav-item">{rightAnchor}</div>
					<div className="nav-item">
						{userProfile}
					</div>
				</div>
			</div>
			{/* Modal for creating lists */}
			<div className="modal fade" id="room-connect-modal" tabIndex="-1" role="dialog" aria-labelledby="newListModal" aria-hidden="true">
				<div className="modal-dialog modal-dialog-centered" role="document">
					<div className="modal-content">
						<div className="modal-header px-4 py-2 pt-3" style={{backgroundColor: '#fff5f8'}}>
							<h6 className="modal-title">Enter Partner&apos;s Room Number</h6>
							<button type="button" className="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<form onSubmit={handleRoomConnect}>
							<div className="modal-body px-4 py-4">
								<div className="form-group mb-0">
									<label htmlFor="room-number-input" className="col-form-label" aria-label="List name" style={{display: 'none'}}></label>
									<input 
										ref={input => input && input.focus()} required 
										type="text" 
										className="form-control" 
										id="room-number-input"
										value={roomNumberInput} 
										onChange={({ target }) => setRoomNumberInput(target.value)}
									/>
								</div>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn list-app-btn-grey mr-2" data-dismiss="modal">Cancel</button>
								<button type="submit" className="btn new-list-item-btn-blue">Connect</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</nav>
	);
};

NavBarHome.propTypes = {
	logout: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool,
	userInfo: PropTypes.object
};

const mapDispatchToProps = (dispatch) => {
	return {
		logout: () => dispatch(actions.logout())
	};
};

export default connect(null, mapDispatchToProps)(NavBarHome);