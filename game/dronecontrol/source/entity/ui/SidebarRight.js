
lychee.define('game.entity.ui.SidebarRight').requires([
	'lychee.ui.Button',
	'lychee.ui.Joystick'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _process_flip = function(entity) {

		var animation = entity.label.toLowerCase();

		var controller = this.controller;
		if (controller !== null) {
			controller.animation('animateFlight', animation, 700);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(state, settings) {

		this.state      = state;
		this.game       = state.game;
		this.controller = this.game.controller || null;


		if (settings === undefined) {
			settings = {};
		}


		settings.width  = 192;
		settings.height = 0;
		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;

		settings.position = {
			x: 0,
			y: 0
		};


		lychee.ui.Layer.call(this, settings);

		settings = null;


		this.reset();

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		reset: function() {

			lychee.ui.Layer.prototype.reset.call(this);


			var entity = null;
			var width  = this.width;
			var height = this.height;


			var flips = [ 'flip-ahead', 'flip-behind', 'flip-left', 'flip-right' ];
			for (var f = 0, fl = flips.length; f < fl; f++) {

				var label = flips[f];

				entity = new lychee.ui.Button({
					label: label,
					font:  this.game.fonts.normal,
					position: {
						x:  0,
						y: -1/2 * height + 32 + 40 * f
					}
				});
				entity.bind('#touch', _process_flip, this);

				this.addEntity(entity);

			}


			entity = new lychee.ui.Joystick({
				width:  128,
				height: 128,
				position: {
					x: 0,
					y: 1/2 * height - 96
				}
			});
			entity.bind('change', function(value) {

				value.x = value.x * 10;
				value.x |= 0;
				value.x = value.x / 10;

				value.y = value.y * 10;
				value.y |= 0;
				value.y = value.y / 10;


				var controller = this.controller;
				if (controller !== null) {
					controller.set('yaw',    value.x);
					controller.set('heave', -value.y);
				}

			}, this);

			this.addEntity(entity);

		}

	};


	return Class;

});

