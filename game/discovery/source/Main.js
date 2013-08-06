
lychee.define('game.Main').requires([
	'game.entity.Font',
	'game.state.Demo',
	'game.state.Menu',
	'game.DeviceSpecificHacks'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			title: 'Discovery Suite',

			fullscreen: true,

			input: {
				fireKey:      true,
				fireModifier: false,
				fireTouch:    true,
				fireSwipe:    true
			},

			renderer: {
				id:     'game',
				width:  640,
				height: 480
			}

		}, data);


		lychee.game.Main.call(this, settings);

		this.init();

	};


	Class.prototype = {

		reset: function(state) {

			game.DeviceSpecificHacks.call(this);

			this.reshape();

			if (state === true) {
				this.resetState(null, null);
			}

		},

		init: function() {

			// Remove Preloader Progress Bar
			lychee.Preloader.prototype._progress(null, null);


			lychee.game.Main.prototype.init.call(this);
			this.reset(false);


			this.fonts = {};
			this.fonts.headline = new game.entity.Font('headline');
			this.fonts.normal   = new game.entity.Font('normal');
			this.fonts.small    = new game.entity.Font('small');

			this.fonts.ubuntu20      = new game.entity.Font('ubuntu20');
			this.fonts.ubuntu20_bold = new game.entity.Font('ubuntu20_bold');


			this.setState('demo', new game.state.Demo(this));
			this.setState('menu', new game.state.Menu(this));
			this.changeState('menu');

			this.start();

		}

	};


	return Class;

});
