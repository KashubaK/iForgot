"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define('password-gui-2016/app', ['exports', 'ember', 'password-gui-2016/resolver', 'ember-load-initializers', 'password-gui-2016/config/environment'], function (exports, _ember, _passwordGui2016Resolver, _emberLoadInitializers, _passwordGui2016ConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _passwordGui2016ConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _passwordGui2016ConfigEnvironment['default'].podModulePrefix,
    Resolver: _passwordGui2016Resolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _passwordGui2016ConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('password-gui-2016/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'password-gui-2016/config/environment'], function (exports, _emberCliAppVersionComponentsAppVersion, _passwordGui2016ConfigEnvironment) {

  var name = _passwordGui2016ConfigEnvironment['default'].APP.name;
  var version = _passwordGui2016ConfigEnvironment['default'].APP.version;

  exports['default'] = _emberCliAppVersionComponentsAppVersion['default'].extend({
    version: version,
    name: name
  });
});
define('password-gui-2016/components/change-password', ['exports', 'ember', 'password-gui-2016/config/environment'], function (exports, _ember, _passwordGui2016ConfigEnvironment) {
	exports['default'] = _ember['default'].Component.extend({
		goBackText: "Cancel",
		continueText: "Submit",
		animationText: "",

		hasError: true,
		submittingPassword: false,
		submittedPassword: false,
		showButtons: true,

		newPassword: "",
		verifyPassword: "",

		shownPasswordErrors: [],

		inputFieldClass: _ember['default'].computed('hasError', 'submittingPassword', function () {
			if (this.get('submittingPassword')) {
				return 'password hide ease';
			}

			if (this.get('hasError')) {
				return 'password error ease';
			}

			return 'password success ease';
		}),

		successAnimationClass: 'password-success ease',

		passwordErrors: {
			"match": "Your passwords don't match.",
			"eightChar": "You still need at least eight characters.",
			"number": "You are missing a number.",
			"lowercase": "You don't have a lower-case character.",
			"uppercase": "You have not included an upper-case character."
		},

		actions: {
			updateNewPassword: function updateNewPassword(str) {
				this.set('newPassword', str);
				this.send('checkForPasswordErrors');
			},

			updateVerifyPassword: function updateVerifyPassword(str) {
				this.set('verifyPassword', str);
				this.send('checkForPasswordErrors');
			},

			checkForPasswordErrors: function checkForPasswordErrors() {
				var errorsToShow = []; //Value to return

				var password = this.get('newPassword'); //Field for tests
				var verifyPassword = this.get('verifyPassword'); //Used for matching the passwords
				var errors = this.get('passwordErrors'); //Language

				function checkAndDetermineError(condition, errorId) {
					if (!condition) {
						errorsToShow.push(errors[errorId]);
					}
				}

				checkAndDetermineError(/[a-z]/g.test(password), "lowercase");
				checkAndDetermineError(/[A-Z]/g.test(password), "uppercase");
				checkAndDetermineError(/[0-9]/g.test(password), "number");
				checkAndDetermineError(password.length >= 8, "eightChar");
				checkAndDetermineError(password === verifyPassword, "match");

				this.set('hasError', errorsToShow.length > 0 ? true : false);
				this.set('shownPasswordErrors', errorsToShow);
			},

			goBack: function goBack() {
				this.sendAction('cancel');
			},

			submitPassword: function submitPassword() {
				if (this.get('hasError') === false) {
					this.set('submittingPassword', true);
					this.set('showButtons', false);
					this.set('animationText', 'Changing your password...');
					this.set('successAnimationClass', 'password-submitting ease');
					var _this = this;

					$.ajax({
						"url": "/password",
						"method": "POST",
						"headers": {
							"Content-Type": "application/json"
						},

						"data": JSON.stringify({
							"password": this.get('newPassword')
						})
					}).done(function () {
						_this.set('animationText', 'Done! In about five seconds, you will be redirected to the PSD Central Login to verify your new credentials. Please proceed to log in with your new password.');
						_this.set('successAnimationClass', 'password-submitting disappear ease');
						_this.set('submittedPassword', true);

						setTimeout(function () {
							window.location.assign("https://login.psd401.net/logout?service=" + _passwordGui2016ConfigEnvironment['default']["PasswordGUIHost"] + "/login&url=" + _passwordGui2016ConfigEnvironment['default']["PasswordGUIHost"] + "/login");
						}, 7500);

						_this.sendAction('done');
					}).fail(function () {
						_this.set('animationText', 'An error ocurred whilst changing your password. Please try again in a few seconds.');

						setTimeout(function () {
							_this.set('animationText', null);
							_this.set('submittingPassword', false);
							_this.set('showButtons', true);
							_this.set('successAnimationClass', 'password-success ease');
						}, 2500);
					});
				}
			}
		},

		init: function init() {
			this._super();

			this.send('checkForPasswordErrors');
		}
	});
});
/* globals $ */
define('password-gui-2016/components/password-finished', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({});
});
define('password-gui-2016/components/question-set', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Component.extend({
		question: {},

		ssn: '',
		answer: {},

		actions: {
			answer: function answer(id, ans) {
				this.sendAction("sendAnswer", id, ans);
			},

			updateSSN: function updateSSN(n) {
				this.set('ssn', {
					'title': n,
					'class': ''
				});
			},

			selectAnswer: function selectAnswer(userAnswer) {
				if (this.get('answer') === userAnswer) {
					this.set('answer', {});
					_ember['default'].set(userAnswer, 'class', 'answer-choice ease');
				} else {
					var answers = this.get('question').answers;

					for (var i = 0; i < answers.length; i++) {
						var answer = answers[i];

						if (userAnswer.title === answer.title) {
							_ember['default'].set(answer, 'class', 'answer-choice highlight ease');
							this.set('answer', answer);
						} else {
							_ember['default'].set(answer, 'class', 'answer-choice ease');
						}
					}
				}

				_ember['default'].set(this.get('question'), 'answer', this.get('answer'));
			},

			goBack: function goBack() {
				this.sendAction('goBackToQuestion', this.get('question').i - 1);
			}
		}
	});
});
define('password-gui-2016/components/sign-in', ['exports', 'ember', 'password-gui-2016/config/environment'], function (exports, _ember, _passwordGui2016ConfigEnvironment) {
	exports['default'] = _ember['default'].Component.extend({
		actions: {
			signIn: function signIn() {
				console.log("Going to sign in");
				this.sendAction('showLoginFields');
			},

			redirectToCAS: function redirectToCAS() {
				window.location.href = "https://login.psd401.net/login?service=" + _passwordGui2016ConfigEnvironment['default']["PasswordGUIHost"] + "/login&url=" + _passwordGui2016ConfigEnvironment['default']["PasswordGUIHost"];
			}
		}
	});
});
define("password-gui-2016/controllers/application", ["exports", "ember"], function (exports, _ember) {
	exports["default"] = _ember["default"].Controller.extend({
		title: "Reset Password",
		signInClass: "small-modal show",

		changePasswordClass: "small-modal hide",
		routeIsHome: false,
		passwordChanged: false,

		sessionData: {},
		sessionDataObserver: _ember["default"].observer('sessionData', function () {
			if (this.get('sessionData')) {
				this.set("signInClass", "small-modal hide");
				this.set("changePasswordClass", "small-modal show");
			}
		}),

		actions: {
			deleteSession: function deleteSession() {
				$.ajax({ url: 'session', 'method': "DELETE" });
			},

			done: function done() {
				console.log("The password has been changed, I'm going to do my things!");
			},

			cancel: function cancel() {
				this.send('deleteSession');
				window.location.reload();
			}
		},

		init: function init() {
			this._super();

			if (window.location.pathname == "/") {
				var _this = this;
				this.set('routeIsHome', true);

				$.ajax({
					'url': 'session'
				}).done(function (body) {
					_this.set('sessionData', body);

					if (body && body.state == 'done') {
						_this.send('deleteSession');

						_this.set('passwordChanged', true);
					}
				});
			} else {
				this.set('signInClass', 'small-modal hide');
			}
		}
	});
});
define('password-gui-2016/controllers/change', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Controller.extend({

		actions: {}
	});
});
define("password-gui-2016/controllers/forgot", ["exports", "ember"], function (exports, _ember) {
	exports["default"] = _ember["default"].Controller.extend({
		username: "",

		usernameClass: "small-modal show ease",
		verifyAnswersClass: "small-modal hide ease",
		badAnswersClass: "small-modal hide ease",
		changePasswordClass: "small-modal hide ease",

		questions: [],

		actions: {
			updateUsername: function updateUsername(str) {
				this.set('username', str);
			},

			getUserInformation: function getUserInformation() {
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
				}).done(function (body) {
					for (var i in body.questions) {
						if (parseInt(i) === 0) {
							_ember["default"].set(body.questions[i], 'class', "small-modal show ease");
						} else {
							_ember["default"].set(body.questions[i], 'class', "small-modal hide ease");
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

					console.log(_ember["default"].get(body.questions[0], 'class'));

					_this.set('questions', body.questions);
					_this.set('usernameClass', "small-modal hide ease");
				}).fail(function () {
					alert("We were unable to grab questions for you. Please try refreshing your page, and if that doesn't work, contact Tech Support at ext. 3711.");
				});
			},

			sendAnswer: function sendAnswer(set, answer) {
				var currentQuestion = this.get('questions')[set];

				_ember["default"].set(currentQuestion, 'answer', answer);
				_ember["default"].set(currentQuestion, 'class', "small-modal hide ease");

				if (parseInt(set) + 1 !== this.get('questions').length) {
					var nextQuestion = this.get('questions')[parseInt(set) + 1];

					_ember["default"].set(nextQuestion, 'class', "small-modal show ease");
				} else {
					this.set('verifyAnswersClass', 'small-modal show ease');
				}
			},

			submitAnswers: function submitAnswers() {
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
				}).done(function () {
					_this.set('verifyAnswersClass', 'small-modal hide ease');
					_this.set('changePasswordClass', 'small-modal show ease');
				}).fail(function () {
					_this.set('verifyAnswersClass', 'small-modal hide ease');
					_this.set('badAnswersClass', 'small-modal show ease');
				});
			},

			restart: function restart() {
				$.ajax({ 'url': 'session', 'method': 'DELETE' });
				window.location.reload();
			},

			goBackToQuestion: function goBackToQuestion(set, isFromVerifyStep) {
				if (set !== -1) {
					var intendedQuestion = this.get('questions')[set];

					_ember["default"].set(intendedQuestion, 'class', "small-modal show-back ease");
				} else {
					this.set('usernameClass', "small-modal show-back ease");

					$.ajax({ 'url': 'session', 'method': 'DELETE' });
				}

				if (isFromVerifyStep) {
					this.set('verifyAnswersClass', "small-modal hide-back ease");
				} else {
					var previousQuestion = this.get('questions')[set + 1];

					_ember["default"].set(previousQuestion, 'class', "small-modal hide-back ease");
				}
			},

			cancelPasswordChange: function cancelPasswordChange() {
				this.set('verifyAnswersClass', 'small-modal show-back ease');
				this.set('changePasswordClass', 'small-modal hide-back ease');
			}
		},

		init: function init() {
			this._super();

			$.ajax({ 'url': 'session', 'method': 'DELETE' });
		}
	});
});
/* globals $ */
define('password-gui-2016/controllers/teacher', ['exports', 'ember', 'password-gui-2016/config/environment'], function (exports, _ember, _passwordGui2016ConfigEnvironment) {
	exports['default'] = _ember['default'].Controller.extend({
		specifyStudentsClass: "modal show ease",
		passwordSchemeClass: "modal hide ease",
		verifyRequestClass: "modal hide ease",

		teacher: {
			"username": ""
		},

		studentSearch: "",

		selectedStudents: [],

		amountOfSelectedStudents: 0,

		students: [],
		amountOfStudents: _ember['default'].computed.alias('students.length'),

		classes: [],

		selectedClasses: [],

		passwordPreview: "smit0101",
		passwordScheme: "ln--bmbd",
		passwordSchemeState: "aaaaaaaa",
		passwordSchemeExplainedState: ["First Four of Last Name (aa), ", "", "Birth Month (aa), ", "Birth Day (aa)"],
		passwordSchemeExplanation: "",

		newPassword: "",
		verifyPassword: "",
		dontMatch: false,
		canContinue: false,

		doneLoading: true,

		exampleUser: {
			birthdate: "2000-01-01T00:00:00.000Z",
			firstName: "JOHN",
			middleName: "DOE",
			lastName: "SMITH",
			homePhone: "555.555.1234",
			street: "54321 JOHN ST"
		},

		amountOfCompletedStudents: 0,

		actions: {
			cancel: function cancel() {
				if (confirm("If you leave this page, you will be logged out.")) {
					$.ajax({
						'url': 'session',
						'type': 'DELETE'
					}).done(function () {
						//window.location.href = "https://psd401.net/";
					});
				}
			},

			toSpecifyUsersStep: function toSpecifyUsersStep() {
				this.set('passwordSchemeClass', 'modal hide-back ease');
				this.set('specifyStudentsClass', 'modal show-back ease');
			},

			toPasswordSchemeStep: function toPasswordSchemeStep() {
				if (this.get('selectedStudents').length === 0) {
					return alert("You must select at least one student.");
				}

				this.set('specifyStudentsClass', 'modal hide ease');
				this.set('passwordSchemeClass', 'modal show ease');
			},

			toVerifyRequestStep: function toVerifyRequestStep() {
				this.send('parsePasswordPreview');

				if (this.get('newPassword').length > 0) {
					if (this.get('dontMatch') === true) {
						return alert("Your passwords must match, try re-writing them. If you are using a custom scheme, erase both password fields.");
					}
				}

				this.set('passwordSchemeClass', 'modal hide ease');
				this.set('verifyRequestClass', 'modal show ease');
			},

			goBackToPasswordStep: function goBackToPasswordStep() {
				this.set('passwordSchemeClass', 'modal show-back ease');
				this.set('verifyRequestClass', 'modal hide-back ease');
				this.set('doneLoading', false);
				this.set('loadingPercentage', '');
			},

			updateStudentSearch: function updateStudentSearch(str) {
				this.set('studentSearch', str);

				if (str === "") {
					this.get('students').forEach(function (s) {
						_ember['default'].set(s, 'cssClass', 'student');
					});

					return;
				}

				str = str.toLowerCase();
				var indexOfStudent;

				for (var i = 0; i < this.get('students').length; i++) {
					var student = this.get('students')[i];

					if (student.info.firstName.toLowerCase().indexOf(str) > -1 || student.info.lastName.toLowerCase().indexOf(str) > -1 || student.id.toString().indexOf(str) > -1) {

						indexOfStudent = i;
						break;
					}
				}

				this.get('students').forEach(function (s, i) {
					if (i === indexOfStudent) {
						$('.students').scrollTop(indexOfStudent * 50);
						_ember['default'].set(s, 'cssClass', 'student search-highlight');
					} else {
						_ember['default'].set(s, 'cssClass', 'student');
					}
				});
			},

			selectClass: function selectClass(c) {
				var active = true;

				if (c.cssClass && c.cssClass.indexOf('highlight') > -1) {
					_ember['default'].set(c, 'cssClass', "button");
					active = false;
				} else {
					_ember['default'].set(c, 'cssClass', "button highlight");
				}

				for (var i = 0; i < c.students.length; i++) {
					this.send('selectStudent', c.students[i], active);
				}
			},

			selectStudent: function selectStudent(s, classIsActive) {
				if (this.get('selectedStudents').indexOf(s) > -1) {
					if (!classIsActive) {
						_ember['default'].set(s, 'cssClass', "student");
						this.get('selectedStudents').removeObject(s);
						this.set('amountOfSelectedStudents', this.get('amountOfSelectedStudents') - 1);
					}
				} else {
					if (classIsActive === undefined || classIsActive) {
						_ember['default'].set(s, 'cssClass', "student highlight");
						this.get('selectedStudents').addObject(s);
						this.set('amountOfSelectedStudents', this.get('amountOfSelectedStudents') + 1);
					}
				}
			},

			getTeacherData: function getTeacherData() {
				var _this = this;

				$.ajax({
					'url': 'teacher/classes'
				}).done(function (body) {
					if (body.sections) {
						body.sections.sort(function (a, b) {
							return parseInt(a.expression) > parseInt(b.expression);
						});

						var students = [];

						for (var i = 0; i < body.sections.length; i++) {
							body.sections[i].cssClass = 'button';

							for (var k = 0; k < body.sections[i].students.length; k++) {
								body.sections[i].students[k].cssClass = "student";
								students.push(body.sections[i].students[k]);
							}
						}

						students.sort(function (a, b) {
							if (a.info.lastName.toLowerCase() > b.info.lastName.toLowerCase()) {
								return 1;
							} else if (a.info.lastName.toLowerCase() < b.info.lastName.toLowerCase()) {
								return -1;
							} else {
								return 0;
							}
						});

						_this.set('students', students);
						_this.set('classes', body.sections);
					}
				});
			},

			firstFirstHalf: function firstFirstHalf(e) {
				var code = e.target.value.replace(" ", "").replace(/[a-z]/g, "").toLowerCase();
				if (code === 'a') {
					code = "aa";
				}

				this.set('passwordScheme', code + this.get('passwordScheme').substring(2));
				this.send('parsePasswordPreview');
			},

			secondFirstHalf: function secondFirstHalf(e) {
				var code = e.target.value.replace(" ", "").replace(/[a-z]/g, "").toLowerCase();
				if (code === '...') {
					code = "--";
				}

				if (code === 'a') {
					code = "aa";
				}

				this.set('passwordScheme', this.get('passwordScheme').substring(0, 2) + code + this.get('passwordScheme').substring(4));
				this.send('parsePasswordPreview');
			},

			firstSecondHalf: function firstSecondHalf(e) {
				var code = e.target.value.replace(" ", "").replace(/[a-z]/g, "").toLowerCase();
				if (code === 'a') {
					code = "aa";
				}

				this.set('passwordScheme', this.get('passwordScheme').substring(0, 4) + code + this.get('passwordScheme').substring(6));
				this.send('parsePasswordPreview');
			},

			secondSecondHalf: function secondSecondHalf(e) {
				var code = e.target.value.replace(" ", "").replace(/[a-z]/g, "").toLowerCase();
				if (code === '...') {
					code = "--";
				}

				if (code === 'a') {
					code = "aa";
				}

				this.set('passwordScheme', this.get('passwordScheme').substring(0, 6) + code);
				this.send('parsePasswordPreview');
			},

			firstFirstHalfOptions: function firstFirstHalfOptions(e) {
				var code = e.target.value;
				console.log("code", code);
				this.send('applyNewSchemeOptions', 0, code);
			},

			secondFirstHalfOptions: function secondFirstHalfOptions(e) {
				var code = e.target.value;
				console.log("code", code);
				this.send('applyNewSchemeOptions', 2, code);
			},

			firstSecondHalfOptions: function firstSecondHalfOptions(e) {
				var code = e.target.value;
				console.log("code", code);
				this.send('applyNewSchemeOptions', 4, code);
			},

			secondSecondHalfOptions: function secondSecondHalfOptions(e) {
				var code = e.target.value;
				console.log("code", code);
				this.send('applyNewSchemeOptions', 6, code);
			},

			applyNewSchemeOptions: function applyNewSchemeOptions(step, code) {
				var state = this.get('passwordSchemeState');

				function replaceAtIndex(firstIndex, secondIndex, originalString, replaceWith) {
					return originalString.substring(0, firstIndex) + replaceWith + originalString.substring(secondIndex);
				}

				this.set('passwordSchemeState', replaceAtIndex(step, step + 2, state, code));
				this.send('parsePasswordPreview');

				return this.get('passwordScheme');
			},

			parsePasswordPreview: function parsePasswordPreview() {
				var scheme = this.get('passwordScheme');
				var state = this.get('passwordSchemeState');
				var explanation = this.get('passwordSchemeExplainedState');
				var exampleUser = this.get('exampleUser');
				this.send('resetStudentStatus');

				var result = "";
				var maxStep = scheme.length;
				var _this = this;

				function processOptions(step, propertyName, hasLengthOfFour, expl) {
					if (step === 0) {
						expl = "The " + expl.substring(5);
					}

					switch (state.substring(step, step + 2)) {
						case 'aa':
							result += exampleUser[propertyName].toLowerCase().substring(0, 2);

							if (step !== 6) {
								explanation[step / 2] = expl + " (aa)";
							} else {
								explanation[step / 2] = " and lastly," + expl + " (aa).";
							}

							break;
						case 'Aa':
							result += exampleUser[propertyName].substring(0, 1).toUpperCase() + exampleUser[propertyName].substring(1, 2).toLowerCase();

							if (step !== 6) {
								explanation[step / 2] = expl + " (Aa)";
							} else {
								explanation[step / 2] = " and lastly," + expl + " (Aa).";
							}

							break;
						case 'aA':
							result += exampleUser[propertyName].substring(0, 1).toLowerCase() + exampleUser[propertyName].substring(1, 2).toUpperCase();

							if (step !== 6) {
								explanation[step / 2] = expl + " (aA)";
							} else {
								explanation[step / 2] = " and lastly," + expl + " (aA).";
							}

							break;
						case 'AA':
							result += exampleUser[propertyName].toUpperCase().substring(0, 2);

							if (step !== 6) {
								explanation[step / 2] = expl + " (AA)";
							} else {
								explanation[step / 2] = " and lastly," + expl + " (AA).";
							}

							break;
					}

					if (hasLengthOfFour) {
						switch (state.substring(step + 2, step + 4)) {
							case 'aa':
								result += exampleUser[propertyName].toLowerCase().substring(2, 4);

								if (step !== 6) {
									explanation[step / 2] = expl + " (aa)";
								} else {
									explanation[step / 2] = " and lastly," + expl + " (aa).";
								}

								break;
							case 'Aa':
								result += exampleUser[propertyName].substring(2, 3).toUpperCase() + exampleUser[propertyName].substring(3, 4).toLowerCase();

								if (step !== 6) {
									explanation[step / 2] = expl + " (Aa)";
								} else {
									explanation[step / 2] = " and lastly," + expl + " (Aa).";
								}

								break;
							case 'aA':
								result += exampleUser[propertyName].substring(2, 3).toLowerCase() + exampleUser[propertyName].substring(3, 4).toUpperCase();

								if (step !== 6) {
									explanation[step / 2] = expl + " (aA)";
								} else {
									explanation[step / 2] = " and lastly," + expl + " (aA).";
								}

								break;
							case 'AA':
								result += exampleUser[propertyName].toUpperCase().substring(2, 4);

								if (step !== 6) {
									explanation[step / 2] = expl + " (AA)";
								} else {
									explanation[step / 2] = " and lastly," + expl + " (AA).";
								}

								break;
						}
					}
				}

				function processStepOfScheme(scheme, step) {
					switch (scheme.substring(step, step + 2)) {
						case 'fn':
							if (scheme.substring(step + 2, step + 4) === '--') {
								processOptions(step, "firstName", true, " the first four of the student's first name");
							} else {
								processOptions(step, "firstName", false, " the first two of the student's first name");
							}

							break;
						case 'mn':
							if (scheme.substring(step + 2, step + 4) === '--') {
								processOptions(step, "middleName", true, " the first four of the student's middle name");
							} else {
								processOptions(step, "middleName", false, " the first two of the student's middle name");
							}

							break;
						case 'ln':
							if (scheme.substring(step + 2, step + 4) === '--') {
								processOptions(step, "lastName", true, " the first four of the student's last name");
							} else {
								processOptions(step, "lastName", false, " the first two of the student's last name");
							}

							break;
						case 'bd':
							result += exampleUser.birthdate.substring().toLowerCase().substring(8, 10);
							explanation[step / 2] = step !== 6 ? " the two digits of the student's birth day" : " and lastly, the two digits of the student's birth day.";
							break;
						case 'bm':
							result += exampleUser.birthdate.substring().toLowerCase().substring(5, 7);
							explanation[step / 2] = step !== 6 ? " the two digits of the student's birth month" : " and lastly, the two digits of the student's birth month.";
							break;
						case 'by':
							if (scheme.substring(step + 2, step + 4) === '--') {
								processOptions(step, "birthdate", true, " the four digits of the student's birth year");
							} else {
								processOptions(step, "birthdate", false, " the last two digits of the student's birth year");
							}

							break;
						case 'pn':
							if (scheme.substring(step + 2, step + 4) === '--') {
								result += exampleUser.homePhone.substring(8);
								explanation[step / 2] = step !== 6 ? " the last four digits of the student's home phone number" : " and lastly the last four digits of the student's home phone number.";
							} else {
								result += exampleUser.homePhone.substring(8, 10);
								explanation[step / 2] = step !== 6 ? " the first two of the last four digits of the student's home phone number" : " and lastly, the first two of the last four digits of the student's home phone number.";
							}

							break;
						case 'aa':
							if (scheme.substring(step + 2, step + 4) === '--') {
								processOptions(step, "street", true, " the first four digits of the student's address number");
							} else {
								processOptions(step, "street", false, " the first four digits of the student's address number");
							}

							break;
					}

					if (step === maxStep) {
						if (_this.get('passwordSchemeExplainedState').indexOf("") > -1) {
							_this.get('passwordSchemeExplainedState').splice(_this.get('passwordSchemeExplainedState').indexOf(""), 1);
						}

						_this.set('passwordSchemeExplanation', _this.get('passwordSchemeExplainedState').join());
						_this.set('passwordPreview', result);
					} else {
						processStepOfScheme(scheme, step + 2);
					}
				}

				processStepOfScheme(scheme, 0);
			},

			processPasswordScheme: function processPasswordScheme() {
				var usernames = [];

				this.get('selectedStudents').forEach(function (item) {
					usernames.push(item.info.username);
				});

				$.ajax({
					'url': 'teacher/scheme',
					'method': 'POST',
					'headers': {
						'Content-Type': 'application/json'
					},

					'data': JSON.stringify({
						'scheme': this.get('passwordScheme'),
						'state': this.get('passwordSchemeState'),
						'users': usernames
					})
				}).done(function (body) {
					console.log(body);
				});
			},

			districtStandard: function districtStandard() {
				$('.options.first').val('Last Name');
				$('.options.first').change();
				$('.extra-options.first').val('aa');
				$('.extra-options.first').change();
				$('.options.second').val('...');
				$('.options.second').change();
				$('.extra-options.second').val('aa');
				$('.extra-options.second').change();
				$('.options.third').val('Birth Month');
				$('.options.third').change();
				$('.extra-options.third').val('aa');
				$('.extra-options.third').change();
				$('.options.fourth').val('Birth Day');
				$('.options.fourth').change();
				$('.extra-options.fourth').val('aa');
				$('.extra-options.fourth').change();
			},

			updateNewPassword: function updateNewPassword(str) {
				this.set('newPassword', str);
				this.send('checkPasswords');
			},

			updateVerifyPassword: function updateVerifyPassword(str) {
				this.set('verifyPassword', str);
				this.send('checkPasswords');
			},

			checkPasswords: function checkPasswords() {
				this.send('resetStudentStatus');

				if (this.get('newPassword') !== this.get('verifyPassword')) {
					this.set('dontMatch', true);
					this.set('canContinue', false);
				} else {
					this.set('dontMatch', false);
					this.set('canContinue', true);
				}
			},

			submitPassword: function submitPassword() {
				if (this.get('doneLoading') === false) return alert("Please wait until your current request is done.");

				var _this = this;
				this.set('loadingPercentage', "0");
				this.set('doneLoading', false);
				var amountOfStudents = this.get('selectedStudents').length;
				var completedStudents = 0;

				async.each(this.get('selectedStudents'), function (selectedStudent, callback) {
					_ember['default'].set(selectedStudent, 'status', '');
					var student = selectedStudent.info.username;

					console.log("Changing", student);

					if (typeof student !== 'string') return;

					if (_this.get('newPassword').length > 0) {
						console.log("Is using a custom password");
						console.log(_this.get('canContinue'), _this.get('dontMatch'));

						if (_this.get('canContinue') && _this.get('dontMatch') === false) {
							console.log("Submitting request");
							//good to go
							$.ajax({
								'url': 'teacher/password',
								'method': "POST",
								"headers": {
									"Content-Type": "application/json"
								},

								"data": JSON.stringify({
									"username": student,
									"password": _this.get('newPassword')
								})
							}).done(function (body) {
								if (body.success) {
									_ember['default'].set(selectedStudent, 'status', 'success');
								} else {
									_ember['default'].set(selectedStudent, 'status', 'failure');
								}

								completedStudents++;
								_this.set('loadingPercentage', "" + parseInt(completedStudents / amountOfStudents * 100));

								callback();
							});
						}
					} else {
						$.ajax({
							'url': 'teacher/scheme',
							'method': "POST",
							"headers": {
								"Content-Type": "application/json"
							},

							"data": JSON.stringify({
								"username": student,
								"scheme": _this.get('passwordScheme'),
								"state": _this.get('passwordSchemeState')
							})
						}).done(function (body) {
							if (body.data.data.result.success) {
								_ember['default'].set(selectedStudent, 'status', 'success');
							} else {
								_ember['default'].set(selectedStudent, 'status', 'failure');
							}

							completedStudents++;
							_this.set('loadingPercentage', "" + parseInt(completedStudents / amountOfStudents * 100));

							callback();
						});
					}
				}, function () {
					_this.set('doneLoading', true);
					setTimeout(function () {
						alert("Your changes are complete. If some students in the list are red, go back and select only the ones that failed, and try again.");
					});
				});
			},

			resetStudentStatus: function resetStudentStatus() {
				this.get('students').forEach(function (student) {
					_ember['default'].set(student, 'status', '');
				});
			}
		},

		init: function init() {
			this._super();
			var _this = this;

			$.ajax({
				'url': 'teacher/session'
			}).done(function (body) {
				if (body.username) {
					_ember['default'].set(_this.get('teacher'), 'username', body.username);

					if (body.username === "kashubak" || body.username === "boylen" || body.username === "hagelk" || body.username === "martinb" || body.username === "songstadw" || body.username === "ashbyg" || body.username === "kelleyj") {
						var newuser = prompt("Enter a teacher's username.");

						$.ajax({
							'url': 'teacher/admin/session',
							'method': "POST",
							"headers": {
								"Content-Type": "application/json"
							},

							"data": JSON.stringify({
								"username": newuser
							})
						}).done(function () {
							_this.send('getTeacherData');
						});
					} else {
						_this.send('getTeacherData');
					}
				} else {
					//our login endpoint will know the user is trying to use the teacher tool
					window.location.href = "https://login.psd401.net/login?service=" + _passwordGui2016ConfigEnvironment['default']["PasswordGUIHost"] + "/login";
				}
			}).fail(function () {
				//handle error
			});
		}
	});
});
/* globals $ */
define('password-gui-2016/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('password-gui-2016/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define('password-gui-2016/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'password-gui-2016/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _passwordGui2016ConfigEnvironment) {
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(_passwordGui2016ConfigEnvironment['default'].APP.name, _passwordGui2016ConfigEnvironment['default'].APP.version)
  };
});
define('password-gui-2016/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('password-gui-2016/initializers/data-adapter', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `data-adapter` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'data-adapter',
    before: 'store',
    initialize: _ember['default'].K
  };
});
define('password-gui-2016/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data/-private/core'], function (exports, _emberDataSetupContainer, _emberDataPrivateCore) {

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    App.StoreService = DS.Store.extend({
      adapter: 'custom'
    });
  
    App.PostsController = Ember.ArrayController.extend({
      // ...
    });
  
    When the application is initialized, `App.ApplicationStore` will automatically be
    instantiated, and the instance of `App.PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */

  exports['default'] = {
    name: 'ember-data',
    initialize: _emberDataSetupContainer['default']
  };
});
define('password-gui-2016/initializers/export-application-global', ['exports', 'ember', 'password-gui-2016/config/environment'], function (exports, _ember, _passwordGui2016ConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_passwordGui2016ConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var value = _passwordGui2016ConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_passwordGui2016ConfigEnvironment['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('password-gui-2016/initializers/injectStore', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `injectStore` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'injectStore',
    before: 'store',
    initialize: _ember['default'].K
  };
});
define('password-gui-2016/initializers/store', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `store` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'store',
    after: 'ember-data',
    initialize: _ember['default'].K
  };
});
define('password-gui-2016/initializers/transforms', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `transforms` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'transforms',
    before: 'store',
    initialize: _ember['default'].K
  };
});
define("password-gui-2016/instance-initializers/ember-data", ["exports", "ember-data/-private/instance-initializers/initialize-store-service"], function (exports, _emberDataPrivateInstanceInitializersInitializeStoreService) {
  exports["default"] = {
    name: "ember-data",
    initialize: _emberDataPrivateInstanceInitializersInitializeStoreService["default"]
  };
});
define('password-gui-2016/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('password-gui-2016/router', ['exports', 'ember', 'password-gui-2016/config/environment'], function (exports, _ember, _passwordGui2016ConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _passwordGui2016ConfigEnvironment['default'].locationType
  });

  Router.map(function () {
    this.route('forgot');
    this.route('teacher');
    this.route('change');
  });

  exports['default'] = Router;
});
define('password-gui-2016/routes/change', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('password-gui-2016/routes/change/login', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('password-gui-2016/routes/forgot', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('password-gui-2016/routes/teacher', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('password-gui-2016/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define("password-gui-2016/templates/application", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 11,
              "column": 0
            },
            "end": {
              "line": 29,
              "column": 0
            }
          },
          "moduleName": "password-gui-2016/templates/application.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("\n	");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "small-modal");
          var el2 = dom.createTextNode("\n		");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "modal-title");
          var el3 = dom.createTextNode("\n			");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("span");
          var el4 = dom.createTextNode("Password Changed");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n		");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n		");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "modal-body");
          var el3 = dom.createTextNode("\n			");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "done-text margin-auto");
          var el4 = dom.createTextNode("\n				");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("span");
          var el5 = dom.createTextNode("\n					From now on, with any PSD service, you need to enter your new credentials. If by any chance you have forgotten your password, just select the \"Forgot?\" option at the ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("a");
          dom.setAttribute(el5, "href", "https://iforgot.psd401.net/");
          var el6 = dom.createTextNode("homepage");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode(".\n				");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n			");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n			\n			");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("a");
          dom.setAttribute(el3, "href", "https://my.psd401.net/");
          var el4 = dom.createElement("div");
          dom.setAttribute(el4, "class", "psd-logo margin-auto ease");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n		");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n	");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.4.6",
            "loc": {
              "source": null,
              "start": {
                "line": 30,
                "column": 1
              },
              "end": {
                "line": 45,
                "column": 1
              }
            },
            "moduleName": "password-gui-2016/templates/application.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("		");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n\n		");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(2);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            morphs[1] = dom.createMorphAt(fragment, 3, 3, contextualElement);
            return morphs;
          },
          statements: [["inline", "sign-in", [], ["class", ["subexpr", "@mut", [["get", "signInClass", ["loc", [null, [33, 9], [33, 20]]]]], [], []], "showLoginFields", "showLoginFields"], ["loc", [null, [31, 2], [36, 4]]]], ["inline", "change-password", [], ["class", ["subexpr", "@mut", [["get", "changePasswordClass", ["loc", [null, [40, 9], [40, 28]]]]], [], []], "done", "done", "cancel", "cancel"], ["loc", [null, [38, 2], [44, 4]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 29,
              "column": 0
            },
            "end": {
              "line": 46,
              "column": 0
            }
          },
          "moduleName": "password-gui-2016/templates/application.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["get", "routeIsHome", ["loc", [null, [30, 7], [30, 18]]]]], [], 0, null, ["loc", [null, [30, 1], [45, 8]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes", "wrong-type"]
        },
        "revision": "Ember@2.4.6",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 48,
            "column": 10
          }
        },
        "moduleName": "password-gui-2016/templates/application.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "nav-bar ease");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("a");
        dom.setAttribute(el2, "href", "https://psd401.net/");
        dom.setAttribute(el2, "target", "_blank");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "psd-logo");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "title");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 3, 1]), 0, 0);
        morphs[1] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        morphs[2] = dom.createMorphAt(fragment, 4, 4, contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["content", "title", ["loc", [null, [7, 8], [7, 17]]]], ["block", "if", [["get", "passwordChanged", ["loc", [null, [11, 6], [11, 21]]]]], [], 0, 1, ["loc", [null, [11, 0], [46, 7]]]], ["content", "outlet", ["loc", [null, [48, 0], [48, 10]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("password-gui-2016/templates/change", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.4.6",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 10
          }
        },
        "moduleName": "password-gui-2016/templates/change.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["content", "outlet", ["loc", [null, [1, 0], [1, 10]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("password-gui-2016/templates/change/login", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.4.6",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "password-gui-2016/templates/change/login.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["content", "outlet", ["loc", [null, [1, 0], [1, 10]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("password-gui-2016/templates/components/change-password", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.4.6",
            "loc": {
              "source": null,
              "start": {
                "line": 15,
                "column": 4
              },
              "end": {
                "line": 17,
                "column": 4
              }
            },
            "moduleName": "password-gui-2016/templates/components/change-password.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("					");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
            return morphs;
          },
          statements: [["content", "error", ["loc", [null, [16, 9], [16, 18]]]]],
          locals: ["error"],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 13,
              "column": 3
            },
            "end": {
              "line": 18,
              "column": 3
            }
          },
          "moduleName": "password-gui-2016/templates/components/change-password.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("				");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1, "class", "header");
          var el2 = dom.createTextNode("Problem(s):");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 3, 3, contextualElement);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "each", [["get", "shownPasswordErrors", ["loc", [null, [15, 12], [15, 31]]]]], [], 0, null, ["loc", [null, [15, 4], [17, 13]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 18,
              "column": 3
            },
            "end": {
              "line": 21,
              "column": 3
            }
          },
          "moduleName": "password-gui-2016/templates/components/change-password.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("				");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1, "class", "animation-label");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n				");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element3 = dom.childAt(fragment, [3]);
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          morphs[1] = dom.createAttrMorph(element3, 'class');
          return morphs;
        },
        statements: [["content", "animationText", ["loc", [null, [19, 32], [19, 49]]]], ["attribute", "class", ["get", "successAnimationClass", ["loc", [null, [20, 17], [20, 38]]]]]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 28,
              "column": 1
            },
            "end": {
              "line": 41,
              "column": 1
            }
          },
          "moduleName": "password-gui-2016/templates/components/change-password.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("		");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "modal-footer");
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "modal-footer-buttons");
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "modal-footer-button two first ease");
          var el4 = dom.createTextNode("\n					");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("span");
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n				");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n			\n\n				");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "modal-footer-button two last ease");
          var el4 = dom.createTextNode("\n					");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("span");
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n				");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n			");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n		");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1, 1]);
          var element1 = dom.childAt(element0, [1]);
          var element2 = dom.childAt(element0, [3]);
          var morphs = new Array(4);
          morphs[0] = dom.createElementMorph(element1);
          morphs[1] = dom.createMorphAt(dom.childAt(element1, [1]), 0, 0);
          morphs[2] = dom.createElementMorph(element2);
          morphs[3] = dom.createMorphAt(dom.childAt(element2, [1]), 0, 0);
          return morphs;
        },
        statements: [["element", "action", ["goBack"], [], ["loc", [null, [31, 52], [31, 71]]]], ["content", "goBackText", ["loc", [null, [32, 11], [32, 25]]]], ["element", "action", ["submitPassword"], [], ["loc", [null, [36, 51], [36, 78]]]], ["content", "continueText", ["loc", [null, [37, 11], [37, 27]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type", "multiple-nodes"]
        },
        "revision": "Ember@2.4.6",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 42,
            "column": 6
          }
        },
        "moduleName": "password-gui-2016/templates/components/change-password.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "relative-container");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-title");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("New Password");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-body");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "label");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Enter a new password");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3, "class", "password-errors");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "label");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Re-enter your new password");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element4 = dom.childAt(fragment, [2]);
        var element5 = dom.childAt(element4, [3]);
        var element6 = dom.childAt(element5, [1, 0]);
        var element7 = dom.childAt(element5, [7, 0]);
        var morphs = new Array(7);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createAttrMorph(element6, 'class');
        morphs[2] = dom.createMorphAt(element5, 3, 3);
        morphs[3] = dom.createMorphAt(dom.childAt(element5, [5]), 1, 1);
        morphs[4] = dom.createAttrMorph(element7, 'class');
        morphs[5] = dom.createMorphAt(element5, 9, 9);
        morphs[6] = dom.createMorphAt(element4, 5, 5);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["content", "yield", ["loc", [null, [1, 0], [1, 9]]]], ["attribute", "class", ["get", "inputFieldClass", ["loc", [null, [9, 35], [9, 50]]]]], ["inline", "input", [], ["class", ["subexpr", "@mut", [["get", "inputFieldClass", ["loc", [null, [10, 16], [10, 31]]]]], [], []], "type", "password", "value", ["subexpr", "@mut", [["get", "newPassword", ["loc", [null, [10, 54], [10, 65]]]]], [], []], "key-up", "updateNewPassword", "placeholder", "New password..."], ["loc", [null, [10, 2], [10, 125]]]], ["block", "if", [["get", "hasError", ["loc", [null, [13, 9], [13, 17]]]]], [], 0, 1, ["loc", [null, [13, 3], [21, 10]]]], ["attribute", "class", ["get", "inputFieldClass", ["loc", [null, [24, 35], [24, 50]]]]], ["inline", "input", [], ["class", ["subexpr", "@mut", [["get", "inputFieldClass", ["loc", [null, [25, 16], [25, 31]]]]], [], []], "type", "password", "value", ["subexpr", "@mut", [["get", "verifyPassword", ["loc", [null, [25, 54], [25, 68]]]]], [], []], "key-up", "updateVerifyPassword", "placeholder", "Verify password..."], ["loc", [null, [25, 2], [25, 134]]]], ["block", "if", [["get", "showButtons", ["loc", [null, [28, 7], [28, 18]]]]], [], 2, null, ["loc", [null, [28, 1], [41, 8]]]]],
      locals: [],
      templates: [child0, child1, child2]
    };
  })());
});
define("password-gui-2016/templates/components/password-finished", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.4.6",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "password-gui-2016/templates/components/password-finished.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["content", "yield", ["loc", [null, [1, 0], [1, 9]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("password-gui-2016/templates/components/question-set", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 8,
              "column": 1
            },
            "end": {
              "line": 12,
              "column": 1
            }
          },
          "moduleName": "password-gui-2016/templates/components/question-set.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("		");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n		");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element2 = dom.childAt(fragment, [1]);
          var morphs = new Array(3);
          morphs[0] = dom.createAttrMorph(element2, 'class');
          morphs[1] = dom.createElementMorph(element2);
          morphs[2] = dom.createMorphAt(dom.childAt(element2, [1]), 0, 0);
          return morphs;
        },
        statements: [["attribute", "class", ["get", "answer.class", ["loc", [null, [9, 15], [9, 27]]]]], ["element", "action", ["selectAnswer", ["get", "answer", ["loc", [null, [9, 54], [9, 60]]]]], [], ["loc", [null, [9, 30], [9, 62]]]], ["content", "answer.title", ["loc", [null, [10, 9], [10, 25]]]]],
        locals: ["answer"],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 12,
              "column": 1
            },
            "end": {
              "line": 15,
              "column": 1
            }
          },
          "moduleName": "password-gui-2016/templates/components/question-set.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("		");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "label");
          var el2 = dom.createTextNode("Enter the last four of your SSN...");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n		");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 3, 3, contextualElement);
          return morphs;
        },
        statements: [["inline", "input", [], ["class", "ssn", "key-up", "updateSSN", "placeholder", "1234"], ["loc", [null, [14, 2], [14, 63]]]]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 23,
              "column": 2
            },
            "end": {
              "line": 27,
              "column": 2
            }
          },
          "moduleName": "password-gui-2016/templates/components/question-set.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("			");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "modal-footer-button two last ease");
          var el2 = dom.createTextNode("\n				");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          var el3 = dom.createTextNode("Next");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element1);
          return morphs;
        },
        statements: [["element", "action", ["answer", ["get", "question.i", ["loc", [null, [24, 68], [24, 78]]]], ["get", "ssn", ["loc", [null, [24, 79], [24, 82]]]]], [], ["loc", [null, [24, 50], [24, 85]]]]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 27,
              "column": 2
            },
            "end": {
              "line": 31,
              "column": 2
            }
          },
          "moduleName": "password-gui-2016/templates/components/question-set.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("			");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "modal-footer-button two last ease");
          var el2 = dom.createTextNode("\n				");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          var el3 = dom.createTextNode("Next");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n			");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element0);
          return morphs;
        },
        statements: [["element", "action", ["answer", ["get", "question.i", ["loc", [null, [28, 68], [28, 78]]]], ["get", "answer", ["loc", [null, [28, 79], [28, 85]]]]], [], ["loc", [null, [28, 50], [28, 88]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type", "multiple-nodes"]
        },
        "revision": "Ember@2.4.6",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 33,
            "column": 6
          }
        },
        "moduleName": "password-gui-2016/templates/components/question-set.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "modal-title");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "modal-body");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "modal-footer");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-footer-buttons");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-footer-button two ease");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Back");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element3 = dom.childAt(fragment, [6, 1]);
        var element4 = dom.childAt(element3, [1]);
        var morphs = new Array(5);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createMorphAt(dom.childAt(fragment, [2, 1]), 0, 0);
        morphs[2] = dom.createMorphAt(dom.childAt(fragment, [4]), 1, 1);
        morphs[3] = dom.createElementMorph(element4);
        morphs[4] = dom.createMorphAt(element3, 3, 3);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["content", "yield", ["loc", [null, [1, 0], [1, 9]]]], ["content", "question.title", ["loc", [null, [4, 7], [4, 25]]]], ["block", "each", [["get", "question.answers", ["loc", [null, [8, 9], [8, 25]]]]], [], 0, 1, ["loc", [null, [8, 1], [15, 10]]]], ["element", "action", ["goBack"], [], ["loc", [null, [20, 44], [20, 64]]]], ["block", "if", [["get", "ssn", ["loc", [null, [23, 8], [23, 11]]]]], [], 2, 3, ["loc", [null, [23, 2], [31, 9]]]]],
      locals: [],
      templates: [child0, child1, child2, child3]
    };
  })());
});
define("password-gui-2016/templates/components/sign-in", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type", "multiple-nodes"]
        },
        "revision": "Ember@2.4.6",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 13,
            "column": 6
          }
        },
        "moduleName": "password-gui-2016/templates/components/sign-in.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "modal-title");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        var el3 = dom.createTextNode("Sign In");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "modal-body");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("a");
        var el3 = dom.createElement("img");
        dom.setAttribute(el3, "class", "signin");
        dom.setAttribute(el3, "src", "svg/User.svg");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2, "class", "forgot-text");
        var el3 = dom.createTextNode("Forgot?");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("br");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("a");
        dom.setAttribute(el2, "href", "/forgot");
        var el3 = dom.createElement("img");
        dom.setAttribute(el3, "class", "forgot");
        dom.setAttribute(el3, "src", "svg/Question.svg");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [4, 1]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createElementMorph(element0);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["content", "yield", ["loc", [null, [1, 0], [1, 9]]]], ["element", "action", ["redirectToCAS"], [], ["loc", [null, [8, 4], [8, 30]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("password-gui-2016/templates/forgot", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 23,
              "column": 0
            },
            "end": {
              "line": 35,
              "column": 0
            }
          },
          "moduleName": "password-gui-2016/templates/forgot.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("\n	");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "question-set", [], ["class", ["subexpr", "@mut", [["get", "question.class", ["loc", [null, [27, 8], [27, 22]]]]], [], []], "question", ["subexpr", "@mut", [["get", "question", ["loc", [null, [28, 11], [28, 19]]]]], [], []], "sendAnswer", "sendAnswer", "goBackToQuestion", "goBackToQuestion"], ["loc", [null, [25, 1], [33, 3]]]]],
        locals: ["question"],
        templates: []
      };
    })();
    var child1 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.4.6",
            "loc": {
              "source": null,
              "start": {
                "line": 56,
                "column": 4
              },
              "end": {
                "line": 58,
                "column": 4
              }
            },
            "moduleName": "password-gui-2016/templates/forgot.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("					");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1, "class", "answer");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
            return morphs;
          },
          statements: [["content", "answer.title", ["loc", [null, [57, 24], [57, 40]]]]],
          locals: ["answer"],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 48,
              "column": 2
            },
            "end": {
              "line": 64,
              "column": 2
            }
          },
          "moduleName": "password-gui-2016/templates/forgot.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("\n			");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("ul");
          dom.setAttribute(el1, "class", "verify-answers");
          var el2 = dom.createTextNode("\n\n				");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "question ease");
          var el3 = dom.createTextNode("\n					");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          dom.setAttribute(el3, "class", "question-title ease");
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n				");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n				");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          dom.setAttribute(el2, "class", "user-answer");
          var el3 = dom.createTextNode("You selected: ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n			");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1]);
          var morphs = new Array(4);
          morphs[0] = dom.createElementMorph(element1);
          morphs[1] = dom.createMorphAt(dom.childAt(element1, [1]), 0, 0);
          morphs[2] = dom.createMorphAt(element0, 3, 3);
          morphs[3] = dom.createMorphAt(dom.childAt(element0, [5]), 1, 1);
          return morphs;
        },
        statements: [["element", "action", ["goBackToQuestion", ["get", "question.i", ["loc", [null, [52, 60], [52, 70]]]], true], [], ["loc", [null, [52, 31], [52, 78]]]], ["content", "question.title", ["loc", [null, [53, 37], [53, 55]]]], ["block", "each", [["get", "question.answers", ["loc", [null, [56, 12], [56, 28]]]]], [], 0, null, ["loc", [null, [56, 4], [58, 13]]]], ["content", "question.answer.title", ["loc", [null, [60, 42], [60, 67]]]]],
        locals: ["question"],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type", "multiple-nodes"]
        },
        "revision": "Ember@2.4.6",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 104,
            "column": 2
          }
        },
        "moduleName": "password-gui-2016/templates/forgot.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-title");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("Forgot Password");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-body");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "username label");
        var el4 = dom.createTextNode("Enter your username...");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-footer");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-footer-buttons");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer-button one ease");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("Continue");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-title");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("Verify Answers");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-body scroll");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("Please take a moment to verify your answers before continuing.");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-footer");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-footer-buttons");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer-button two ease");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("Back");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer-button two last ease");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("Continue");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-title");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("Incorrect Answers");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-body");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3, "class", "incorrect-answers red");
        var el4 = dom.createTextNode("You have given incorrect answers to these security questions. Please click the \"restart\" button below and try again.");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-footer");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-footer-buttons");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer-button one red ease");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("Restart");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element2 = dom.childAt(fragment, [2]);
        var element3 = dom.childAt(element2, [5, 1, 1]);
        var element4 = dom.childAt(fragment, [6]);
        var element5 = dom.childAt(element4, [5, 1]);
        var element6 = dom.childAt(element5, [1]);
        var element7 = dom.childAt(element5, [3]);
        var element8 = dom.childAt(fragment, [8]);
        var element9 = dom.childAt(element8, [5, 1, 1]);
        var morphs = new Array(12);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createAttrMorph(element2, 'class');
        morphs[2] = dom.createMorphAt(dom.childAt(element2, [3]), 3, 3);
        morphs[3] = dom.createElementMorph(element3);
        morphs[4] = dom.createMorphAt(fragment, 4, 4, contextualElement);
        morphs[5] = dom.createAttrMorph(element4, 'class');
        morphs[6] = dom.createMorphAt(dom.childAt(element4, [3]), 5, 5);
        morphs[7] = dom.createElementMorph(element6);
        morphs[8] = dom.createElementMorph(element7);
        morphs[9] = dom.createAttrMorph(element8, 'class');
        morphs[10] = dom.createElementMorph(element9);
        morphs[11] = dom.createMorphAt(fragment, 10, 10, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["content", "outlet", ["loc", [null, [1, 0], [1, 10]]]], ["attribute", "class", ["get", "usernameClass", ["loc", [null, [3, 13], [3, 26]]]]], ["inline", "input", [], ["type", "text", "class", "username", "placeholder", "ex. 'John Smith' = 'smithj'", "value", ["subexpr", "@mut", [["get", "username", ["loc", [null, [10, 88], [10, 96]]]]], [], []], "key-up", "updateUsername"], ["loc", [null, [10, 2], [10, 123]]]], ["element", "action", ["getUserInformation"], [], ["loc", [null, [15, 45], [15, 76]]]], ["block", "each", [["get", "questions", ["loc", [null, [23, 8], [23, 17]]]]], [], 0, null, ["loc", [null, [23, 0], [35, 9]]]], ["attribute", "class", ["get", "verifyAnswersClass", ["loc", [null, [37, 13], [37, 31]]]]], ["block", "each", [["get", "questions", ["loc", [null, [48, 10], [48, 19]]]]], [], 1, null, ["loc", [null, [48, 2], [64, 11]]]], ["element", "action", ["goBackToQuestion", 2, true], [], ["loc", [null, [69, 45], [69, 81]]]], ["element", "action", ["submitAnswers"], [], ["loc", [null, [72, 50], [72, 76]]]], ["attribute", "class", ["get", "badAnswersClass", ["loc", [null, [80, 13], [80, 28]]]]], ["element", "action", ["restart"], [], ["loc", [null, [91, 49], [91, 69]]]], ["inline", "change-password", [], ["class", ["subexpr", "@mut", [["get", "changePasswordClass", ["loc", [null, [100, 7], [100, 26]]]]], [], []], "done", "done", "cancel", "cancelPasswordChange"], ["loc", [null, [98, 0], [104, 2]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("password-gui-2016/templates/teacher", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 12,
              "column": 3
            },
            "end": {
              "line": 18,
              "column": 3
            }
          },
          "moduleName": "password-gui-2016/templates/teacher.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("\n				");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n					");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n				");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element4 = dom.childAt(fragment, [1]);
          var morphs = new Array(3);
          morphs[0] = dom.createAttrMorph(element4, 'class');
          morphs[1] = dom.createElementMorph(element4);
          morphs[2] = dom.createMorphAt(dom.childAt(element4, [1]), 0, 0);
          return morphs;
        },
        statements: [["attribute", "class", ["get", "class.cssClass", ["loc", [null, [14, 17], [14, 31]]]]], ["element", "action", ["selectClass", ["get", "class", ["loc", [null, [14, 57], [14, 62]]]]], [], ["loc", [null, [14, 34], [14, 64]]]], ["content", "class.expression", ["loc", [null, [15, 11], [15, 31]]]]],
        locals: ["class"],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 30,
              "column": 3
            },
            "end": {
              "line": 37,
              "column": 3
            }
          },
          "moduleName": "password-gui-2016/templates/teacher.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("				");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n\n					");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "name");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(" ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n					");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "number");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n				");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element2 = dom.childAt(fragment, [1]);
          var element3 = dom.childAt(element2, [1]);
          var morphs = new Array(5);
          morphs[0] = dom.createAttrMorph(element2, 'class');
          morphs[1] = dom.createElementMorph(element2);
          morphs[2] = dom.createMorphAt(element3, 0, 0);
          morphs[3] = dom.createMorphAt(element3, 2, 2);
          morphs[4] = dom.createMorphAt(dom.childAt(element2, [3]), 0, 0);
          return morphs;
        },
        statements: [["attribute", "class", ["get", "stu.cssClass", ["loc", [null, [31, 17], [31, 29]]]]], ["element", "action", ["selectStudent", ["get", "stu", ["loc", [null, [31, 57], [31, 60]]]]], [], ["loc", [null, [31, 32], [31, 62]]]], ["content", "stu.info.firstName", ["loc", [null, [33, 24], [33, 46]]]], ["content", "stu.info.lastName", ["loc", [null, [33, 47], [33, 68]]]], ["content", "stu.id", ["loc", [null, [34, 26], [34, 36]]]]],
        locals: ["stu"],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 157,
              "column": 2
            },
            "end": {
              "line": 159,
              "column": 2
            }
          },
          "moduleName": "password-gui-2016/templates/teacher.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("			");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "red");
          var el2 = dom.createTextNode("Your passwords must match.");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 167,
              "column": 2
            },
            "end": {
              "line": 169,
              "column": 2
            }
          },
          "moduleName": "password-gui-2016/templates/teacher.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("			");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "green");
          var el2 = dom.createTextNode("You're good to go, click \"continue\" for the next steps.");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child4 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 200,
              "column": 3
            },
            "end": {
              "line": 205,
              "column": 3
            }
          },
          "moduleName": "password-gui-2016/templates/teacher.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("				");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n					");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "name");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(" ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n					");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "number");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n				");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1]);
          var morphs = new Array(4);
          morphs[0] = dom.createAttrMorph(element0, 'class');
          morphs[1] = dom.createMorphAt(element1, 0, 0);
          morphs[2] = dom.createMorphAt(element1, 2, 2);
          morphs[3] = dom.createMorphAt(dom.childAt(element0, [3]), 0, 0);
          return morphs;
        },
        statements: [["attribute", "class", ["concat", ["student ", ["get", "stud.status", ["loc", [null, [201, 26], [201, 37]]]]]]], ["content", "stud.info.firstName", ["loc", [null, [202, 24], [202, 47]]]], ["content", "stud.info.lastName", ["loc", [null, [202, 48], [202, 70]]]], ["content", "stud.id", ["loc", [null, [203, 26], [203, 37]]]]],
        locals: ["stud"],
        templates: []
      };
    })();
    var child5 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.4.6",
            "loc": {
              "source": null,
              "start": {
                "line": 209,
                "column": 3
              },
              "end": {
                "line": 211,
                "column": 3
              }
            },
            "moduleName": "password-gui-2016/templates/teacher.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("				");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            dom.setAttribute(el1, "class", "push-top");
            var el2 = dom.createElement("b");
            var el3 = dom.createTextNode("Done!");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.4.6",
            "loc": {
              "source": null,
              "start": {
                "line": 211,
                "column": 3
              },
              "end": {
                "line": 214,
                "column": 3
              }
            },
            "moduleName": "password-gui-2016/templates/teacher.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("				");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1, "class", "loader push-top");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n				");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            var el2 = dom.createTextNode("Changed ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("b");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("%");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" of students' password.");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [3, 1]), 0, 0);
            return morphs;
          },
          statements: [["content", "loadingPercentage", ["loc", [null, [213, 21], [213, 42]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 208,
              "column": 2
            },
            "end": {
              "line": 215,
              "column": 2
            }
          },
          "moduleName": "password-gui-2016/templates/teacher.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["get", "doneLoading", ["loc", [null, [209, 9], [209, 20]]]]], [], 0, 1, ["loc", [null, [209, 3], [214, 10]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type", "multiple-nodes"]
        },
        "revision": "Ember@2.4.6",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 228,
            "column": 6
          }
        },
        "moduleName": "password-gui-2016/templates/teacher.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-title");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("Specify Student(s)");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-body");
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3, "class", "push-top push-bottom");
        var el4 = dom.createTextNode("Select class(es)");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "buttons push-bottom");
        var el4 = dom.createTextNode("\n\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3, "class", "push-bottom");
        var el4 = dom.createTextNode("Selected ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(" of ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "students");
        var el4 = dom.createTextNode("\n\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-footer");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-footer-buttons");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer-button two first red ease");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("Cancel");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer-button two last ease");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("Next");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-title");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("Specify a Password");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-body");
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3, "class", "push-top push-bottom");
        var el4 = dom.createTextNode("Customize a new scheme, or ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        var el5 = dom.createTextNode("use the district standard");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(".");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3, "class", "push-bottom");
        var el4 = dom.createTextNode("Any scheme can be used.");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "scheme");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("select");
        dom.setAttribute(el4, "class", "options first");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("First Name");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Middle Name");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        dom.setAttribute(el5, "selected", "");
        var el6 = dom.createTextNode("Last Name");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Birth Day");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Birth Month");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Birth Year");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Phone Number");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Address");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("select");
        dom.setAttribute(el4, "class", "options second");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("...");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("First Name");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Middle Name");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Last Name");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Birth Day");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Birth Month");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Birth Year");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Phone Number");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Address");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("select");
        dom.setAttribute(el4, "class", "options third");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("First Name");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Middle Name");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Last Name");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Birth Day");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        dom.setAttribute(el5, "selected", "");
        var el6 = dom.createTextNode("Birth Month");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Birth Year");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Phone Number");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Address");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("select");
        dom.setAttribute(el4, "class", "options fourth");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("...");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("First Name");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Middle Name");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Last Name");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        dom.setAttribute(el5, "selected", "");
        var el6 = dom.createTextNode("Birth Day");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Birth Month");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Birth Year");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Phone Number");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Address");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "scheme last");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("select");
        dom.setAttribute(el4, "class", "extra-options first");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("aa");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Aa");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("aA");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("AA");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("select");
        dom.setAttribute(el4, "class", "extra-options second");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("aa");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Aa");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("aA");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("AA");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("select");
        dom.setAttribute(el4, "class", "extra-options third");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("aa");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Aa");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("aA");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("AA");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("select");
        dom.setAttribute(el4, "class", "extra-options fourth");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("aa");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("Aa");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("aA");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("option");
        var el6 = dom.createTextNode("AA");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("Preview your scheme:");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "example-user");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createElement("b");
        var el6 = dom.createTextNode("Name:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" John Doe  Smith");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("br");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createElement("b");
        var el6 = dom.createTextNode("Born:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" January 1st, 2000");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("br");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createElement("b");
        var el6 = dom.createTextNode("Phone:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" (555) 555-1234");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("br");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createElement("b");
        var el6 = dom.createTextNode("Address:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" 54321 John St Example, WA 98765");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "password-preview push-top push-bottom vertical-center-margin");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("hr");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3, "class", "push-top push-bottom");
        var el4 = dom.createTextNode("Alternatively, you can write a new password:");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3, "class", "push-top push-bottom");
        var el4 = dom.createTextNode("\n			If you're using a custom scheme, leave both password fields blank.\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-footer");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-footer-buttons");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer-button two first ease");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("Back");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer-button two last ease");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("Continue");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-title");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("Verify Request");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-body");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createElement("b");
        var el5 = dom.createTextNode("When you click submit below, your changes ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("i");
        var el6 = dom.createTextNode("will");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" be applied.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("hr");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3, "class", "push-top push-bottom");
        var el4 = dom.createElement("b");
        var el5 = dom.createTextNode("These users will be affected:");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "students confirm-students");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-footer");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-footer-buttons");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer-button two first ease");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("Back");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer-button two last ease");
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("Submit");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element5 = dom.childAt(fragment, [2]);
        var element6 = dom.childAt(element5, [3]);
        var element7 = dom.childAt(element6, [9]);
        var element8 = dom.childAt(element5, [5, 1]);
        var element9 = dom.childAt(element8, [1]);
        var element10 = dom.childAt(element8, [3]);
        var element11 = dom.childAt(fragment, [4]);
        var element12 = dom.childAt(element11, [3]);
        var element13 = dom.childAt(element12, [1, 1]);
        var element14 = dom.childAt(element12, [5]);
        var element15 = dom.childAt(element14, [1]);
        var element16 = dom.childAt(element14, [3]);
        var element17 = dom.childAt(element14, [5]);
        var element18 = dom.childAt(element14, [7]);
        var element19 = dom.childAt(element12, [7]);
        var element20 = dom.childAt(element19, [1]);
        var element21 = dom.childAt(element19, [3]);
        var element22 = dom.childAt(element19, [5]);
        var element23 = dom.childAt(element19, [7]);
        var element24 = dom.childAt(element11, [5, 1]);
        var element25 = dom.childAt(element24, [1]);
        var element26 = dom.childAt(element24, [3]);
        var element27 = dom.childAt(fragment, [6]);
        var element28 = dom.childAt(element27, [3]);
        var element29 = dom.childAt(element27, [5, 1]);
        var element30 = dom.childAt(element29, [1]);
        var element31 = dom.childAt(element29, [3]);
        var morphs = new Array(31);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createAttrMorph(element5, 'class');
        morphs[2] = dom.createMorphAt(dom.childAt(element6, [3]), 1, 1);
        morphs[3] = dom.createMorphAt(element6, 7, 7);
        morphs[4] = dom.createMorphAt(element7, 1, 1);
        morphs[5] = dom.createMorphAt(element7, 3, 3);
        morphs[6] = dom.createMorphAt(dom.childAt(element6, [11]), 1, 1);
        morphs[7] = dom.createElementMorph(element9);
        morphs[8] = dom.createElementMorph(element10);
        morphs[9] = dom.createAttrMorph(element11, 'class');
        morphs[10] = dom.createElementMorph(element13);
        morphs[11] = dom.createAttrMorph(element15, 'onchange');
        morphs[12] = dom.createAttrMorph(element16, 'onchange');
        morphs[13] = dom.createAttrMorph(element17, 'onchange');
        morphs[14] = dom.createAttrMorph(element18, 'onchange');
        morphs[15] = dom.createAttrMorph(element20, 'onchange');
        morphs[16] = dom.createAttrMorph(element21, 'onchange');
        morphs[17] = dom.createAttrMorph(element22, 'onchange');
        morphs[18] = dom.createAttrMorph(element23, 'onchange');
        morphs[19] = dom.createMorphAt(dom.childAt(element12, [13, 1]), 0, 0);
        morphs[20] = dom.createMorphAt(element12, 19, 19);
        morphs[21] = dom.createMorphAt(element12, 21, 21);
        morphs[22] = dom.createMorphAt(element12, 23, 23);
        morphs[23] = dom.createMorphAt(element12, 27, 27);
        morphs[24] = dom.createElementMorph(element25);
        morphs[25] = dom.createElementMorph(element26);
        morphs[26] = dom.createAttrMorph(element27, 'class');
        morphs[27] = dom.createMorphAt(dom.childAt(element28, [7]), 1, 1);
        morphs[28] = dom.createMorphAt(element28, 9, 9);
        morphs[29] = dom.createElementMorph(element30);
        morphs[30] = dom.createElementMorph(element31);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["content", "outlet", ["loc", [null, [1, 0], [1, 10]]]], ["attribute", "class", ["get", "specifyStudentsClass", ["loc", [null, [2, 13], [2, 33]]]]], ["block", "each", [["get", "classes", ["loc", [null, [12, 11], [12, 18]]]]], [], 0, null, ["loc", [null, [12, 3], [18, 12]]]], ["inline", "input", [], ["class", "student-search vertical-center-margin", "type", "text", "value", ["subexpr", "@mut", [["get", "studentSearch", ["loc", [null, [24, 74], [24, 87]]]]], [], []], "key-up", "updateStudentSearch", "placeholder", "Search: ex. 'John Smith', '2009432', ..."], ["loc", [null, [24, 2], [24, 174]]]], ["content", "amountOfSelectedStudents", ["loc", [null, [26, 37], [26, 65]]]], ["content", "amountOfStudents", ["loc", [null, [26, 69], [26, 89]]]], ["block", "each", [["get", "students", ["loc", [null, [30, 11], [30, 19]]]]], [], 1, null, ["loc", [null, [30, 3], [37, 12]]]], ["element", "action", ["cancel"], [], ["loc", [null, [44, 55], [44, 74]]]], ["element", "action", ["toPasswordSchemeStep"], [], ["loc", [null, [47, 50], [47, 83]]]], ["attribute", "class", ["get", "passwordSchemeClass", ["loc", [null, [54, 13], [54, 32]]]]], ["element", "action", ["districtStandard"], [], ["loc", [null, [61, 67], [61, 96]]]], ["attribute", "onchange", ["subexpr", "action", ["firstFirstHalf"], [], ["loc", [null, [66, 42], [66, 69]]]]], ["attribute", "onchange", ["subexpr", "action", ["secondFirstHalf"], [], ["loc", [null, [76, 43], [76, 71]]]]], ["attribute", "onchange", ["subexpr", "action", ["firstSecondHalf"], [], ["loc", [null, [87, 42], [87, 70]]]]], ["attribute", "onchange", ["subexpr", "action", ["secondSecondHalf"], [], ["loc", [null, [97, 43], [97, 72]]]]], ["attribute", "onchange", ["subexpr", "action", ["firstFirstHalfOptions"], [], ["loc", [null, [111, 48], [111, 82]]]]], ["attribute", "onchange", ["subexpr", "action", ["secondFirstHalfOptions"], [], ["loc", [null, [117, 49], [117, 84]]]]], ["attribute", "onchange", ["subexpr", "action", ["firstSecondHalfOptions"], [], ["loc", [null, [123, 48], [123, 83]]]]], ["attribute", "onchange", ["subexpr", "action", ["secondSecondHalfOptions"], [], ["loc", [null, [129, 49], [129, 85]]]]], ["content", "passwordPreview", ["loc", [null, [150, 9], [150, 28]]]], ["block", "if", [["get", "dontMatch", ["loc", [null, [157, 8], [157, 17]]]]], [], 2, null, ["loc", [null, [157, 2], [159, 9]]]], ["inline", "input", [], ["class", "student-search", "type", "password", "value", ["subexpr", "@mut", [["get", "newPassword", ["loc", [null, [161, 55], [161, 66]]]]], [], []], "key-up", "updateNewPassword", "placeholder", "Type a new password here..."], ["loc", [null, [161, 2], [161, 138]]]], ["inline", "input", [], ["class", "student-search left-space-fix", "type", "password", "value", ["subexpr", "@mut", [["get", "verifyPassword", ["loc", [null, [163, 70], [163, 84]]]]], [], []], "key-up", "updateVerifyPassword", "placeholder", "Verify the new password...."], ["loc", [null, [163, 2], [163, 159]]]], ["block", "if", [["get", "canContinue", ["loc", [null, [167, 8], [167, 19]]]]], [], 3, null, ["loc", [null, [167, 2], [169, 9]]]], ["element", "action", ["toSpecifyUsersStep"], [], ["loc", [null, [178, 51], [178, 82]]]], ["element", "action", ["toVerifyRequestStep"], [], ["loc", [null, [181, 50], [181, 82]]]], ["attribute", "class", ["get", "verifyRequestClass", ["loc", [null, [188, 13], [188, 31]]]]], ["block", "each", [["get", "selectedStudents", ["loc", [null, [200, 11], [200, 27]]]]], [], 4, null, ["loc", [null, [200, 3], [205, 12]]]], ["block", "if", [["get", "loadingPercentage", ["loc", [null, [208, 8], [208, 25]]]]], [], 5, null, ["loc", [null, [208, 2], [215, 9]]]], ["element", "action", ["goBackToPasswordStep"], [], ["loc", [null, [220, 51], [220, 84]]]], ["element", "action", ["submitPassword"], [], ["loc", [null, [223, 50], [223, 77]]]]],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5]
    };
  })());
});
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('password-gui-2016/config/environment', ['ember'], function(Ember) {
  var prefix = 'password-gui-2016';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("password-gui-2016/app")["default"].create({"name":"password-gui-2016","version":"0.0.0+6149dc69"});
}

/* jshint ignore:end */
//# sourceMappingURL=password-gui-2016.map