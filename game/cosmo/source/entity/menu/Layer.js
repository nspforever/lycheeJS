
lychee.define('game.entity.menu.Layer').includes([
	'lychee.ui.Layer'
]).requires([
	'lychee.ui.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _config  = attachments["json"];
	var _texture = attachments["png"];


	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		lychee.ui.Layer.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.setEntity('background', new lychee.ui.Sprite({
			texture: _texture,
			map:     _config.map,
			state:   settings.state || 'default',
			states:  _config.states,
			width:   _config.width,
			height:  _config.height
		}));


		settings = null;

	};


	Class.prototype = {

		serialize: function() {

			var data = lychee.ui.Layer.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.menu.Layer';


			return data;

		}

	};


	return Class;

});

