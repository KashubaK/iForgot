/* globals $ */

import Ember from 'ember';
import ENV from '../config/environment';

export default Ember.Component.extend({
  	attributeBindings: ['style'],
  	
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

	inputFieldClass: Ember.computed('hasError', 'submittingPassword', function() {
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
		updateNewPassword(str) {
			this.set('newPassword', str);
			this.send('checkForPasswordErrors');
		},

		updateVerifyPassword(str) {
			this.set('verifyPassword', str);
			this.send('checkForPasswordErrors');
		},

		checkForPasswordErrors() {
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

		goBack() {
			this.sendAction('cancel');
		},

		submitPassword() {
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
				}).done(function() {
					_this.set('animationText', ENV["Visual"].five_seconds);
					_this.set('successAnimationClass', 'password-submitting disappear ease');
					_this.set('submittedPassword', true);

					setTimeout(function() {
						if (ENV["use_cas"]) {
							window.location.assign(ENV["cas_logout"] + "?service=" + ENV["iForgotHost"] + "/login&url=" + ENV["iForgotHost"] + "/login");
						} else {
							//TODO: Trigger Sign-in Modal
						}
					}, 7500);

					_this.sendAction('done');
				}).fail(function() {
					_this.set('animationText', 'An error ocurred whilst changing your password. Please try again in a few seconds.');

					setTimeout(function() {					
						_this.set('animationText', null);
						_this.set('submittingPassword', false);
						_this.set('showButtons', true);					
						_this.set('successAnimationClass', 'password-success ease');

					}, 2500);
				});
			}
		}
	},

	init() {
		this._super();

		this.send('checkForPasswordErrors');
	}
});
