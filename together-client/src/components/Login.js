import React, { useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../store/actions/auth';
import PropTypes from 'prop-types';
import NavBarHome from './NavBarHome';
import FooterHome from './FooterHome';
import '../stylesheets/Login.css';


const Login = (props) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessages, setErrorMessages] = useState([]);
	const history = useHistory();
	const location = useLocation();
	
	const handleLogin = (event) => {
		event.preventDefault();
		props.onAuth(username, password)
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

	return (
		<div className="login-page text-center">
			<NavBarHome />

			<div className="login-container mx-auto d-flex w-100 align-items-center">
				<div className="card login-card">
					<div className="card-body login-card-body">
						<div>
							{errorMessages.map(message => 
								<div className="alert alert-danger" role="alert" key={message}>
									{message}
								</div>
							)}
						</div>
						<h4 className="signup-subtitle mb-4">Log in</h4>
						<form className="form-signup text-left" onSubmit={handleLogin}>
							<div className="form-group">
								<label className="text-md" htmlFor="inputUsername">Username</label>
								<input 
									type="text" 
									id="inputUsername" 
									className="form-control" 
									required value={username} 
									onChange={({ target }) => setUsername(target.value)} 
								/>
							</div>
							
							<div className="form-group">
								<label className="text-md" htmlFor="inputPassword">Password</label>
								<input 
									type="password" 
									id="inputPassword" 
									className="form-control" 
									required value={password} 
									onChange={({ target }) => setPassword(target.value)} 
								/>
							</div>
							
							<button 
								type="submit"
								className="register-button btn btn-lg btn-login btn-block login-button" 
							>
							Continue
							</button>
							<p className="text-center mt-5 mb-0">Don&apos;t have an account? <Link to="/register">Sign up</Link></p>
						</form>
					</div>
				</div>
			</div>

			<FooterHome />
		</div>
	);
};

Login.propTypes = {
	onAuth: PropTypes.func.isRequired,
	error: PropTypes.object
};

const mapStateToProps = (state) => {
	return {
		error: state.error
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		onAuth: (username, password) => dispatch(actions.authLogin(username, password))
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
