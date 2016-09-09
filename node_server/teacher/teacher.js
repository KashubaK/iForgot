var async = require('async');
var request = require('request');

module.exports = function(http, config) {
	var main = module.parent.exports;

	var token;
	var psAPIKey;

	var getUsers = module.parent.exports.getUsers;
	
	http.get('/teacher/classes', function(req, res) {
		//Make sure the user is a teacher
		if (getUsers()[req.sessionID] && getUsers()[req.sessionID].username && getUsers()[req.sessionID].state === 'teacher') {
			var user;
			//Get their ID
			getEmployeeInfo((getUsers()[req.sessionID].pose_username || getUsers()[req.sessionID].username), function(err, employee) {
				//Construct the response object
				user = {
					'err': err,
					'user': employee
				}

				if (!employee) return res.status(403).json(user);

				//Use the employee's id to query for sections
				getTeacherSections(employee.id, function(err, sections) {
					user['sections'] = sections;
					//for each section take its id
					async.each(user['sections'], function(section, callback) {
						//Then get the student ids from that section
						getStudentIDsFromSection(section.id, function(err, ids) {
							section.students = ids;

							if (section.students != null) {
								//for each student in a section
								async.each(section.students, function(student, callback2) {
									//query for the student's data
									getStudentData(student.id, function(err, studentInfo) {
										//save it
										student.info = studentInfo;
										//get on with life
										callback2();
									})
								}, function() {
									//go to the next section and query for its students
									callback();
								})
							} else {
								callback();
							}
						});
					}, function() {
						//all done grabbing data
						res.json(user);
					});
				});
			});
		} else {
			res.status(400).json({
				'err': 'User is not a teacher.'
			})
		}
	});

	/*
		req.body == {
			"username": "2012589",
			"scheme": "...",
			"state": "aaAAa..."
		}
	*/
	http.post('/teacher/scheme', function(req, res) {
		if (!(main.getUsers()[req.sessionID] && main.getUsers()[req.sessionID].username && main.getUsers()[req.sessionID].state === 'teacher')) return res.status(403).json({'err': 'User not eligible.'});

		var password;
		getStudentData(req.body.username, function(err, user) {
			password = getPasswordWithScheme(user, req.body.scheme, req.body.state, 0, "").replace(/ /g, '');

			if (password && password.length > 0 && req.body.username) {
				console.log("changing password to ", password);

				changePassword(req.body.username, password, function(err, resp, body) {
					res.status(200).json({
						'username': req.body.username,
						'data': body
					});
				});
			} else {
				res.status(400).json({
					'err': "Missing username/password."
				});
			}
		});
	});

	http.post('/teacher/password', function(req, res) {
		if (!(main.getUsers()[req.sessionID] && main.getUsers()[req.sessionID].username && main.getUsers()[req.sessionID].state === 'teacher')) return res.status(403).json({'err': 'User not eligible.'}); 

		changePassword(req.body.username, req.body.password, function processResponse(err, resp, body) {
			try {
				if (body.data.result.success) {
					res.status(200).json({
						'user': body.data.user,
						'success': body.data.result.success
					})
				} else {
					res.status(500).json({
						'user': body.data.user,
						'success': false,
						'data': body
					})
				}
			} catch(err) {
				res.status(500).json({
					'user': null,
					'success': false,
					'err': err
				});
			}
		});
	});

	function setEdDataToken(key) {
		token = key;
	}

	function getEmployeeInfo(username, callback) {
		request({
			'url': config.URLs.EdDataAPI + 'employees?uname=' + username,
			'headers': {
				'Authorization': 'Bearer ' + token
			},
			'method': 'GET'
		}, function(error, resp, body) {
			try {
				if (error) return callback(error, null);

				var data = JSON.parse(body);
				
				if (data.employee[0]) {
					return callback(null, data.employee[0]);
				} else {
					return callback("User is not an employee.", null);
				}
			} catch (err) {
				return callback("Could not parse data from EdData API. Possibly invalid token.", null);
			}
		});
	}

	function getTeacherSections(teacherID, callback) {
		request({
			'url': config.URLs.EdDataAPI + 'sections?teacher=' + teacherID,
			'headers': {
				'Authorization': 'Bearer ' + token
			},
			'method': 'GET'
		}, function(error, resp, body) {
			try {
				var sectionInfo = JSON.parse(body);

				if (sectionInfo.section.length !== 0) {
					return callback(null, sectionInfo.section);
				} else {
					return callback("No section data for " + teacherID, null);
				}
			} catch (err) {
				return callback("Could not parse data from EdData API. Possibly invalid token.", null);
			}
		});
	}

	function getStudentIDsFromSection(sectionID, callback) {
		var studentIDs = [];

		request({
			'url': config.URLs.EdDataAPI + 'enrollments?secid=' + sectionID,
			'method': 'GET',
			'headers': {
				'Authorization': 'Bearer ' + token
			}
		}, function(error, resp, body) {
			try {
				var enrollmentInfo = JSON.parse(body);

				for (var i = 0; i < enrollmentInfo.enrollment.length; i++) {
					studentIDs.push({
						'id': enrollmentInfo.enrollment[i].studentNumber
					})
				}

				return callback(null, studentIDs);
			} catch(err) {
				return callback("Unable to retrive enrollements for section ID: " + sectionID, null);
			}
		});
	}

	function getStudentData(studentID, callback) {
		request({
			'url': config.URLs.EdDataAPI + 'students?stunum=' + studentID,
			'method': 'GET',
			'headers': {
				'Authorization': 'Bearer ' + token
			}
		}, function(error, resp, body) {
			var data;

			try {
				if (body) {
					var data = JSON.parse(body);

					if (data.student[0]) {
						return callback(null, data.student[0]);
					} else {
						callback(null, null)
					}
				} else {
					console.log(error, resp, body);
				}
			} catch (err) {
				console.error(err);
				return callback('Could not parse student info for user ' + studentID, null);
			}
		});
	}

	function getPasswordWithScheme(user, scheme, state, step, result) {
		var result = "";
		var maxStep = scheme.length;

		function processOptions(step, propertyName, hasLengthOfFour) {
			switch (state.substring(step, step + 2)) {
				case 'aa':
					result += user[propertyName].toLowerCase().substring(0, 2);
					break;
				case 'Aa':
					result += user[propertyName].substring(0, 1).toUpperCase() + user[propertyName].substring(1, 2).toLowerCase();
					break;
				case 'aA':
					result += user[propertyName].substring(0, 1).toLowerCase() + user[propertyName].substring(1, 2).toUpperCase();
					break;
				case 'AA':
					result += user[propertyName].toUpperCase().substring(0, 2);
					break;
			}

			if (hasLengthOfFour) {
				switch (state.substring(step + 2, step + 4)) {
					case 'aa':
						result += user[propertyName].toLowerCase().substring(2, 4);
						break;
					case 'Aa':
						result += user[propertyName].substring(2, 3).toUpperCase() + user[propertyName].substring(3, 4).toLowerCase();
						break;
					case 'aA':
						result += user[propertyName].substring(2, 3).toLowerCase() + user[propertyName].substring(3, 4).toUpperCase();
						break;
					case 'AA':
						result += user[propertyName].toUpperCase().substring(2, 4);
						break;
				}
			}
		}

		function processStepOfScheme(scheme, step) {
			switch (scheme.substring(step, step + 2)) {
				case 'fn':
					if (scheme.substring(step + 2, step + 4) == '--') {
						processOptions(step, "firstName", true);
					} else {
						processOptions(step, "firstName", false);
					}

					break;
				case 'mn':
					if (scheme.substring(step + 2, step + 4) == '--') {
						processOptions(step, "middleName", true);
					} else {
						processOptions(step, "middleName", false);
					}
					
					break;
				case 'ln':
					if (scheme.substring(step + 2, step + 4) == '--') {
						processOptions(step, "lastName", true);
					} else {
						processOptions(step, "lastName", false);
					}
					
					break;
				case 'bd':
					result += user.birthdate.substring().toLowerCase().substring(8, 10);
					break;
				case 'bm':
					result += user.birthdate.substring().toLowerCase().substring(5, 7);
					break;
				case 'by':
					if (scheme.substring(step + 2, step + 4) == '--') {
						processOptions(step, "birthdate", true);
					} else {
						processOptions(step, "birthdate", false);
					}

					break;
				case 'pn':
					if (scheme.substring(step + 2, step + 4) == '--') {
						result += user.homePhone.substring(8);
					} else {
						result += user.homePhone.substring(8, 10);
					}

					break;
				case 'aa':
					if (scheme.substring(step + 2, step + 4) == '--') {
						processOptions(step, "street", true);
					} else {
						processOptions(step, "street", false);
					}

					break;
			}

			if (step == maxStep) {
				return result;
			} else {
				return processStepOfScheme(scheme, step + 2);
			}
		}

		return processStepOfScheme(scheme, 0);
	}

	function changePassword(username, password, callback) {
		main.getToken(function(psKey) {
			request({
				'url': config.URLs.PowershellAPI + "api/user/password",
				'method': 'POST',
				'headers': {
					'Content-Type': 'application/json'
				},
				'json': true,
				'body': {
					'token': psKey,
					'username': username,
					'password': password
				}
			}, function(err, resp, body) {
				if (err) {
					console.error(err);
					return console.error("{'err': 'Attempt to hit api/user/password failed, PSAPI might be down'}");
				}

				if (body === "Invalid token.") {
					console.error("{'err': 'Retrieved an invalid key from the PowershellAPI.'}");
				}
				
				callback(err, resp, body);
			})
		})
	}

	return {
		'getEmployeeInfo': getEmployeeInfo,
		'getTeacherSections': getTeacherSections,
		'getStudentIDsFromSection': getStudentIDsFromSection,
		'getStudentData': getStudentData,
		'setEdDataToken': setEdDataToken,
		'setPSToken': function(str) {
			psAPIKey = str;
		}
	}
}














