
lychee.define('game.entity.Paddle').includes([
	'lychee.game.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _config   = attachments["json"];
	var _textures = {
		player: attachments["player.png"],
		enemy:  attachments["enemy.png"]
	};


	var Class = function(data) {

		var settings = lychee.extend({}, _config, data);


		settings.texture = _textures[settings.state || 'player'];


		lychee.game.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

	};


	return Class;

});
