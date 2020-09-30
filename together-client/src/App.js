import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch} from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './store/actions/auth';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import PropTypes from 'prop-types';

import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Room from './components/Room';
import './stylesheets/App.css';

// Load Font Awesome brand and solid icons
library.add(fab);
library.add(fas);

const App = (props) => {

	useEffect(() => {
		props.onTryAutoSignup();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	console.log('isAuthenticated', props.isAuthenticated);

	return (
		<Router>
			<Switch>
				<PublicRoute exact path="/login" {...props} comp={Login} ></PublicRoute>
				<PublicRoute exact path="/register" {...props} comp={Register} ></PublicRoute>
				<PrivateRoute path="/room" {...props} comp={Room} >
				</PrivateRoute>
				<PublicRoute exact path="/" {...props} comp={Home} ></PublicRoute>
			</Switch>
		</Router>
	);
};

App.propTypes = {
	onTryAutoSignup: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
	return {
		isAuthenticated: state.token !== null
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		onTryAutoSignup: () => dispatch(actions.authCheckState())
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
