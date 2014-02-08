
lychee.define('game.entity.Circle').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, game, global, attachments) {

	var _sound = attachments["snd"];


	var Class = function(data, game) {

		var settings = lychee.extend({}, data);


		this.game = game || null;

		this.color = '#888888';

		this.__clock = null;
		this.__colorfade = {
			duration: 500,
			color:    '#888888',
			radius:   0,
			start:    null,
			active:   false
		};


		this.setColor(settings.color);

		delete settings.color;


		settings.radius = 48;
		settings.shape  = lychee.ui.Entity.SHAPE.circle;


		lychee.ui.Entity.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {

			this.game.jukebox.play(_sound);


			var color = this.color;
			if (color === '#ff3333') {
				this.setColor('#33ff33', true);
			} else {
				this.setColor('#ff3333', true);
			}

		}, this);

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

		update: function(clock, delta) {

			var colorfade = this.__colorfade;
			if (colorfade.active === true) {

				if (colorfade.start === null) {
					colorfade.start = clock;
				}

				var t = (clock - colorfade.start) / colorfade.duration;
				if (t <= 1) {

					colorfade.radius = t * this.radius;

				} else {

					this.color = colorfade.color;
					colorfade.active = false;

				}

			}


			lychee.ui.Entity.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			var position = this.position;
			var radius   = this.radius;

			renderer.drawCircle(
				offsetX + position.x,
				offsetY + position.y,
				radius,
				this.color,
				true
			);


			var colorfade = this.__colorfade;
			if (colorfade.active === true) {

				renderer.drawCircle(
					offsetX + position.x,
					offsetY + position.y,
					colorfade.radius,
					colorfade.color,
					true
				);

			}

		},



		/*
		 * CUSTOM API
		 */

		setColor: function(color, fade) {

			color = typeof color === 'string' ? color : null;
			fade  = fade === true;


			if (color !== null) {

				if (fade === true) {

					var colorfade = this.__colorfade;

					colorfade.duration = 250;
					colorfade.color    = color;
					colorfade.radius   = 0;
					colorfade.start    = null;
					colorfade.active   = true;

				} else {

					this.color = color;

				}


				return true;

			}


			return false;

		}

	};


	return Class;

});

