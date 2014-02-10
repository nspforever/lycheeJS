
lychee.define('game.entity.menu.Layer').includes([
	'lychee.ui.Layer',
	'lychee.ui.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _config  = attachments["json"];
	var _texture = attachments["png"];


	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		lychee.ui.Layer.call(this, settings);


		settings.texture = _texture;
		settings.map     = _config.map;
		settings.states  = _config.states;

		settings.width  = _config.width;
		settings.height = _config.height;
		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;


		lychee.ui.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		deserialize: function(blob) {

			lychee.ui.Sprite.prototype.deserialize.call(this, blob);
			lychee.ui.Layer.prototype.deserialize.call(this, blob);

		},

		serialize: function() {

			var data = lychee.ui.Layer.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.menu.Layer';


			return data;

		},

		update: function(clock, delta) {

			lychee.ui.Sprite.prototype.update.call(this, clock, delta);
			lychee.ui.Layer.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;

			lychee.ui.Sprite.prototype.render.call(this, renderer, offsetX, offsetY);
			lychee.ui.Layer.prototype.render.call(this, renderer, offsetX, offsetY);

		}

	};


	return Class;

});

