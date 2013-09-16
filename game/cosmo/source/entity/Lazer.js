
lychee.define('game.entity.Lazer').includes([
	'lychee.game.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"];


	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		this.owner     = null;
		this.ownertype = null;
		this.type      = 'lazer';


		settings.texture = _texture;
		settings.states  = _config.states;
		settings.map     = _config.map;

		settings.width     = _config.width;
		settings.height    = _config.height;
		settings.collision = lychee.game.Entity.COLLISION.A;
		settings.shape     = lychee.game.Entity.SHAPE.rectangle;


		lychee.game.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		deserialize: function(blob) {

		},

		serialize: function() {

			var data = lychee.game.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Lazer';

			var settings = data['arguments'][0];
			var blob     = data['blob'] = (data['blob'] || {});


			// TODO: blob integration


			return data;

		},

		setOwner: function(owner) {

			this.owner     = owner;
			this.ownertype = owner.type;

		}

	};


	return Class;

});

