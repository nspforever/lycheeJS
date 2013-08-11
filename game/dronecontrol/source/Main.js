
lychee.define('game.Main').requires([
	'lychee.net.Client',
	'game.entity.ui.Font',
	'game.state.Game'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			title: 'Drone Control',

			fullscreen: true,

			input: {
				fireKey:   false,
				fireTouch: true,
				fireSwipe: true
			},

			// Is configured by sorbet/module/Server
			client: null,

			renderer: {
				id:     'game',
				width:  640,
				height: 480
			}

		}, data);


		lychee.game.Main.call(this, settings);

		this.load();

	};


	Class.prototype = {

		reset: function(state) {

			this.reshape();


			if (state === true) {
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
			this.fonts.normal = new game.entity.ui.Font('normal');


			this.client = null;

			if (this.settings.client !== null) {
				this.client = new lychee.net.Client(JSON.stringify, JSON.parse);
				this.client.listen(this.settings.client.port, this.settings.client.host);
			}

			this.setState('game', new game.state.Game(this));
			this.changeState('game');


			this.start();

		}

	};


	return Class;

});
