
lychee.define('game.entity.ui.Arrow').includes([
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
		settings.state   = "default";
		settings.states  = _config.states;

		settings.radius    = _config.radius;
		settings.shape     = lychee.ui.Entity.SHAPE.circle;


		lychee.ui.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

	};


	return Class;

});

