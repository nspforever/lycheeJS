
lychee.define('game.entity.ui.VideoLayer').requires([

]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _process_video = function(pngdata) {
		this.texture = new Texture(pngdata);
	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(state, settings) {

		this.state      = state;
		this.game       = state.game;
		this.controller = this.game.controller || null;

		this.font       = this.game.fonts.normal;
		this.texture    = null;


		if (settings === undefined) {
			settings = {};
		}


		settings.width  = 312;
		settings.height = 312;
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


			var controller = this.controller;
			if (controller !== null) {
				controller.unbind('video', _process_video, this);
				controller.bind('video',   _process_video, this);
			}

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var position = this.position;

			var ox = position.x + offsetX;
			var oy = position.y + offsetY;


			var texture = this.texture;
			if (texture !== null) {

				renderer.drawSprite(
					ox - texture.width / 2,
					oy - texture.height / 2,
					texture,
					null
				);

			} else {

				renderer.drawText(
					ox,
					oy,
					'Video Stream offline',
					this.font,
					true
				);

			}

		}

	};


	return Class;

});

