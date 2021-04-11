import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Only allows unauthenticated users. Redirects users back to the Room page if already logged in.
 */
const PublicRoute = ({ comp: Component, ...otherProps}) => {
	const isLoggedIn = otherProps.isAuthenticated;
	return (
		<Route
			{...otherProps}
			render={routeProps => 
				isLoggedIn
					? <Redirect to={{
						pathname: '/room', 
						state: {
							from: routeProps.location
						}
					}} />
					: <Component {...otherProps} />
			}
		/>
	);
};

PublicRoute.propTypes = {
	comp: PropTypes.elementType.isRequired
};

export default PublicRoute;
