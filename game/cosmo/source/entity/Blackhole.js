
lychee.define('game.entity.Blackhole').includes([
	'lychee.game.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"];


	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		this.health = Infinity;
		this.points = 500;
		this.type   = 'blackhole';


		settings.texture = _texture;
		settings.map     = _config.map;
		settings.state   = "default";
		settings.states  = _config.states;

		settings.radius    = _config.radius;
		settings.collision = lychee.game.Entity.COLLISION.A;
		settings.shape     = lychee.game.Entity.SHAPE.circle;


		lychee.game.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		update: function(clock, delta, config) {

			lychee.game.Sprite.prototype.update.call(this, clock, delta);


			var position = this.position;
			var velocity = this.velocity;

			position.y += config.scrolly;


			var hwidth = this.width / 2;
			var minx   = -1/2 * config.width;
			var maxx   =  1/2 * config.width;

			if (position.x < minx + hwidth) {
				position.x = minx + hwidth;
				velocity.x = -1 * velocity.x;
			}

			if (position.x > maxx - hwidth) {
				position.x = maxx - hwidth;
				velocity.x = -1 * velocity.x;
			}


			var radius = this.radius;

			var entities = config.entities;
			for (var e = 0, el = entities.length; e < el; e++) {

				var oentity   = entities[e];
				var otype     = oentity.type;


				if (
					   otype === 'ship'
					|| otype === 'lazer'
				) {

					var oposition = oentity.position;
					var ovelocity = oentity.velocity;

					var distx   = (position.x - oposition.x);
					var disty   = (position.y - oposition.y);
					var gravity = 0;

					var inxrange = distx > -2 * radius && distx < 2 * radius;
					var inyrange = disty > -2 * radius && disty < 2 * radius;

					if (
						(
							   otype === 'ship'
							&& inxrange === true
							&& inyrange === true
						) || (
							   otype === 'lazer'
							&& inxrange === true
							&& inyrange === true
						)
					) {

						var dx = distx / (2 * radius);

						gravity = Math.pow(dx, 2);

						if (distx < 0) gravity = -1 * gravity;

						ovelocity.x += gravity * 160;

					}

				}

			}

		}

	};


	return Class;

});

