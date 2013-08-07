
lychee.define('game.Main').requires([
	'game.Client',
	'game.Jukebox',
	'game.entity.ui.Font',
	'game.logic.Game',
	'game.state.Game',
	'game.state.Menu',
	'game.DeviceSpecificHacks'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			title: 'Cosmo',

			fullscreen: true,

			music: true,
			sound: true,

			input: {
				fireKey:      true,
				fireModifier: false,
				fireTouch:    true,
				fireSwipe:    false
			},

			// Is configured by sorbet/module/Server
			client: null,

			renderer: {
				id:     'game',
				width:  800,
				height: 600
			}

		}, data);


		lychee.game.Main.call(this, settings);

		this.load();

	};


	Class.prototype = {

		reshape: function(orientation, rotation, width, height) {

			var resetstates = false;

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


			lychee.game.Main.prototype.reshape.call(this, orientation, rotation, width, height);


			if (resetstates === true) {
				this.resetStates();
			}

		},

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

		load: function() {

			var preloader = new lychee.Preloader();


			preloader.bind('ready', function(assets, mappings) {

				var url = Object.keys(assets)[0];
				var settings = assets[url];
				if (settings !== null) {

					this.settings.client = {
						port: settings.port,
						host: settings.host
					};

				}

				preloader.unbind('ready');
				preloader.unbind('error');

				this.init();

			}, this);

			preloader.bind('error', function(assets, mappings) {

				preloader.unbind('ready');
				preloader.unbind('error');

				this.init();

			}, this);

			preloader.load('/sorbet/module/Server', null, 'json');

		},

		init: function() {

			// Remove Preloader Progress Bar
			lychee.Preloader.prototype._progress(null, null);


			lychee.game.Main.prototype.init.call(this);
			this.reset(false);


			this.fonts = {};
			this.fonts.hud    = new game.entity.ui.Font('hud');
			this.fonts.normal = new game.entity.ui.Font('normal');
			this.fonts.small  = new game.entity.ui.Font('hud');


			this.client  = null;
			this.jukebox = new game.Jukebox(this);
			this.logic   = new game.logic.Game(this);

			if (this.settings.client !== null) {
				this.client = new game.Client(this.settings.client, this);
			}

			this.setState('game', new game.state.Game(this));
			this.setState('menu', new game.state.Menu(this));
			this.changeState('menu');


			if (lychee.debug === true) {

				if (this.settings.stage !== undefined) {
					this.changeState('game', this.settings.stage);
				}

				if (this.settings.points !== undefined) {

					var data = this.logic.__level.getData();
					data.points = this.settings.points;
					this.logic.__level.trigger('update', [ data ]);

				}

			}


			this.start();

		},

		// TODO: hide/show integration
		start: function() {},
		stop:  function() {}

	};


	return Class;

});
