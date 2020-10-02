import React from 'react';
import { Route, Redirect} from 'react-router-dom';
import PropTypes from 'prop-types';

const PublicRoute = ({ comp: Component, ...rest}) => {
	const isLoggedIn = rest.isAuthenticated;
	return (
		<Route
			{...rest}
			render={routeProps => isLoggedIn && routeProps.location !== '/login'
				? <Redirect to={{pathname: '/room', state: {from: routeProps.location}}} />
				: <Component {...rest} />
			}
		/>
	);
};

PublicRoute.propTypes = {
	comp: PropTypes.elementType.isRequired
};

export default PublicRoute;