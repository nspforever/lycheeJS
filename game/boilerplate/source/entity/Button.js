
lychee.define('game.entity.Button').includes([
	'lychee.ui.Button'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data, game) {

		var settings = lychee.extend({}, data);


		this.game = game || null;

		this.background = null;


		this.setBackground(settings.background);

		delete settings.background;


		lychee.ui.Button.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {

			this.game.changeState('menu');

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Button.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Button';

			var settings = data['arguments'][0];


			if (this.background !== null) settings.background = this.background;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			var position = this.position;


			lychee.ui.Button.prototype.render.call(this, renderer, offsetX, offsetY);


			var background = this.background;
			if (background !== null) {

				var position = this.position;

				var cx = position.x + offsetX;
				var cy = position.y + offsetY;


				renderer.drawBox(
					cx - this.width  / 2,
					cy - this.height / 2,
					cx + this.width  / 2,
					cy + this.height / 2,
					background,
					true
				);

			}

		},



		/*
		 * CUSTOM API
		 */

		setBackground: function(background) {

			background = typeof background === 'string' ? background : null;


			if (
				   background !== null
				&& background.match(/(#[AaBbCcDdEeFf0-9]{6})/)
			) {

				this.background = background;

				return true;

			}


			return false;

		}

	};


	return Class;

});

