var request = require('request');

function getDate(str) {
    var birthday = str;
    var ending = "";
    
    var date = "";
	
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                
    var month = birthday.substring(0, 2);
    
    if (month.substring(0, 1) == "0") {
        month = month.substring(1, 2);
        var monthToArrayIndex = month - 1;
        
        month = months[monthToArrayIndex];
    } else if (month.substring(0, 1) == "1") {
		var monthToArrayIndex = month - 1;
        
        month = months[monthToArrayIndex];
	}
    
    var day = birthday.substring(3, 5);
    
    if (day.substring(0, 1) == "1") {
        ending = "th";
    } else if (day.substring(1, 2) == "1") {
        ending = "st";
    } else if (day.substring(1, 2) == "2") {
        ending = "nd";
    } else if (day.substring(1, 2) == "3") {
        ending = "rd";
    }
    
    if (day.substring(1, 2) == "0" || day.substring(1, 2) == "4" || day.substring(1, 2) == "5" || day.substring(1, 2) == "6" || day.substring(1, 2) == "7" || day.substring(1, 2) == "8" || day.substring(1, 2) == "9") {
        ending = "th";
    }
	
	if (day.substring(0, 1) == "0") {
		day = day.substring(1, 2);
	}
    
    date = month + " " + day + ending;
    
    return date;
};

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}; 

module.exports = function(http, config) {
	var token;
	var main = module.parent.exports;

	http.post('/forgot/answers', function(req, res) {
		try {
			var correctAnswers = [];

			for (var i in req.body.answers) {
				if (req.body.answers[i] == main.getUsers()[req.sessionID].private.answers[i]) {
					correctAnswers.push(true);
				}
			}

			if (correctAnswers.length == req.body.answers.length) {
				main.getUsers()[req.sessionID].hasAnsweredCorrectly = true;
				return res.status(200).json(true);
			} else {
				return res.status(403).json(false);
			}
		} catch (err) {
			return res.status(400).json({
				'err': "Bad request.",
				'info': err
			});
		}
	})

	http.post('/forgot/session', function(req, res) {
		if (req.body.username) {
			if (isEligibleForNewQuestions(req.sessionID)) {
				if (/[0-9]/g.test(req.body.username)) {
					//user is student
					grabStudentData(req.body.username, req, res);
				} else {
					grabStaffData(req.body.username, req, res);
				}
			}
		}
	});

	function isEligibleForNewQuestions(id) {
		var user = main.getUsers()[id];

		if (!user) return true;
		
		if (user.locked === true) return false;

		return true;
	}

	function grabStudentData(username, req, res) {
		username = username.toLowerCase();

		request({
			'url': config.URLs.EdDataAPI + 'students?stunum=' + username,
			'headers': {
				'Authorization': 'Bearer ' + token
			},
			'method': 'GET'
		}, function(err, resp, body) {
			body = JSON.parse(body);

			if (err) {
				return res.status(400).json({
					"err": err
				});
			}

			if (!body.student || !body.student[0]) {
				return res.status(400).json({
					"err": "EdData API did not return any information for user: " + username,
					"body": body
				});
			}
			
			var user = main.getUsers()[req.sessionID];

			main.setUser(req.sessionID, {
				'username': username,
				'state': 'forgot',
				'auth': false,
				'type': 'student',

				'hasAnsweredCorrectly': false,

				'questions': [
					{
						"title": "Who do you recognize?",
						"answers": []
					},
					{
						"title": "Which address is yours?",
						"answers": []
					},
					{
						"title": "Which is your home phone number?",
						"answers": []
					}
				],

				'private': {
					'nota': [
						Math.floor((Math.random() * 5) + 1),
						Math.floor((Math.random() * 5) + 1),
						Math.floor((Math.random() * 5) + 1),
					],

					'answers': [
						body.student[0].ec1,
						body.student[0].street,
						body.student[0].homePhone
					]
				}
			});

			grabRandomStudentAnswers(function() {
				determineAnswerPositions(req.sessionID);

				res.status(200).json(main.getSessionWithoutConfidentialData(req.sessionID));
			}, res, req.sessionID);
		})
	}

	function grabStaffData(username, req, res) {
		username = username.toLowerCase();

		request({
			'url': config.URLs.EdDataAPI + 'employees?uname=' + username,
			'headers': {
				'Authorization': 'Bearer ' + token
			},
			'method': 'GET'
		}, function(err, resp, body) {
			body = JSON.parse(body);

			if (err) {
				return res.status(400).json({
					"err": err
				});
			}

			if (!body.employee || !body.employee[0]) {
				return res.status(400).json({
					"err": "EdData API did not return any information for user: " + username,
					"body": body
				});
			}

			var user = main.getUsers()[req.sessionID];

			main.setUser(req.sessionID, {
				'username': username,
				'state': 'forgot',
				'auth': false,
				'type': 'staff',

				'questions': [
					{
						"title": "What is the last four of your SSN?",
						"answers": []
					},
					{
						"title": "Which address is yours?",
						"answers": []
					},
					{
						"title": "Which date is your birthday?",
						"answers": []
					}
				],

				'private': {
					'nota': [
						0,
						Math.floor((Math.random() * 5) + 1),
						Math.floor((Math.random() * 5) + 1),
					],

					'answers': [
						body.employee[0].psdSSN,
						body.employee[0].streetNumber + " " + body.employee[0].streetName,
						getDate(body.employee[0].birthdate.substring(5, 10))
					]
				}
			});

			grabRandomStaffAnswers(function() {
				determineAnswerPositions(req.sessionID);

				res.status(200).json(main.getSessionWithoutConfidentialData(req.sessionID));
			}, res, req.sessionID);
			
		});
	}

	function grabRandomStudentAnswers(callback, res, id) {
		if (token) {
			request({
				'url': config.URLs.EdDataAPI + 'students?limit=1',
				'headers': {
					'Authorization': 'Bearer ' + token
				},
				
				'method': 'GET'
			}, function(err, resp, body) {
				var obj = JSON.parse(body);
				var num;

				if (obj.meta) {
					num = obj.meta.total;
				} else {
					return res.status(500).json({
						'err': "Expected variable meta in response from the EdData API, but did not get one."
					});
				}

				var random = Math.floor(Math.random() * (num - 1)) + 1;
				if (random + 50 > num) random -= 50; //Make sure we always have random employees

				request({
					'uri': config.URLs.EdDataAPI + 'students?limit=50&offset=' + random,
					'method': 'GET',
					'headers': {
						'Authorization': 'Bearer ' + token
					}
				}, function(err, resp, data) {
					var body;

					try {
						body = JSON.parse(data);
					} catch (err) {
						return res.status(500).json({
							'err': "Improper response received from the EdData API."
						});
					}

					var fifty = [];
					
					for (var i = 0; i < 50; i++) fifty.push(i);

					var randomizedArray = shuffleArray(fifty);

					var randomStudent1 = parseInt(randomizedArray[0]);
					var randomStudent2 = parseInt(randomizedArray[1]);
					var randomStudent3 = parseInt(randomizedArray[2]);
					var randomStudent4 = parseInt(randomizedArray[3]);
					var noneOfTheAbove = Math.floor(Math.random() * (5));

					while (body.student[randomStudent1] == null) {
						randomStudent1 = Math.floor(Math.random() * (49 - 1)) + 1;
					}

					while (body.student[randomStudent1].ec1 == "" || body.student[randomStudent1].street == "" || body.student[randomStudent1].homePhone == "") {
						randomStudent1 = Math.floor(Math.random() * (49 - 1)) + 1;
					}

					while (body.student[randomStudent2] == null) {
						randomStudent2 = Math.floor(Math.random() * (49 - 1)) + 1;
					}

					while (body.student[randomStudent2].ec1 == "" || body.student[randomStudent2].street == "" || body.student[randomStudent2].homePhone == "") {
						randomStudent2 = Math.floor(Math.random() * (49 - 1)) + 1;
					}

					while (body.student[randomStudent3] == null) {
						randomStudent3 = Math.floor(Math.random() * (49 - 1)) + 1;
					}

					while (body.student[randomStudent3].ec1 == "" || body.student[randomStudent3].street == "" || body.student[randomStudent3].homePhone == "") {
						randomStudent3 = Math.floor(Math.random() * (49 - 1)) + 1;
					}
					
					while (body.student[randomStudent4] == null) {
						randomStudent4 = Math.floor(Math.random() * (49 - 1)) + 1;
					}
			
					while (body.student[randomStudent4].ec1 == "" || body.student[randomStudent4].street == "" || body.student[randomStudent4].homePhone == "") {
						randomStudent4 = Math.floor(Math.random() * (49 - 1)) + 1;
					}

					if (main.getUsers()[id]) {
						main.getUsers()[id].questions[0].answers.push(body.student[randomStudent1].ec1);
						main.getUsers()[id].questions[0].answers.push(body.student[randomStudent2].ec1);
						main.getUsers()[id].questions[0].answers.push(body.student[randomStudent3].ec1);
						main.getUsers()[id].questions[0].answers.push(body.student[randomStudent4].ec1);
						main.getUsers()[id].questions[0].answers.push("None of the above.");

						main.getUsers()[id].questions[1].answers.push(body.student[randomStudent1].street);
						main.getUsers()[id].questions[1].answers.push(body.student[randomStudent2].street);
						main.getUsers()[id].questions[1].answers.push(body.student[randomStudent3].street);
						main.getUsers()[id].questions[1].answers.push(body.student[randomStudent4].street);
						main.getUsers()[id].questions[1].answers.push("None of the above.");
						
						main.getUsers()[id].questions[2].answers.push(body.student[randomStudent1].homePhone);
						main.getUsers()[id].questions[2].answers.push(body.student[randomStudent2].homePhone);
						main.getUsers()[id].questions[2].answers.push(body.student[randomStudent3].homePhone);
						main.getUsers()[id].questions[2].answers.push(body.student[randomStudent4].homePhone);
						main.getUsers()[id].questions[2].answers.push("None of the above.");

						callback();
					}
				});
			});
		}
	}

	function grabRandomStaffAnswers(callback, res, id) {
		if (token) {
			request({
				'url': config.URLs.EdDataAPI + 'employees?limit=1',
				'headers': {
					'Authorization': 'Bearer ' + token
				},
				
				'method': 'GET'
			}, function(err, resp, body) {
				var obj = JSON.parse(body);
				var num;

				if (obj.meta) {
					num = obj.meta.total;
				} else {
					return res.status(500).json({
						'err': "Expected variable meta in response from the EdData API, but did not get one."
					});
				}

				var random = Math.floor(Math.random() * (num - 1)) + 1;
				if (random + 50 > num) random -= 50; //Make sure we always have random employees

				request({
					'uri': config.URLs.EdDataAPI + 'employees?limit=50&offset=' + random,
					'method': 'GET',
					'headers': {
						'Authorization': 'Bearer ' + token
					}
				}, function(err, resp, data) {
					var body;

					try {
						body = JSON.parse(data);
					} catch (err) {
						return res.status(500).json({
							'err': "Improper response received from the EdData API."
						});
					}

					var fifty = [];
					
					for (var i = 0; i < 50; i++) fifty.push(i);

					var randomizedArray = shuffleArray(fifty);

					var randomEmployee1 = parseInt(randomizedArray[0]);
					var randomEmployee2 = parseInt(randomizedArray[1]);
					var randomEmployee3 = parseInt(randomizedArray[2]);
					var randomEmployee4 = parseInt(randomizedArray[3]);
					var noneOfTheAbove = Math.floor(Math.random() * (5));

					//FIX: Cannot read property streetNumber of undefined || Oct 22 2015
					while (body.employee[randomEmployee1] == null) {
						randomEmployee1 = Math.floor(Math.random() * (49 - 1)) + 1;
					}

					while (body.employee[randomEmployee1].streetNumber == "" || body.employee[randomEmployee1].streetName == "" || body.employee[randomEmployee1].birthdate == "") {
						randomEmployee1 = Math.floor(Math.random() * (49 - 1)) + 1;
					}

					while (body.employee[randomEmployee2] == null) {
						randomEmployee2 = Math.floor(Math.random() * (49 - 1)) + 1;
					}

					while (body.employee[randomEmployee2].streetNumber == "" || body.employee[randomEmployee2].streetName == "" || body.employee[randomEmployee2].birthdate == "") {
						randomEmployee2 = Math.floor(Math.random() * (49 - 1)) + 1;
					}

					while (body.employee[randomEmployee3] == null) {
						randomEmployee3 = Math.floor(Math.random() * (49 - 1)) + 1;
					}

					while (body.employee[randomEmployee3].streetNumber == "" || body.employee[randomEmployee3].streetName == "" || body.employee[randomEmployee3].birthdate == "") {
						randomEmployee3 = Math.floor(Math.random() * (49 - 1)) + 1;
					}
					
					while (body.employee[randomEmployee4] == null) {
						randomEmployee4 = Math.floor(Math.random() * (49 - 1)) + 1;
					}
			
					while (body.employee[randomEmployee4].streetNumber == "" || body.employee[randomEmployee4].streetName == "" || body.employee[randomEmployee4].birthdate == "") {
						randomEmployee4 = Math.floor(Math.random() * (49 - 1)) + 1;
					}

					if (main.getUsers()[id]) {
						main.getUsers()[id].questions[1].answers.push(body.employee[randomEmployee1].streetNumber + " " + body.employee[randomEmployee1].streetName);
						main.getUsers()[id].questions[1].answers.push(body.employee[randomEmployee2].streetNumber + " " + body.employee[randomEmployee2].streetName);
						main.getUsers()[id].questions[1].answers.push(body.employee[randomEmployee3].streetNumber + " " + body.employee[randomEmployee3].streetName);
						main.getUsers()[id].questions[1].answers.push(body.employee[randomEmployee4].streetNumber + " " + body.employee[randomEmployee4].streetName);
						main.getUsers()[id].questions[1].answers.push("None of the above.");
						
						main.getUsers()[id].questions[2].answers.push(getDate(body.employee[randomEmployee1].birthdate.substring(5, 10)));
						main.getUsers()[id].questions[2].answers.push(getDate(body.employee[randomEmployee2].birthdate.substring(5, 10)));
						main.getUsers()[id].questions[2].answers.push(getDate(body.employee[randomEmployee3].birthdate.substring(5, 10)));
						main.getUsers()[id].questions[2].answers.push(getDate(body.employee[randomEmployee4].birthdate.substring(5, 10)));
						main.getUsers()[id].questions[2].answers.push("None of the above.");

						callback();
					}
				});
			});
		}
	}

	function determineAnswerPositions(id) {
		var user = main.getUsers()[id];

		if (user.type == 'staff') {
			if (user.private.nota[1] == 5) {
				user.private.answers[1] = "None of the above.";
			} else {
				user.questions[1].answers[Math.floor(Math.random() * 4)] = user.private.answers[1];
			}

			if (user.private.nota[2] == 5) {
				user.private.answers[2] = "None of the above.";
			} else {
				user.questions[2].answers[Math.floor(Math.random() * 4)] = user.private.answers[2];
			}
		} else if (user.type == 'student') {
			if (user.private.nota[0] == 5) {
				user.private.answers[0] = "None of the above.";
			} else {
				user.questions[0].answers[Math.floor(Math.random() * 4)] = user.private.answers[0];
			}

			if (user.private.nota[1] == 5) {
				user.private.answers[1] = "None of the above.";
			} else {
				user.questions[1].answers[Math.floor(Math.random() * 4)] = user.private.answers[1];
			}

			if (user.private.nota[2] == 5) {
				user.private.answers[2] = "None of the above.";
			} else {
				user.questions[2].answers[Math.floor(Math.random() * 4)] = user.private.answers[2];
			}
		}
	}

	function setToken(tok) {
		token = tok;
	}

	return {
		'grabStaffData': grabStaffData,
		'grabStudentData': grabStudentData,
		'grabRandomStaffAnswers': grabRandomStaffAnswers,
		'grabRandomStudentAnswers': grabRandomStudentAnswers,
		'determineAnswerPositions': determineAnswerPositions,
		'setToken': setToken
	}
}