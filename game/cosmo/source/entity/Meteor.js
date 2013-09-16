
lychee.define('game.entity.Meteor').includes([
	'lychee.game.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"];


	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		this.health = 200;
		this.points = this.health;
		this.type   = 'meteor';


		settings.texture = _texture;
		settings.map     = _config.map;
		settings.state   = Math.random() > 0.5 ? 'rotation-right' : 'rotation-left';
		settings.states  = {
			'default':        _config.states['default'],
			'rotation-right': {
				animation: true,
				duration:  (2000 + Math.random() * 4000) | 0,
				loop:      true
			},
			'rotation-left': {
				animation: true,
				duration:  (2000 + Math.random() * 4000) | 0,
				loop:      true
			}
		};

		settings.radius    = _config.radius;
		settings.collision = lychee.game.Entity.COLLISION.A;
		settings.shape     = lychee.game.Entity.SHAPE.circle;


		lychee.game.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			this.setHealth(blob.health);

		},

		serialize: function() {

			var data = lychee.game.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Meteor';

			var settings = data['arguments'][0];
			var blob     = data['blob'] = (data['blob'] || {});


			if (this.health !== 200) blob.health = this.health;


			return data;

		},

		update: function(clock, delta, config) {

			lychee.game.Sprite.prototype.update.call(this, clock, delta);


			var position = this.position;
			var velocity = this.velocity;

			position.y += config.scrolly;


			var hwidth = this.width / 2;
			var minx   = -1/2 * config.width;
			var maxx   =  1/2 * config.width;

			if (position.x < minx + hwidth) {
				position.x = minx + hwidth;
				velocity.x = -1 * velocity.x;
			}

			if (position.x > maxx - hwidth) {
				position.x = maxx - hwidth;
				velocity.x = -1 * velocity.x;
			}

		},



		/*
		 * CUSTOM API
		 */

		setHealth: function(value) {

			value = typeof value === 'number' ? value : null;

			if (value !== null) {
				this.health = value;
			}

		}

	};


	return Class;

});

