
lychee.define('game.entity.ui.Toolbar').requires([
	'lychee.ui.Button',
	'lychee.ui.Switch'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var _widget = game.entity.ui.Widget;


	var Class = function(game, settings) {

		if (settings === undefined) {
			settings = {};
		}


		this.game = game;


		lychee.ui.Layer.call(this, settings);

		settings = null;


		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {}, this);


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

console.log('TOOLBAR WIDTH', width);


			entity = new lychee.ui.Switch({
				font:    this.game.fonts.normal,
				options: [ 'Camera', 'Cursor', 'Grid' ],
				value:   'Camera',
				width:   3 * 128,
				type:    lychee.ui.Switch.TYPE.horizontal
			});

			entity.bind('change', function(value) {
				var tool = value.toLowerCase();
				this.trigger('change', [ tool ]);
			}, this);

			this.addEntity(entity);

		},



		/*
		 * ENTITY API
		 */

		render: function(renderer, offsetX, offsetY) {

			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;


			var hwidth  = this.width / 2;
			var hheight = this.height / 2;

			renderer.drawBox(
				x - hwidth,
				y - hheight,
				x + hwidth,
				y + hheight,
				'#282828',
				true
			);


			lychee.ui.Layer.prototype.render.call(this, renderer, offsetX, offsetY);

		}

	};


	return Class;

});

