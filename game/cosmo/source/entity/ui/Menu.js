
lychee.define('game.entity.ui.Menu').includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"];


	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


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

	};


	return Class;

});

