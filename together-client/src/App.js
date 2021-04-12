import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './store/actions/auth';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import PropTypes from 'prop-types';

import PrivateRoute from './shared/PrivateRoute';
import PublicRoute from './shared/PublicRoute';
import Home from './Home';
import Login from './user/Login';
import Register from './user/Register';
import Room from './Room';
import './App.css';

// Load Font Awesome brand and solid icons
library.add(fab);
library.add(fas);

const App = (props) => {

	useEffect(() => {
		props.onTryAutoSignup();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Router>
			<Switch>
				<Route exact path="/login">
					<Login {...props}/>
				</Route>

				<Route exact path="/register">
					<Register {...props}/>
				</Route>

				<PrivateRoute path="/room" {...props} comp={Room} ></PrivateRoute>
				
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
