
lychee.define('game.Main').requires([
	'game.state.Game',
	'game.state.Menu',
	'game.DeviceSpecificHacks'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			jukebox: {
				music: true,
				sound: true
			},

			renderer: {
				id:     'game',
				width:  640,
				height: 480
			},

			viewport: {
				fullscreen: true
			}

		}, data);


		lychee.game.Main.call(this, settings);

		this.load();

	};


	Class.prototype = {

		load: function() {

			// Nothing to load, so initialize
			this.init();


			/*
			 * PRELOADING:
			 *
			 * Normally, every Entity has its required
			 * assets attached to it, so you don't need
			 * to preload. If you still want to, here's
			 * how...
			 *
			 */

/*

			var urls = [
				'./asset/img/example.png'
			];


			this.preloader = new lychee.Preloader({
				timeout: 5000
			});

			this.preloader.bind('ready', function(assets, mappings) {

				console.log(urls[0], assets[urls[0]]);

				this.assets = assets;
				this.init();

			}, this);

			this.preloader.bind('error', function(assets, mappings) {

				if (lychee.debug === true) {
					console.warn('Preloader error for these assets: ', assets);
				}

			}, this);

			this.preloader.load(urls);

*/

		},

		reshape: function(state) {

			game.DeviceSpecificHacks.call(this);

			lychee.game.Main.prototype.reshape.call(this);

		},

		init: function() {

			lychee.game.Main.prototype.init.call(this);

			this.reshape();


			this.setState('game', new game.state.Game(this));
			this.setState('menu', new game.state.Menu(this));
			this.changeState('menu');

			this.start();

		}

	};


	return Class;

});
