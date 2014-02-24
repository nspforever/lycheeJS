
lychee.define('game.entity.Ball').includes([
	'lychee.game.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _config  = attachments["json"];
	var _texture = attachments["png"];


	var Class = function(data) {

		var settings = lychee.extend({}, _config, data);


		settings.texture = _texture;


		lychee.game.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

	};


	return Class;

});
