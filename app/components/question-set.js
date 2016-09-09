import Ember from 'ember';

export default Ember.Component.extend({
  	attributeBindings: ['style'],
	question: {},

	ssn: '',
	answer: {},

	actions: {
		answer(id, ans) {
			this.sendAction("sendAnswer", id, ans);
		},

		updateSSN(n) {
			this.set('ssn', {
				'title': n,
				'class': ''
			});
		},

		selectAnswer(userAnswer) {
			if (this.get('answer') === userAnswer) {
				this.set('answer', {});
				Ember.set(userAnswer, 'class', 'answer-choice ease');
			} else {
				var answers = this.get('question').answers;

				for (var i = 0; i < answers.length; i++) {
					var answer = answers[i];

					if (userAnswer.title === answer.title) {
						Ember.set(answer, 'class', 'answer-choice highlight ease');
						this.set('answer', answer);
					} else {
						Ember.set(answer, 'class', 'answer-choice ease');
					}
				}
			}

			Ember.set(this.get('question'), 'answer', this.get('answer'));
		},

		goBack() {
			this.sendAction('goBackToQuestion', this.get('question').i - 1);
		}
	}
});
