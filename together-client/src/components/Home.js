import React from 'react';
import {Link} from 'react-router-dom';
import NavBarHome from './NavBarHome';
import FooterHome from './FooterHome';
import '../stylesheets/Home.css';

const Home = (props) => {
	return (
		<div className="home-page text-center">
			<NavBarHome {...props} />
		
			<div className="cover-container mx-auto d-flex w-100 align-items-center">
				<div role="main" className="inner cover">
					<h1 className="cover-heading" id="cover-heading-top">Be closer,</h1>
					<h1 className="cover-heading" id="cover-heading-bot">Be Together</h1>
					<p className="title-blurb">Spend time with your partner, wherever you may be. Join in and have fun in <strong>real-time</strong>. Activities are always more fun together. Come on in, it&apos;s free!</p>
					<Link to="/register" className="btn btn-lg btn-danger mb-3" role="button">Sign up</Link>
				</div>
			</div>

			<FooterHome />
		</div>
	);
};

export default Home;