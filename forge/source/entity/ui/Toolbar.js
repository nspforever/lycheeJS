
lychee.define('game.entity.ui.Toolbar').requires([
	'lychee.ui.Button',
	'lychee.ui.Switch'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var _widget = game.entity.ui.Widget;


	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		lychee.ui.Layer.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {}, this);


		this.reset();

		settings = null;

	};


	Class.prototype = {

		/*
		 * LAYER API
		 */

		reset: function() {

			var tool = new lychee.ui.Select({
			})

			this.addEntity()


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

