var express  	 = require('express');
var path		 = require('path');
var serveStatic  = require('serve-static');
var session 	 = require('express-session');
var uuid		 = require('node-uuid');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var request  	 = require('request');
var async		 = require('async');
var CAS 	 	 = require('cas');

var config 		 = require('./config/config.js');
console.log(config.URLs.CAS, config.URLs.iForgot + "login")
var cas 	 	 = new CAS({base_url: config.URLs.CAS, service: config.URLs.iForgot + "login"});

var canSubmitEdDataRequests = false;
var canSubmitPSAPIRequests = false;

var http;

var users = {};
function getUsers() {return users};
function setUser(id, obj) {users[id]=obj};

var psAPIKey;
var token;

//Either use this dist folder, or go back a directory and use the one Ember compiles live to
var distFolder = '../dist';

function configureExpress() {
	http = express();

	//Basic middleware declarations
	http.use(bodyParser());
	http.use(cookieParser());

	http.use(function setResponseHeaders(req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		next();
	});

	//Generates a session ID for each user
	http.use(session({
		genid: function(req) {
			return uuid.v4();
		},
		
		secret: config.session_secret
	}));
	
	//Open its ears.
	http.listen(config.port);

	var teacher = require('./teacher/teacher.js')(http, config, users, request);
	var forgot = require('./forgot/forgot.js')(http, config, users);

	teacher.setEdDataToken(token);
	teacher.setPSToken(psAPIKey);

	forgot.setToken(token);
}

function initEndpoints() {

	http.get(/./, serveStatic(distFolder));

	http.get('/', function(req, res) {
		res.sendFile(path.resolve(distFolder + '/index.html'));
	});

	http.get('/forgot', function(req, res) {
		res.sendFile(path.resolve(distFolder + '/index.html'));
	});

	http.get('/teacher', function(req, res) {
		res.sendFile(path.resolve(distFolder + '/index.html'));
	});

	http.get('/teacher/session', function(req, res) {
		if (!users[req.sessionID] || users[req.sessionID].state !== 'teacher') {
			createSession('', req.sessionID, 'teacher');
		}

		res.status(200).json(getSessionWithoutConfidentialData(req.sessionID));
	});

	http.post('/teacher/admin/session', function(req, res) {
		if (users[req.sessionID].state === 'forgot' || users[req.sessionID].auth === false) {
			delete users[req.sessionID];

			createSession('', req.sessionID, 'teacher') ;
			users[req.sessionID].auth = false;

			res.header('Location', config.URLs.CAS + "?service=" + config.URLs.iForgot + "login");
			return res.send(302, '');
		}

		if (users[req.sessionID]) {
			users[req.sessionID].pose_username = req.body.username;
			users[req.sessionID].state = "teacher";

			res.status(200).json(getSessionWithoutConfidentialData(req.sessionID));
		} else {
			res.status(403).end("We're not even sure how that happened. Try refreshing your browser. If that doesn't work, clear your browser cache, try again, or try a different browser.");
		}
	});

	http.get('/login', function(req, res) {

		var ticket = req.query.ticket;

		function handleState(username) {
			switch (getState(req.sessionID)) {
			  	case null:
					createSession(username, req.sessionID);
					users[req.sessionID].auth = true;

					res.header('Location', config.URLs.iForgot);
					return res.send(302, 'Success.');
			  		break;
			  	case 'done':
					res.header('Location', config.URLs.iForgot);
					return res.send(302, 'Success.');
				case 'teacher':
					users[req.sessionID].username = username;
					users[req.sessionID].auth = true;

					res.header('Location', config.URLs.iForgot + 'teacher');
					return res.send(302, 'Success.');
			}
		}

		if (ticket) {
			cas.validate(ticket, function(err, status, username) {
				if (err) {
					// Handle the error
					res.send({error: err});
				} else {
					// Log the user in 
					if (username) {
						handleState(username);
					} else {
						res.status(400).send('Bad ticket. Please go back to the <a href="' + config.URLs.iForgot + '">home page</a>.');	
					}
				}
			});
		}
	});

	http.post('/password', function(req, res) {
		if (req.body.password && users[req.sessionID]) {
			if (users[req.sessionID].hasAnsweredCorrectly === true || users[req.sessionID].state === "change") {
				getToken(function(psKey) {
					request({
						'url': config.URLs.PowershellAPI + 'api/user/password',
						'method': 'POST',
						'headers': {
							'Content-Type': 'application/json'
						},
						'json': true,
						'body': {
							'token': psKey,
							'username': users[req.sessionID].username,
							'password': req.body.password
						}
					}, function (err, resp, body) {
						if (err) return res.status(500).json(err);

						try {
							if (body.data.result.success == true) {
								users[req.sessionID].state = 'done';

								res.status(200).json({
									'success': true,
									'err': null
								});
							} else {
								res.status(500).json(body);
							}
						} catch (err) {
							res.status(500).json(err);
						}
					});
				});
			} else {
				delete users[req.sessionID];

				res.header('Location', config.URLs.CAS + "?service=" + config.URLs.iForgot + "login");
				return res.send(302, '');
			}
		} else {
			res.status(400).json({
				'success': false,
				'err': 'Bad request.'
			})
		}
	});

	http.get('/session', function(req, res) {
		res.json(getSessionWithoutConfidentialData(req.sessionID));
	});

	http.get('/admin', function(req, res) {
		if (users[req.sessionID] && users[req.sessionID].username) {
			request({
				'url': config.URLs.PowershellAPI  + 'auth',
				'method': 'POST',
				'headers': {
					'Content-Type': 'application/json'
				},
				'json': true,
				'body': {
					'token': true,
					"username": config.credentials.PowershellAPI.username,
					"password": config.credentials.PowershellAPI.password
				}
			}, function(err, resp, body) {
				try {
					if (body.data) {
						psAPIKey = body.data.result.token;

						request({
							'url': config.URLs.PowershellAPI  + 'api/command',
							'method': 'POST',
							'headers': {
								'Content-Type': 'application/json'
							},
							'json': true,
							'body': {
								'token': psAPIKey,
								'command': '(Get-ADUser ' + users[req.sessionID].username + ' -Properties MemberOf).MemberOf'
							}
						}, function(err, resp, body) {
							try {
								users[req.sessionID].admin = JSON.stringify(body.data.result.output).indexOf(config.admin_group);
								res.status(200).json(JSON.stringify(body.data.result.output).indexOf(config.admin_group) ? "true" : "false");
							} catch (err) {
								console.error(body, err);
								console.error('{"err": "Incorrect response from the PowershellAPI was received when attempting to get ADUser information.", "url": "' + (config.URLs.PowershellAPI  + 'api/command') + '"}');
							}
						});
					}
				} catch (err) {
					console.error(body, err);
					console.error('{"err": "Incorrect response from the PSAPI was received when attempting to authenticate."}');
				}
			})
		}
	})

	http.delete('/session', function(req, res) {
		if (users[req.sessionID]) {
			delete users[req.sessionID];
		}

		res.status(200).json({"message": "done"});
	});
}
      
function createSession(username, id, state, user) {
	if (state === 'teacher') {
		console.log("Creating teacher session for ", username, id)
		users[id] = {
			"username": null,
			"state": state
		}
	} else {
		users[id] = {
			"username": username,
			"state": state || "change"
		}
	}
}

function getSessionWithoutConfidentialData(id) {
	console.log(users[id]);
	if (users[id]) {
		if (users[id].state == 'forgot') {
			return {
				"username": users[id].username,
				"state": users[id].state,
				"questions": users[id].questions,
				"answers": users[id].answers
			};
		} else {
			return {
				"username": users[id].pose_username || users[id].username,
				"state": users[id].state
			};
		}
	} else {
		return null;
	}
}

function getState(id) {
	if (users[id]) return users[id].state;
	return null;
}

function grabServiceTokens(callback) {
	//Grab EdData API Token
	request({
		'url': config.URLs.EdDataAPI + 'auth/login',
		'method': 'POST',

		'headers': {
			'Content-Type': 'application/json'
		},

		'json': true,
		'body': {
			"username": config.credentials.EdDataAPI.username,
			"password": config.credentials.EdDataAPI.password
		}
	}, function(err, resp, body) {
		if (body.user.token) {
			token = body.user.token;
			canSubmitEdDataRequests = true;
			console.log("Successfully acquired EdData API token.")

			request({
				'url': config.URLs.PowershellAPI  + 'auth',
				'method': 'POST',
				'headers': {
					'Content-Type': 'application/json'
				},
				'json': true,
				'body': {
					'token': true,
					"username": config.credentials.PowershellAPI.username,
					"password": config.credentials.PowershellAPI.password
				}
			}, function (err, resp, body) {
				try {
					if (body.data) {
						psAPIKey = body.data.result.token;
						canSubmitPSAPIRequests = true;
						console.log("Successfully acquired PowershellAPI token.")
					}
				} catch (err) {
					console.error(body, err);
					console.error('{"err": "Incorrect response from the PSAPI was received when attempting to authenticate."}');
				}

				configureExpress();
				initEndpoints();

				console.log("\niForgot initialized.");
				console.log("-----")
				console.log("Listening on port " + config.port + "\n");
				
				if (typeof callback === 'function') {
					callback();
				}
			});
		} else {
			console.error(body);
			console.warn('Unable to authenticate with the EdData API. Forgot/teacher functions will not work.');
		}
	});
};

grabServiceTokens();

function getToken(callback) {
	request({
		'url': config.URLs.PowershellAPI  + 'auth',
		'method': 'POST',
		'headers': {
			'Content-Type': 'application/json'
		},
		'json': true,
		'body': {
			'token': true,
			"username": config.credentials.PowershellAPI.username,
			"password": config.credentials.PowershellAPI.password
		}
	}, function (err, resp, body) {
		try {
			if (body.data) {
				callback(body.data.result.token);
				canSubmitPSAPIRequests = true;
			}
		} catch (err) {
			console.error('{"err": "Incorrect response from the PSAPI was received when attempting to authenticate."}');
		}
	});
}

module.exports = {
	'getSessionWithoutConfidentialData': getSessionWithoutConfidentialData,
	'getUsers': getUsers,
	'setUser': setUser,
	'grabServiceTokens': grabServiceTokens,
	'getToken': getToken
}
