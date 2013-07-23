
lychee.define('game.entity.ui.lycheeJS').includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = {
		width:  256,
		height: 48
	};


	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		settings.texture = _texture;

		settings.width     = _config.width;
		settings.height    = _config.height;


		lychee.ui.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

	};


	return Class;

});

