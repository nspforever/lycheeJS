
lychee.define('game.Main').requires([
	'game.entity.Font',
	'game.state.Game',
	'game.state.Menu',
	'game.DeviceSpecificHacks'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			title: 'Pong Game',

			fullscreen: true,

			input: {
				delay:        0,
				fireKey:      false,
				fireModifier: false,
				fireTouch:    true,
				fireSwipe:    false
			}

		}, data);


		lychee.game.Main.call(this, settings);

		this.init();

	};


	Class.prototype = {

		reset: function(state) {

			game.DeviceSpecificHacks.call(this);

			// This will initially reset the viewport
			// based on the DeviceSpecificHacks
			this.reshape();


			if (state === true) {

				// This will leave the current state and
				// pass in empty data (for level interaction)
				this.resetState(null, null);

			}

		},

		init: function() {

			lychee.game.Main.prototype.init.call(this);
			this.reset(false);


			this.fonts = {};
			this.fonts.headline = new game.entity.Font('headline');
			this.fonts.normal   = new game.entity.Font('normal');
			this.fonts.small    = new game.entity.Font('small');


			this.setState('game', new game.state.Game(this));
			this.setState('menu', new game.state.Menu(this));
			this.changeState('menu');

			this.start();

		}

	};


	return Class;

});
