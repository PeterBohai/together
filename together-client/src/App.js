import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './store/actions/auth';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import PropTypes from 'prop-types';

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

	return (
		<Router>
			<Switch>
				<Route exact path="/register" >
					<Register {...props} />
				</Route>
				<Route exact path="/login" >
					<Login {...props}/>
				</Route>
				<Route exact path="/room" >
					<Room {...props}/>
				</Route>
				<Route exact path="/" >
					<Home {...props}/>
				</Route>
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
