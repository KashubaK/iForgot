import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('forgot');
  this.route('teacher');
  this.route('change');
});

export default Router;
