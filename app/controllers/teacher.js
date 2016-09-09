/* globals $ */
import Ember from 'ember';
import ENV from '../config/environment';

export default Ember.Controller.extend({
	navbarColorStyle: "border-top: 10px solid " + ENV["Visual"].color_dark + ";",

	modalStyle: "background-color: "+ ENV["Visual"].color_light +";",
	modalTitleStyle: "border-bottom: 5px solid " + ENV["Visual"].color_medium + ";",
	logoStyle: "background-image: url("+ ENV["Visual"].district_img +");",

	districtWebsite: ENV["district_website"],

	specifyStudentsClass: "modal show blur ease",
	activityClass: "activity show ease",
	loaderClass: "small-loader ease",
	passwordSchemeClass: "modal hide ease",
	verifyRequestClass: "modal hide ease",

	activityText: "Hang on a second, getting your data.",

	teacher: {
		"username": ""
	},

	studentSearch: "",

	selectedStudents: [],

	amountOfSelectedStudents: 0,

	students: [],
	amountOfStudents: Ember.computed.alias('students.length'),

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
		cancel() {
			if (confirm("If you leave this page, you will be logged out.")) {
				$.ajax({
					'url': 'session',
					'type': 'DELETE'
				}).done(function() {
					window.location.href = ENV["district_website"];
				});
			}
		},

		toSpecifyUsersStep() {
			this.set('passwordSchemeClass', 'modal hide-back ease');
			this.set('specifyStudentsClass', 'modal show-back ease');
		},

		toPasswordSchemeStep() {
			if (this.get('selectedStudents').length === 0) {
				return alert("You must select at least one student.");
			} 
			
			this.set('specifyStudentsClass', 'modal hide ease');
			this.set('passwordSchemeClass', 'modal show ease');
		},

		toVerifyRequestStep() {
			this.send('parsePasswordPreview');

			if (this.get('newPassword').length > 0) {
				if (this.get('dontMatch') === true) {
					return alert("Your passwords must match, try re-writing them. If you are using a custom scheme, erase both password fields.");
				}
			}

			this.set('passwordSchemeClass', 'modal hide ease');
			this.set('verifyRequestClass', 'modal show ease');
		},

		goBackToPasswordStep() {
			if (this.get('canDeleteStudents') === true) {
				var _this = this;
				this.get('selectedStudents').forEach(function(student) {
					_this.send('selectStudent', student);
				})

				this.set('canDeleteStudents', false);
			}

			this.set('passwordSchemeClass', 'modal show-back ease');
			this.set('verifyRequestClass', 'modal hide-back ease');
			this.set('doneLoading', false);
			this.set('loadingPercentage', '');
		},

		updateStudentSearch(str) {
			this.set('studentSearch', str);

			if (str === "") {
				this.get('students').forEach(function(s) {
					Ember.set(s, 'cssClass', 'student');
				});

				return;
			}

			str = str.toLowerCase();
			var indexOfStudent;

			for (var i = 0; i < this.get('students').length; i++) {
				var student = this.get('students')[i];

				if (student.info.firstName.toLowerCase().indexOf(str) > -1 ||
					student.info.lastName.toLowerCase().indexOf(str) > -1 ||
					student.id.toString().indexOf(str) > -1) {

					indexOfStudent = i;
					break;
				}
			}

			this.get('students').forEach(function(s, i) {
				if (i === indexOfStudent) {
					$('.students').scrollTop(indexOfStudent * 50);
					Ember.set(s, 'cssClass', 'student search-highlight');
				} else {
					Ember.set(s, 'cssClass', 'student');
				}
			});
		},

		selectClass(c) {
			var active = true;

			if (c.cssClass && c.cssClass.indexOf('highlight') > -1) {
				Ember.set(c, 'cssClass', "button");
				active = false;
			} else {
				Ember.set(c, 'cssClass', "button highlight");
			}
			
			for (var i = 0; i < c.students.length; i++) {
				this.send('selectStudent', c.students[i], active);
			}
		},

		selectAll() {
			var studentIsActive = false;
			var studentIsNotActive = false;

			var students = this.get('students');
			var _this = this;

			students.forEach(function(item) {
				if (item.cssClass === "student highlight") {
					studentIsActive = true;
				} else {
					studentIsNotActive = true;
				}
			});

			if (studentIsActive && !studentIsNotActive) {
				//if all are active, should deselect all
				students.forEach(function(item) {
					_this.send('selectStudent', item, false)
				})
			} else {
				//Fallback to what the text says
				students.forEach(function(item) {
					_this.send('selectStudent', item, true)
				})
			}
		},

		selectStudent(s, classIsActive) {
			if (this.get('selectedStudents').indexOf(s) > -1) {
				if (!classIsActive) {
					Ember.set(s, 'cssClass', "student");
					this.get('selectedStudents').removeObject(s);
					this.set('amountOfSelectedStudents', this.get('amountOfSelectedStudents') - 1);
				}
			} else {
				if (classIsActive === undefined || classIsActive) {
					if (s) {
						Ember.set(s, 'cssClass', "student highlight");
						this.get('selectedStudents').addObject(s);
						this.set('amountOfSelectedStudents', this.get('amountOfSelectedStudents') + 1);
					}
				}
			}
		},

		getTeacherData() {
			var _this = this;

			$.ajax({
				'url': 'teacher/classes'
			}).done(function(body) {
				if (body.sections) {
					body.sections.sort(function(a, b) {
						return parseInt(a.expression) > parseInt(b.expression);
					});

					var students = [];
					var tempIds = [];

					for (var i = 0; i < body.sections.length; i++) {
						if (body.sections[i].courseName.toLowerCase().indexOf("kindergarten") !== -1) {
							_this.set('kindergarten', true);
						}

						body.sections[i].cssClass = 'button';
						
						for (var k = 0; k < body.sections[i].students.length; k++) {
							body.sections[i].students[k].cssClass = "student";

							if (tempIds.indexOf(body.sections[i].students[k].id) === -1) {
								students.push(body.sections[i].students[k]);
								tempIds.push(body.sections[i].students[k].id);
							} else {
								//This user is already there, get rid of it
								body.sections[i].students[k] = null;

							}
						}
					}

					students.sort(function(a, b) {
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
					_this.set('specifyStudentsClass', "modal show ease");
					_this.set('activityClass', "activity hide ease");
					_this.set('activityText', "Done.");
				}
			});
		},

		firstFirstHalf(e) {
			var code = e.target.value.replace(" ", "").replace(/[a-z]/g, "").toLowerCase();

			if (code === 'a') {
				code = "aa";
			}

			this.set('passwordScheme', code + this.get('passwordScheme').substring(2));
			this.send('parsePasswordPreview');
		},

		secondFirstHalf(e) {
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

		firstSecondHalf(e) {
			var code = e.target.value.replace(" ", "").replace(/[a-z]/g, "").toLowerCase();
			if (code === 'a') { 
				code = "aa";
			}

			this.set('passwordScheme', this.get('passwordScheme').substring(0, 4) + code + this.get('passwordScheme').substring(6));
			this.send('parsePasswordPreview');
		},

		secondSecondHalf(e) {
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

		firstFirstHalfOptions(e) {
			var code = e.target.value;
			console.log("code", code);
			this.send('applyNewSchemeOptions', 0, code);
		},

		secondFirstHalfOptions(e) {
			var code = e.target.value;
			console.log("code", code);
			this.send('applyNewSchemeOptions', 2, code);
		},

		firstSecondHalfOptions(e) {
			var code = e.target.value;
			console.log("code", code);
			this.send('applyNewSchemeOptions', 4, code);
		},

		secondSecondHalfOptions(e) {
			var code = e.target.value;
			console.log("code", code);
			this.send('applyNewSchemeOptions', 6, code);
		},

		applyNewSchemeOptions(step, code) {
			var state = this.get('passwordSchemeState');

			function replaceAtIndex(firstIndex, secondIndex, originalString, replaceWith) {
				return originalString.substring(0, firstIndex) + replaceWith + originalString.substring(secondIndex);
			}

			this.set('passwordSchemeState', replaceAtIndex(step, step + 2, state, code));
			this.send('parsePasswordPreview');

			return this.get('passwordScheme');
		},

		parsePasswordPreview() {
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
						explanation[step / 2] = (step !== 6) ? " the two digits of the student's birth day" : " and lastly, the two digits of the student's birth day.";
						break;
					case 'bm':
						result += exampleUser.birthdate.substring().toLowerCase().substring(5, 7);
						explanation[step / 2] = (step !== 6) ? " the two digits of the student's birth month" : " and lastly, the two digits of the student's birth month.";
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
							explanation[step / 2] = (step !== 6) ? " the last four digits of the student's home phone number" : " and lastly the last four digits of the student's home phone number.";
						} else {
							result += exampleUser.homePhone.substring(8, 10);
							explanation[step / 2] = (step !== 6) ? " the first two of the last four digits of the student's home phone number" : " and lastly, the first two of the last four digits of the student's home phone number.";
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

		processPasswordScheme() {
			var usernames = [];

			this.get('selectedStudents').forEach(function(item) {
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
			}).done(function(body) {
				console.log(body);
			});
		},

		districtStandard() {
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

		updateNewPassword(str) {
			this.set('newPassword', str);
			this.send('checkPasswords');
		},

		updateVerifyPassword(str) {
			this.set('verifyPassword', str);
			this.send('checkPasswords');
		},

		checkPasswords() {
			this.send('resetStudentStatus');

			if (this.get('newPassword') !== this.get('verifyPassword')) {
				this.set('dontMatch', true);
				this.set('canContinue', false);
			} else {
				this.set('dontMatch', false);
				this.set('canContinue', true);
			}
		},

		submitPassword() {
			if (this.get('doneLoading') === false) return alert("Please wait until your current request is done.");

			var _this = this;
			this.set('loadingPercentage', "0");
			this.set('doneLoading', false);
			var amountOfStudents = this.get('selectedStudents').length;
			var completedStudents = 0;

			async.eachSeries(this.get('selectedStudents'), function(selectedStudent, callback) {
				Ember.set(selectedStudent, 'status', '');
				var student = selectedStudent.info.username;

				if (typeof student !== 'string') return;

				if (_this.get('newPassword').length > 0) {
					
					if (_this.get('canContinue') && _this.get('dontMatch') === false) {
						console.log("Submitting request")
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
						}).done(function(body) {
							if (body.success) {
								Ember.set(selectedStudent, 'status', 'success');
							} else {
								Ember.set(selectedStudent, 'status', 'failure');
							}

							completedStudents++;
							_this.set('loadingPercentage', "" + parseInt((completedStudents / amountOfStudents) * 100));

							callback();
						})
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
					}).done(function(body) {
						if (body.data.data.result.success) {
							Ember.set(selectedStudent, 'status', 'success');
						} else {
							Ember.set(selectedStudent, 'status', 'failure');
						}

						completedStudents++;
						_this.set('loadingPercentage', "" + parseInt((completedStudents / amountOfStudents) * 100));

						callback();
					})
				}
			}, function() {
				_this.set('doneLoading', true);

				setTimeout(function() {				
					alert("Your changes are complete. If some students in the list are red, go back and select only the ones that failed, and try again.");
					_this.set('canDeleteStudents', true);
				});
			});
		},

		resetStudentStatus() {
			this.get('students').forEach(function(student) {
				Ember.set(student, 'status', '');
			});
		}
	},

	init() {
		this._super();
		var _this = this;

		$.ajax({
			'url': 'teacher/session'
		}).done(function(body) {
			if (body.username) {
				Ember.set(_this.get('teacher'), 'username', body.username);

				//Let's find out if the user is an admin
				$.ajax({
					'url': 'admin'
				}).done(function(body) {
					if (body === "true") {
						var newuser = prompt("Enter a teacher's username.");
						if (newuser && newuser.length > 1) {
							$.ajax({
								'url': 'teacher/admin/session',
								'method': "POST",
								"headers": {
									"Content-Type": "application/json"
								},

								"data": JSON.stringify({
									"username": newuser
								})
							}).done(function() {
								_this.send('getTeacherData');
							});
						} else {
							_this.set('loaderClass', '');
							_this.set('activityText', "You need to specify a username. Refresh the page to try again.")
						}
					}
				})
			} else {
				//our login endpoint will know the user is trying to use the teacher tool
				window.location.href = ENV["cas_login"] + "?service=" + ENV["iForgotHost"] + "/login";
			}
		}).fail(function() {
			//handle error
		});
	}
});
