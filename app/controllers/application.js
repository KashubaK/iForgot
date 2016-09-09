import Ember from 'ember';
import ENV from '../config/environment';

export default Ember.Controller.extend({
	title: "Reset Password",
	signInClass: "small-modal show",
	ldapModalClass: "ldap-modal hide",
	overlayClass: "overlay hide-still ease",

	navbarColorStyle: "border-top: 10px solid " + ENV["Visual"].color_dark + ";",

	modalStyle: "background-color: "+ ENV["Visual"].color_light +";",
	modalTitleStyle: "border-bottom: 5px solid " + ENV["Visual"].color_medium + ";",
	logoStyle: "background-image: url("+ ENV["Visual"].district_img +");",

	districtWebsite: ENV["district_website"],

	finalText: ENV["Visual"].password_changed_final,

	changePasswordClass: "small-modal hide",
	routeIsHome: false,
	passwordChanged: false,

	sessionData: {},
	sessionDataObserver: Ember.observer('sessionData', function() {
		if (this.get('sessionData')) {
			this.set("signInClass", "small-modal hide");
			this.set("changePasswordClass", "small-modal show");
		}
	}),

	actions: {
		deleteSession() {
			$.ajax({url: 'session', 'method': "DELETE"});
		},

		done() {
			//console.log("The password has been changed, I'm going to do my things!");
		},

		cancel() {
			this.send('deleteSession');
			window.location.reload();
		},

		showLDAPModal() {
			this.set('ldapModalClass', 'ldap-modal show');
			this.set('overlayClass', 'overlay show-still ease');
		},

		hideOverlay() {
			this.set('ldapModalClass', 'ldap-modal hide');
			this.set('overlayClass', 'overlay hide-still ease');
		}
	},

	init() {
		this._super();
		
		if (window.location.pathname == "/") {
			var _this = this;
			this.set('routeIsHome', true);

			$.ajax({
				'url': 'session'
			}).done(function(body) {
				_this.set('sessionData', body);

				if (body && body.state == 'done') {
					_this.send('deleteSession');

					_this.set('passwordChanged', true);
				}
			})
		} else {
			this.set('signInClass', 'small-modal hide');
		}
	}
});
