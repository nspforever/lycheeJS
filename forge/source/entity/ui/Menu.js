
lychee.define('game.entity.ui.Menu').requires([
	'lychee.ui.Button',
	'lychee.ui.Select'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(game, settings) {

		if (settings === undefined) {
			settings = {};
		}


		this.game = game;

		this.__options  = [];
		this.__projects = [];


		var renderer = this.game.renderer || null;
		if (renderer !== null) {

			var env = renderer.getEnvironment();

			settings.width  = env.width / 2;
			settings.height = 64;

		}


		lychee.ui.Layer.call(this, settings);

		settings = null;


		this.reset();

	};


	Class.prototype = {

		/*
		 * LAYER API
		 */

		reset: function() {

			lychee.ui.Layer.prototype.reset.call(this);


			var entity = null;
			var width  = this.width;
			var height = this.height;


			entity = new lychee.ui.Select({
				font:    this.game.fonts.normal,
				options: [
					'Scene Editor ',
					'Entity Editor',
					'Font Editor  '
				],
				value:   'Scene Editor',
				width:   256,
				position: {
					x: 1/2 * width - 128 - 24,
					y: 0
				}
			});

			entity.bind('change', function(value) {
				var state = value.split(' ')[0].toLowerCase();
				this.trigger('change', [ state ]);
			}, this);

			this.addEntity(entity);

		}

	};


	return Class;

});

