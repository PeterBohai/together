import * as actionTypes from './actionTypes';
import axios from 'axios';

export const authStart = () => {
	return {
		type: actionTypes.AUTH_START
	};
};

export const authSuccess = (token) => {
	return {
		type: actionTypes.AUTH_SUCCESS,
		token: token
	};
};

export const authFail = (error) => {
	return {
		type: actionTypes.AUTH_FAIL,
		error: error
	};
};

export const logout = () => {
	localStorage.removeItem('user');
	localStorage.removeItem('expirationDate');
	return {
		type: actionTypes.AUTH_LOGOUT
	};
};

export const checkAuthTimeout = (expirationTime) => {
	return dispatch => {
		setTimeout(() => {
			dispatch(logout());
		}, expirationTime * 1000);
	};
};

export const authSignup = (firstName, lastName, username, email, password1, password2) => {
	return dispatch => {
		dispatch(authStart());
		return axios.post('http://127.0.0.1:8000/rest-auth/registration/', {
			first_name: firstName,
			last_name: lastName,
			username, 
			email,
			password1,
			password2
		})
			.then(res => {
				const token = res.data.key;

				// 1hr long expiration date
				const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
				localStorage.setItem('token', token);
				localStorage.setItem('expirationDate', expirationDate);
				dispatch(authSuccess(token));
				dispatch(checkAuthTimeout(3600));  // 3600 seconds
				return {success: true};
			})
			.catch(err => {
				// errors messages will be in the err response data returned
				const errorMessages = err.response.data;
				dispatch(authFail(err));
				throw errorMessages;
			});
	};
};

export const authLogin = (username, password) => {
	return dispatch => {
		dispatch(authStart());
		return axios.post('http://127.0.0.1:8000/rest-auth/login/', {
			username, 
			password
		})
			.then(res => {
				const token = res.data.key;

				// 1hr long expiration date
				const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
				localStorage.setItem('token', token);
				localStorage.setItem('expirationDate', expirationDate);
				dispatch(authSuccess(token));
				dispatch(checkAuthTimeout(3600));  // 3600 seconds
				return {success: true};
			})
			.catch(err => {
				// errors messages will be in the err response data returned
				const errorMessages = err.response.data;
				dispatch(authFail(err));
				throw errorMessages;
			});
	};
};

export const authCheckState = () => {
	return dispatch => {
		const token = localStorage.getItem('token');
		if (token === undefined) {
			dispatch(logout());
		} else {
			const expirationDate = new Date(localStorage.getItem('expirationDate'));
			if (expirationDate <= new Date()) {
				dispatch(logout());
			} else {
				dispatch(authSuccess(token));
				dispatch(checkAuthTimeout((expirationDate.getTime() - new Date().getTime()) / 1000));
			}
		}
	};
};