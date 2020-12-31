import React, { useState, useEffect, forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../stylesheets/QuizApp.css';

const QuizApp = forwardRef((props, ref) => {
	const [dailyTip, setDailyTip] = useState({});
	const [newQuestions, setNewQuestions] = useState([{
		'question': 'When you and your partner make plans, you are usually…',
		'category': 'Responsibility',
		'option1': 'Right on time',
		'option2': 'More or less on time',
		'option3': 'Somewhat late',
		'option4': 'Very late',
		'partner_answered': false,
		'guess_answer': true
	}]);
	const [questionsIndex, setQuestionsIndex] = useState(0);
	const [displayQuestions, setDisplayQuestions] = useState(false);
	const [displayChoices, setDisplayChoices] = useState(false);
	const [displayComplete, setDisplayComplete] = useState(false);
	const [displayMatch, setDisplayMatch] = useState(false);
	const [partnerAnswer, setPartnerAnswer] = useState(-1);
	const [matchedPartner, setMatchedPartner] = useState(false);

	// Retrieve the daily tip from the server
	useEffect(() => {
		let isMounted = true;
		axios.get('http://127.0.0.1:8000/api/daily-tip/')
			.then(res => {
				if (isMounted){
					setDailyTip(res.data);
				}
			})
			.catch(err => {
				console.log(`Error getting daily tip: ${err.response}`);
			});
		return () => isMounted = false;
	}, []);

	// ---------------------------------------------
	// Handler Functions
	// ---------------------------------------------
	const handlePlayClick = () => {
		
		// Display questions already completed screen if question index out of range
		if (questionsIndex >= newQuestions.length && newQuestions.length > 0) {
			// Check if timestamp of the first question is less than 24 hours old
			const ONE_DAY = 60 * 60 * 24 * 1000;
			let questionTimestamp = new Date(newQuestions[0].timestamp);
			if ((new Date()) - questionTimestamp < ONE_DAY) {
				console.log('Completed all questions for the day.');
				setDisplayComplete(true);
				return;
			}
		}

		// Get a new set of questions for the day if the above conditions are false (questions completed 24+ hrs ago)
		axios.get(`http://127.0.0.1:8000/api/newquizquestions/${props.userInfo.username}`)
			.then(res => {
				console.log(res.data);
				setNewQuestions(res.data);
				setDisplayQuestions(true);
			})
			.catch(err => {
				console.log(`Error getting list of new questions: ${err.response}`);
			});
	};

	const handleRevealChoices = () => {
		console.log('handleRevealChoices');
		setDisplayQuestions(false);
		setDisplayChoices(true);
	};

	const handleNextQuestion = () => {
		setQuestionsIndex(questionsIndex + 1);
		// Display the end screen when index is out of range
		if (questionsIndex + 1 >= newQuestions.length) {
			console.log('Completed all questions for the day.');
			setDisplayChoices(false);
			setDisplayQuestions(false);
			setDisplayMatch(false);
			setDisplayComplete(true);
		} else {
			setDisplayQuestions(true);
			setDisplayMatch(false);
			setDisplayChoices(false);
			setDisplayComplete(false);
		}
	};

	const handleRecordAnswer = (optionNumber) => {
		console.log(`Option Number ${optionNumber} was picked.`);
		const currQuestion = newQuestions[questionsIndex];
		
		// Send answer to server
		axios.post(`http://127.0.0.1:8000/api/recordanswer/${props.userInfo.username}`, {
			question_pk: currQuestion.question_pk,
			answer_number: optionNumber,
			guess_answer: currQuestion.guess_answer
		})
			.then(res => {
				console.log(res.data);
				console.log('questionsIndex ' + questionsIndex);
				console.log('newQuestions length ' + newQuestions.length);
				// display match or no match card display if guess_answer was true and server returned result
				if (res.data.partner_answer !== -1) {
					setDisplayMatch(true);
					setDisplayChoices(false);
					setDisplayQuestions(false);
					setDisplayComplete(false);
					setPartnerAnswer(res.data.partner_answer);
					setMatchedPartner(res.data.partner_answer === optionNumber);
					console.log('Set partner answer and match');
					return;
				}
				console.log('Still HERE');
				setQuestionsIndex(questionsIndex + 1);
				// Display the end screen when index is out of range
				if (questionsIndex + 1 >= newQuestions.length) {
					console.log('Completed all questions for the day.');
					setDisplayChoices(false);
					setDisplayQuestions(false);
					setDisplayMatch(false);
					setDisplayComplete(true);
				} else {
					setDisplayQuestions(true);
					setDisplayMatch(false);
					setDisplayChoices(false);
					setDisplayComplete(false);
				}
			})
			.catch(err => {
				console.log('questionsIndex ' + questionsIndex);
				console.log('newQuestions length ' + newQuestions.length);
				console.log(`Error posting question answer to server: ${err.response}`);
			});
	};

	const handleBackToTips = () => {
		setDisplayQuestions(false);
		setDisplayChoices(false);
		setDisplayComplete(false);
		setDisplayMatch(false);
	};

	// ---------------------------------------------
	// Conditional Renders
	// ---------------------------------------------

	const quizTipsCard = ( 
		<div>
			<div className="play-btn card shadow-sm mb-3" role='button' onClick={() => handlePlayClick()}>
				<div className="card-body">
					<div className="play-text-container justify-content-center h-100 d-flex align-items-center h3">
						<span className="mr-2">Play quiz!</span>
						<span>
							<FontAwesomeIcon icon={['fas', 'play-circle']} />
						</span>
					</div>
				</div>
			</div>

			<div className="card shadow-sm" style={{height: '250px'}}>
				<div className="card-header p-3 h6 font-weight-bold">Relationship Tip</div>
				<div className="card-body" style={{overflow: 'auto'}}>
					<h6 className="card-title text-center font-weight-bold">{dailyTip.title}</h6>
					<div className="card-text">{dailyTip.content}</div>
				</div>
			</div>
		</div>
	);

	const quizQuestionCard = (
		<div className="card shadow-sm h-100">
			<div className="card-header p-3 h6 font-weight-bold text-center">
				{newQuestions.length > 0 && questionsIndex < newQuestions.length
					? newQuestions[questionsIndex].category
					: null
				}
			</div>
			<div className="card-body h-100 p-0" 
				style={{cursor: 'pointer'}}
				onClick={() => handleRevealChoices()}
			>
				{newQuestions.length > 0 && questionsIndex < newQuestions.length
					? newQuestions[questionsIndex].guess_answer
						? <div className="card-title h6 w-100 text-center pt-5" style={{position: 'absolute'}}>
							Now guess what your partner <br />answered for this question!
						</div>
						: null
					: null
				}
				<div className="card-text p-5 d-flex h-100 align-items-center">
					<p className='text-center' style={{width: '100%'}}>
						{newQuestions.length > 0 && questionsIndex < newQuestions.length
							? newQuestions[questionsIndex].question
							: null
						}
					</p>
					
				</div>
			</div>
		</div>
	);

	const quizChoicesCard = ( 
		<div className="card h-100">
			<div className="card-header p-3 h6 font-weight-bold text-center">
				{newQuestions.length > 0 && questionsIndex < newQuestions.length 
					? newQuestions[questionsIndex].category
					: null
				}
			</div>
			<div className="card-body p-0 pt-3" style={{backgroundColor: '#ffe6ed'}}>
				{[1, 2, 3, 4].map( num => 
					<div className="card shadow-sm mb-3" 
						onClick={() => handleRecordAnswer(num)}
						style={{cursor: 'pointer'}}
						key={num}
					>
						<div className="card-body">
							<div className="card-text h-100 justify-content-center align-items-center text-center">
								
								{newQuestions.length > 0 && questionsIndex < newQuestions.length 
									? num === 1 
										? newQuestions[questionsIndex].option1 
										: num === 2
											? newQuestions[questionsIndex].option2
											: num === 3
												? newQuestions[questionsIndex].option3
												: num === 4
													? newQuestions[questionsIndex].option4
													: null
									: null}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);

	const answersMatchCard = (
		<div className="card h-100" onClick={() => handleNextQuestion()} style={{cursor: 'pointer'}}>
			<div className="card-header p-3 h6 font-weight-bold text-center">
				{newQuestions.length > 0 && questionsIndex < newQuestions.length 
					? newQuestions[questionsIndex].category
					: null
				}
			</div>
			<div className="card-body p-0 pt-3" style={{backgroundColor: '#ffe6ed'}}>
				{[1, 2, 3, 4].map(num => 
					<div className="card shadow-sm mb-3" 
						key={num}
						style={
							num === partnerAnswer && matchedPartner 
								? { backgroundColor: '#9effba'} 
								: num === partnerAnswer && !matchedPartner
									? { backgroundColor: '#ff0048'}
									:{}
						}
					>
						<div className="card-body">
							<div className="card-text h-100 justify-content-center align-items-center text-center">
								{newQuestions.length > 0 && questionsIndex < newQuestions.length
									? num === 1 
										? newQuestions[questionsIndex].option1 
										: num === 2
											? newQuestions[questionsIndex].option2
											: num === 3
												? newQuestions[questionsIndex].option3
												: num === 4
													? newQuestions[questionsIndex].option4
													: null
									: null}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);

	const completedDailyCard = (
		<div className="card shadow-sm h-100">
			
			<div className="card-body">
				<div className="card-title h5 text-center mt-2 mb-5">
					Questions completed for today!
				</div>
				<div className="card-text text-center">
					Come back tomorrow <br />for more questions :)
				</div>
			</div>
		</div>
	);

	const backButtonDisplay = (
		<div className="list-app-btn btn mr-3" role='button' onClick={handleBackToTips}>
			<div className="justify-content-center h-100 d-flex align-items-center">
				{'←'}
			</div>
		</div>
	);

	// ---------------------------------------------
	// Render
	// ---------------------------------------------
	return (
		<div className="card shadow" style={{height: '500px'}}>
		
			<div className='list-app-header card-header py-3 d-flex flex-row align-items-center justify-content-between'
				style={{backgroundColor: '#ff0048'}}>
				<h6 className="m-0 font-weight-bold" style={{color: 'white'}}>Happy Time</h6>
				{ displayQuestions || displayChoices || displayComplete ? backButtonDisplay : null }		
			</div>
	
			<div className="card-body h-100 p-4" style={{backgroundColor: '#ffe6ed'}}>
				{displayQuestions 
					? quizQuestionCard
					: displayChoices 
						? quizChoicesCard
						: displayComplete
							? completedDailyCard
							: displayMatch
								? answersMatchCard
								: quizTipsCard
				}
			</div>
		</div>
	);
});

QuizApp.displayName = 'QuizApp';

QuizApp.propTypes = {
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	canvasEvent: PropTypes.object,
	userInfo: PropTypes.object
};

export default QuizApp;