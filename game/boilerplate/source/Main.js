
lychee.define('game.Main').requires([
	'game.Jukebox',
	'game.entity.Font',
	'game.state.Game',
	'game.state.Menu',
	'game.DeviceSpecificHacks'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			base:  './asset',
			title: 'Game Boilerplate',

			fullscreen: true,

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

		load: function() {

			// Nothing to load, so initialize
			this.init();


			/*
			 * PRELOADING EXAMPLE
			 */

			/*

			var base = this.settings.base;

			var urls = [
				base + '/img/example.png'
			];


			this.preloader = new lychee.Preloader({
				timeout: Infinity
			});

			this.preloader.bind('ready', function(assets) {

				// console.log(urls[0], assets[urls[0]]);

				this.assets = assets;
				this.init();

			}, this);

			this.preloader.bind('error', function(urls) {
				if (lychee.debug === true) {
					console.warn('Preloader error for these urls: ', urls);
				}
			}, this);

			this.preloader.load(urls);

			*/

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

		init: function() {

			lychee.game.Main.prototype.init.call(this);
			this.reset(false);


			this.fonts = {};
			this.fonts.headline = new game.entity.Font('headline');
			this.fonts.normal   = new game.entity.Font('normal');
			this.fonts.small    = new game.entity.Font('small');

			this.jukebox = new game.Jukebox(this);

			this.setState('game', new game.state.Game(this));
			this.setState('menu', new game.state.Menu(this));
			this.changeState('menu');

			this.start();

		}

	};


	return Class;

});
