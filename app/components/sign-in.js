import Ember from 'ember';
import ENV from '../config/environment';

export default Ember.Component.extend({
  	attributeBindings: ['style'],
  	
	actions: {
		signIn() {
			console.log("Going to sign in");
			this.sendAction('showLoginFields');
		},

		redirectToCAS() {
			//this.sendAction('showLDAPModal');
			window.location.href = ENV["cas_login"] + "?service=" + ENV["iForgotHost"] + "/login&url=" + ENV["iForgotHost"];
		}
	}
});
