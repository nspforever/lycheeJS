
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

console.log('touch!', position);

		}, this);

		this.bind('swipe', function(id, type, position, delta, swipe) {

console.log('swipe!', position, swipe);

		}, this);


		settings = null;

	};


	Class.prototype = {

		/*
		 * GAME UI API
		 */

		relayout: function() {

			var width  = 0;
			var height = 0;
			var offset = 0;

			for (var e = 0, el = this.entities.length; e < el; e++) {

				var entity = this.entities[e];

// TODO: Reposition entities in a meaningful way. Hard to determine though.

/*
				entity.setPosition({
					y: offset + entity.height / 2
				});
*/

				width  = Math.max(width,  entity.width);
				height = Math.max(height, height + entity.height);

				offset += entity.height;

			}


			if (width > this.width) {
				this.width = width;
			}

			if (height > this.height) {
				this.height = height;
			}

console.log('SCENE relayout()', width, height);

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
				'#481818',
				true
			);

		},

		addEntity: function(entity) {

			var result = lychee.ui.Layer.prototype.addEntity.call(this, entity);
			if (result === true) {

				this.relayout();
				return true;

			}


			return false;

		},

		removeEntity: function(entity) {

			var result = lychee.ui.Layer.prototype.removeEntity.call(this, entity);
			if (result === true) {

				this.relayout();
				return true;

			}


			return false;

		}

	};


	return Class;

});

