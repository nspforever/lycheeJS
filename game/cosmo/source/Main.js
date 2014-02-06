
lychee.define('game.Main').requires([
	'game.net.Client',
	'game.logic.Game',
	'game.state.Game',
	'game.state.Menu'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			// Is configured by sorbet/module/Server
			client: null,

			input: {
				delay:       0,
				key:         true,
				keymodifier: false,
				touch:       true,
				swipe:       false
			},

			jukebox: {
				music: true,
				sound: true
			},

			renderer: {
				id:     'game',
				width:  800,
				height: 600
			},

			viewport: {
				fullscreen: true
			}

		}, data);


		lychee.game.Main.call(this, settings);

		this.load();

	};


	Class.prototype = {

		reshape: function(orientation, rotation, width, height) {

			var resetstates = false;

/*
			var renderer = this.renderer;
			if (
				   width !== undefined
				&& height !== undefined
				&& renderer !== null
			) {

				var env = renderer.getEnvironment();

				if (
					this.settings.fullscreen === true
					&& (
						   env.width !== width
						|| env.height !== height
					)
				) {

					resetstates = true;

				}

			}
*/

			lychee.game.Main.prototype.reshape.call(this, orientation, rotation, width, height);


			if (resetstates === true) {
				this.resetStates();
			}

		},

		reset: function(state) {

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

			// Overwrite client with game.Client
			var clientsettings   = this.settings.client;
			this.settings.client = null;

			lychee.game.Main.prototype.init.call(this);
			this.reset(false);


			this.client   = null;
			this.services = {
				highscore:   null,
				multiplayer: null
			};

			this.logic = new game.logic.Game(this);

			if (clientsettings !== null) {
				this.client = new game.net.Client(clientsettings, this);
			}

			this.setState('game', new game.state.Game(this));
			this.setState('menu', new game.state.Menu(this));
			this.changeState('menu');


			this.start();

		},

		// TODO: hide/show integration
		start: function() {},
		stop:  function() {}

	};


	return Class;

});
