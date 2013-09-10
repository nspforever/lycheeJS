
lychee.define('game.entity.ui.Scene').includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		lychee.ui.Layer.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function(id, position, delta) {

		}, this);

		this.bind('swipe', function(id, type, position, delta, swipe) {

		}, this);


		settings = null;

	};


	Class.prototype = {

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
				'#481818',
				true
			);

		}

	};


	return Class;

});

