/* jshint node: true */

//Rename this file to "environment.js" in this directory.

module.exports = function(environment) {
  //You can pretty much ignore everything until you see the ENV[] declarations, unless you need to configure Ember for development.

  var ENV = {
    modulePrefix: 'password-gui-2016',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  ENV["iForgotHost"] = "URL matching the host of this app. For development, use 'http://localhost:8081', or whatever your development environment requires.";

  ENV["district_website"] = "https://psd401.net/"

  ENV["use_cas"] = true; //Can be false, if you plan on using LDAP to authenticate instead of CAS. Ensure that you fill out all necessary configurations if you plan on doing so.
  ENV["cas_logout"] = "The host and endpoint of your CAS logout URL. For example: 'https://cas.example.com/logout' ";
  ENV["cas_login"] = "The host and endpoint of your CAS login URL. For example: 'https://cas.example.com/login' ";

  ENV["use_ldap"] = false; //Uses a built-in sign in modal instead of redirecting to your login service. Can be set as false if you don't want to use it, but make sure you have an authentication method available.  
  //If you plan on using LDAP for authentication, see the node_server configuration.

  ENV["Visual"] = {
    'five_seconds': 'Done! In about five seconds, you will be redirected to the PSD Central Login to verify your new credentials. Please proceed to log in with your new password.',
    'password_changed_final': 'From now on, with any PSD service, you need to enter your new credentials. If by any chance you have forgotten your password, just select the "Forgot?" option at the homepage.',
    
    'district_img': '../svg/PSD.svg',
    'color_dark': 'rgb(0, 107, 170)',
    'color_medium': 'rgb(75, 182, 245)',
    'color_light': 'rgb(225, 235, 245)'
  }
  return ENV;
};
