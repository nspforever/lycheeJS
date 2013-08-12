
lychee.define('game.Main').requires([
	'game.Jukebox',
	'game.entity.Font',
	'game.logic.Game',
	'game.state.Game',
	'game.state.Menu',
	'game.state.Result',
	'game.DeviceSpecificHacks'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			title: 'Jewelz',
			mode:  'easy',
			tile:  64,

			fullscreen: true,

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

			this.jukebox = new game.Jukebox(this);
			this.logic   = new game.logic.Game(this);

			this.setState('game',   new game.state.Game(this));
			this.setState('result', new game.state.Result(this));
			this.setState('menu',   new game.state.Menu(this));
			this.changeState('menu');

			this.start();

		}

	};


	return Class;

});
