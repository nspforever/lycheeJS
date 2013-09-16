
lychee.define('game.entity.Circle').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(settings) {

		settings.shape = lychee.ui.Entity.SHAPE.circle;


		lychee.ui.Entity.call(this, settings);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Circle';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			var position = this.position;
			var radius   = this.radius;

			renderer.drawCircle(
				offsetX + position.x,
				offsetY + position.y,
				radius,
				'#ff0000',
				true
			);

		}

	};


	return Class;

});

