
lychee.define('game.entity.Warp').includes([
	'lychee.game.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"];


	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		settings.map     = _config.map;
		settings.texture = _texture;
		settings.state   = "default";
		settings.states  = _config.states;

		settings.width   = _config.width;
		settings.height  = _config.height;
		settings.shape   = lychee.game.Entity.SHAPE.rectangle;


		lychee.game.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

	};


	return Class;

});

