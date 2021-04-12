import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Only allows authenticated users. Redirects to the Login page if the user is not authenticated.
 */
const PrivateRoute = ({ comp: Component, ...rest}) => {
	const isLoggedIn = rest.isAuthenticated;
	return (
		<Route
			{...rest}
			render={
				routeProps => isLoggedIn
					? <Component {...rest} />
					: <Redirect to={{
						pathname: '/login', 
						state: {
							from: routeProps.location
						}
					}} />
			}
		/>
	);
};

PrivateRoute.propTypes = {
	comp: PropTypes.elementType.isRequired
};

export default PrivateRoute;