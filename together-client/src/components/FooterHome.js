import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../stylesheets/FooterHome.css';

const FooterHome = () => {
	const footerClasses = window.location.pathname === '/' 
		? 'footer sticky-footer'
		: 'footer mt-5';

	return (
		<footer className={footerClasses}>
			<div className="container footer-container text-center">
				<div className="row align-items-center">
					<div className="col-lg-4 text-lg-left">Copyright 2021 © Peter Hu</div>
					<div className="col-lg-4 my-2 my-lg-0">
						<a className="btn-social mx-2" id="github-icon" href="https://github.com/PeterBohai"><FontAwesomeIcon icon={['fab', 'github']}/></a>
						<a className="btn-social mx-2" id="linkedin-icon" href="https://www.linkedin.com/in/peterhu08"><FontAwesomeIcon icon={['fab', 'linkedin']}/></a>
						<a className="btn-social mx-2" id="youtube-icon" href="https://www.youtube.com/channel/UC0hD-WYOogWBPt1Q0OiLAPw"><FontAwesomeIcon icon={['fab', 'youtube']}/></a>
					</div>
					<div className="terms-privacy col-lg-4 text-lg-right">
						<a className="mr-3" href="https://bundo-reviews.herokuapp.com/">Privacy Policy</a>
						<a href="https://bundo-reviews.herokuapp.com/">Terms of Use</a>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default FooterHome;