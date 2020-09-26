import React from 'react';
import { Link, useHistory }  from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../store/actions/auth';
import PropTypes from 'prop-types';
import '../stylesheets/NavBarHome.css';

const NavBarHome = (props) => {
	const history = useHistory();
	const pathName = window.location.pathname;
	
	const handleLogout = () => {
		props.logout();
		history.push('/');
	};

	const loginOut = props.isAuthenticated
		? <div className="nav-link login-link" role="button" onClick={handleLogout}>Logout</div>
		: <Link className="nav-link login-link" to="/login">Login</Link>;

	const rightAnchor = pathName === '/login' 
		? <Link className="nav-link login-link" to="/register">Sign up</Link>
		: loginOut;
	
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
				<ul className="navbar-nav ml-auto my-2 my-lg-0">
					<li className="nav-item">{rightAnchor}</li>
				</ul>
			</div>
		</nav>
	);
};

NavBarHome.propTypes = {
	logout: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool
};

const mapDispatchToProps = (dispatch) => {
	return {
		logout: () => dispatch(actions.logout())
	};
};

export default connect(null, mapDispatchToProps)(NavBarHome);