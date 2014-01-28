
lychee.define('game.Main').requires([
	'game.net.Controller',
	'game.entity.Font',
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

			// Is configured by ./config.json
			drones: null,

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
					this.settings.drones = settings.drones;
				}

				preloader.unbind('ready');
				preloader.unbind('error');

				lychee.game.Main.prototype.load.call(this);

			}, this);

			preloader.bind('error', function(assets, mappings) {

				preloader.unbind('ready');
				preloader.unbind('error');

				lychee.game.Main.prototype.load.call(this);

			}, this);

			preloader.load('./config.json');

		},

		init: function() {

			lychee.game.Main.prototype.init.call(this);
			this.reset(false);


			this.fonts = {};
			this.fonts.normal = new game.entity.Font('normal');

			this.controller = new game.net.Controller(this);
			this.controller.setIP('192.168.1.1');

			this.setState('game', new game.state.Game(this));
			this.changeState('game');


			this.start();

		}

	};


	return Class;

});
