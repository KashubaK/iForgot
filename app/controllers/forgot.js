/* globals $ */
import Ember from 'ember';
import ENV from '../config/environment';

export default Ember.Controller.extend({
	navbarColorStyle: "border-top: 10px solid " + ENV["Visual"].color_dark + ";",

	modalStyle: "background-color: "+ ENV["Visual"].color_light +";",
	modalTitleStyle: "border-bottom: 5px solid " + ENV["Visual"].color_medium + ";",
	logoStyle: "background-image: url("+ ENV["Visual"].district_img +");",

	districtWebsite: ENV["district_website"],

	username: "",

	usernameClass: "small-modal show ease",
	verifyAnswersClass: "small-modal hide ease",
	badAnswersClass: "small-modal hide ease",
	changePasswordClass: "small-modal hide ease",

	questions: [],

	actions: {
		updateUsername(str) {
			this.set('username', str);
		},

		getUserInformation() {
			var _this = this;

			$.ajax({
				'url': '/forgot/session',
				'method': "POST",
				'headers': {
					"Content-Type": "application/json"
				},

				"data": JSON.stringify({
					"username": this.get('username')
				})
			}).done(function(body) {
				for (var i in body.questions) {
					if (parseInt(i) === 0) {
						Ember.set(body.questions[i], 'class', "small-modal show ease");
					} else {
						Ember.set(body.questions[i], 'class', "small-modal hide ease");
					}

					for (var o in body.questions[i].answers) {
						var answer = body.questions[i].answers[o];

						body.questions[i].answers[o] = {
							'title': answer,
							'class': 'answer-choice ease'
						};
					}

					body.questions[i].i = i; //Each set should know its own index
				}

				console.log(Ember.get(body.questions[0], 'class'));

				_this.set('questions', body.questions);
				_this.set('usernameClass', "small-modal hide ease");
			}).fail(function() {
				alert("We were unable to grab questions for you. Please try refreshing your page, and if that doesn't work, contact Tech Support at ext. 3711.");
			});
		},

		sendAnswer(set, answer) {
			var currentQuestion = this.get('questions')[set];

			Ember.set(currentQuestion, 'answer', answer);
			Ember.set(currentQuestion, 'class', "small-modal hide ease");

			if (parseInt(set) + 1 !== this.get('questions').length) {
				var nextQuestion = this.get('questions')[parseInt(set) + 1];

				Ember.set(nextQuestion, 'class', "small-modal show ease");
			} else {
				this.set('verifyAnswersClass', 'small-modal show ease');
			}
		},

		submitAnswers() {
			var answers = [];
			for (var i = 0; i < this.get('questions').length; i++) {
				answers.push(this.get('questions')[i].answer.title);
			}

			var _this = this;

			$.ajax({
				'url': '/forgot/answers',
				'method': 'POST',
				'headers': {
					"Content-Type": "application/json"
				},

				'data': JSON.stringify({
					'answers': answers
				})
			}).done(function() {
				_this.set('verifyAnswersClass', 'small-modal hide ease');
				_this.set('changePasswordClass', 'small-modal show ease');
			}).fail(function() {
				_this.set('verifyAnswersClass', 'small-modal hide ease');
				_this.set('badAnswersClass', 'small-modal show ease');
			});
		},

		restart() {
			$.ajax({'url': 'session', 'method': 'DELETE'});
			window.location.reload();
		},

		goBackToQuestion(set, isFromVerifyStep) {
			if (set !== -1) {
				var intendedQuestion = this.get('questions')[set];

				Ember.set(intendedQuestion, 'class', "small-modal show-back ease");
			} else {
				this.set('usernameClass', "small-modal show-back ease");

				$.ajax({'url': 'session', 'method': 'DELETE'});
			}

			if (isFromVerifyStep) {
				this.set('verifyAnswersClass', "small-modal hide-back ease");
			} else {
				var previousQuestion = this.get('questions')[set + 1];

				Ember.set(previousQuestion, 'class', "small-modal hide-back ease");
			}
		},

		cancelPasswordChange() {
			this.set('verifyAnswersClass', 'small-modal show-back ease');
			this.set('changePasswordClass', 'small-modal hide-back ease');
		}
	},

	init() {
		this._super();

		$.ajax({'url': 'session', 'method': 'DELETE'});
	}
});
