import React, { useState, useEffect } from 'react';
import { Link, useHistory, useLocation }  from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import NavBarHome from '../../shared/NavBarHome';
import './Register.css';
  

const Register = (props) => {
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password1, setPassword1] = useState('');
	const [password2, setPassword2] = useState('');
	const [errorMessages, setErrorMessages] = useState([]);
	const history = useHistory();
	const location = useLocation();

	useEffect(() => {
		if (props.isAuthenticated) {
			history.push('/room');
		}
	}, []);

	useEffect(() => {
		function handleResize() {
			setWindowWidth(window.innerWidth);
		}
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleSignup = (event) => {
		event.preventDefault();
		// only redirect to the rooom view if there is no error, otherwise display error messages with alerts
		props.onAuth(firstName, lastName, username, email, password1, password2)
			.then(res => {
				// replace the current path with the previous page since going back to the Login page after authentication doesn't make sense
				const { from } = location.state || { from: { pathname: '/' } };
				history.replace(from);
				// redirect to the user's room
				history.push('/room');
			})
			.catch(err => {
				let errors = [];
				for (let value of Object.values(err)) {
					errors.push(...value);
				}
				setErrorMessages(errors);
			});
	};

	if (props.isAuthenticated) {
		return(<div></div>);
	}

	return (
		<div className="register-page">
			<div className="register-row row">
				<div className="col-md-5 register-left">
					<div className="blurb-wrapper">
						<div className="register-left-blurb">
							<nav className="navbar navbar-expand-lg navbar-light mb-3" id="mainNav">
								<Link className="navbar-brand pl-2" to="/">Together</Link>
							</nav>
							<div className="mb-3">
								<span className="check-icon mr-2"><FontAwesomeIcon icon={['fas', 'check-circle']} /></span>
								<span className="text-darker">Quick and free sign-up</span>
								<div className="pl-4 text-md text-dimmer">Enter your email address to create an account.</div>
							</div>
							<div className="mb-3">
								<span className="check-icon mr-2"><FontAwesomeIcon icon={['fas', 'check-circle']} /></span>
								<span className="text-darker">Join to be together</span>
								<div className="pl-4 text-md text-dimmer">Easily connect with your partner anywhere, anytime.</div>
							</div>
							<div className="mb-3">
								<span className="check-icon mr-2"><FontAwesomeIcon icon={['fas', 'check-circle']} /></span>
								<span className="text-darker">Start being closer</span>
								<div className="pl-4 text-md text-dimmer">Interact in real-time and feel closer together.</div>
							</div>
						</div>
					</div>
					<div className="register-left-footer text-muted text-center">
						<Link className="no-decoration text-dimmer text-sm" to="/">© Together</Link> · <small>Privacy & terms</small>				
					</div>
				</div>

				<div className="col-md-7 register-right">
					{windowWidth <= 768 ? <NavBarHome /> : null}
					<div className="register-form-container">
						<div>
							{errorMessages.map(message => 
								<div className="alert alert-danger" role="alert" key={message}>
									{message}
								</div>
							)}
						</div>
						<h4 className="signup-subtitle mb-4">Create your Together account</h4>
						<form className="form-signup text-left" onSubmit={handleSignup}>
							<div className="form-group mb-4">
								<div className="row">
									<div className="col">
										<label className="text-md mb-1" htmlFor="inputFirstName">First Name</label>
										<input 
											type="text" 
											id="inputFirstName" 
											className="form-control" 
											required value={firstName} 
											onChange={({ target }) => setFirstName(target.value)}/>
									</div>
									<div className="col">
										<label className="text-md mb-1" htmlFor="inputLastName">Last Name</label>
										<input 
											type="text" 
											id="inputLastName" 
											className="form-control" 
											required value={lastName} 
											onChange={({ target }) => setLastName(target.value)}/>
									</div>
								</div>
							</div>

							<div className="form-group mb-4">
								<label className="text-md mb-1" htmlFor="inputEmail">Email</label>
								<input 
									type="email" 
									id="inputEmail" 
									className="form-control" 
									required value={email} 
									onChange={({ target }) => setEmail(target.value)} 
								/>
							</div>

							<div className="form-group mb-4">
								<label className="text-md mb-1" htmlFor="inputUsername">Username</label>
								<input 
									type="text" 
									id="inputUsername" 
									className="form-control" 
									required value={username} 
									onChange={({ target }) => setUsername(target.value)} 
								/>
							</div>
							
							<div className="form-group mb-4">
								<label  className="text-md mb-1" htmlFor="inputPassword1">Password</label>
								<input 
									type="password" 
									id="inputPassword1" 
									className="form-control" 
									required value={password1} 
									onChange={({ target }) => setPassword1(target.value)} 
								/>
							</div>

							<div className="form-group">
								<label  className="text-md mb-1" htmlFor="inputPassword2">Confirm password</label>
								<input 
									type="password" 
									id="inputPassword2" 
									className="form-control" 
									required value={password2} 
									onChange={({ target }) => setPassword2(target.value)} 
								/>
							</div>
							
							<button 
								type="submit"
								className="register-button btn btn-lg btn-login btn-block login-button" 
							>
							Create account
							</button>

							<p className="text-center mt-5">Have an account? <Link to="/login">Log in</Link></p>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

Register.propTypes = {
	onAuth: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool.isRequired
};

const mapStateToProps = (state) => {
	return {
		error: state.error
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		onAuth: (firstName, lastName, username, email, password1, password2) => dispatch(actions.authSignup(firstName, lastName, username, email, password1, password2))
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Register);
