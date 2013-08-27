
lychee.define('game.entity.Enemy').requires([
	'game.entity.Lazer'
]).includes([
	'lychee.game.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _config  = attachments["json"];
	var _texture = attachments["png"];
	var _lazer   = game.entity.Lazer;


	var Class = function(settings, logic) {

		if (settings === undefined) {
			settings = {};
		}


		this.logic = logic || null;


		this.health  = (200 + Math.random() * 200) | 0;
		this.points  = this.health;
		this.speedx  = 0;
		this.speedy  = 0;
		this.type    = 'enemy';
		this.weapons = [ 0, 1, 0 ];

		this.__fireclock = 0;
		this.__speed     = 0;


		settings.texture = _texture;
		settings.map     = _config.map;
		settings.states  = _config.states;

		settings.width     = _config.width;
		settings.height    = _config.height;
		settings.collision = lychee.game.Entity.COLLISION.A;
		settings.shape     = lychee.game.Entity.SHAPE.rectangle;


		lychee.game.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

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


			var logic = this.logic;
			var fire  = this.__fireclock < fire;
			if (
				   logic !== null
				&& fire === true
			) {

				var miny = -1/2 * config.height;
				var maxy =  1/2 * config.height;

				if (
					   position.y > miny
					&& position.y < maxy
				) {


					var posarray = [ { x: position.x, y: position.y }];
					var velarray = [ { x: 0, y: 200 }];


					logic.spawn(
						_lazer,
						posarray,
						velarray,
						this.type
					);

					this.__fireclock = clock + ((2000 + Math.random() * 500) | 0);

				}

			}

		},



		/*
		 * CUSTOM API
		 */

		setHealth: function(health) {

			health = typeof health === 'number' ? health : null;

			if (health !== null) {
				this.health = health;
			}

		},

		setSpeedX: function(speed) {

			speed = typeof speed === 'number' ? speed : 0;

			this.speedx = speed;

		},

		setSpeedY: function(speed) {

			speed = typeof speed === 'number' ? speed : null;

			if (speed !== null) {
				this.speedy = speed;
			} else {
				this.speedy = this.__speed;
			}

		},

		setState: function(id) {

			var result = lychee.game.Sprite.prototype.setState.call(this, id);
			if (result === true) {

				var statemap = this.getStateMap();

				var weapons = statemap.weapons;
				if (weapons instanceof Array) {
					this.weapons = weapons;
				}

				var width = statemap.width;
				if (typeof width === 'number') {
					this.width = width;
				}

				var height = statemap.height;
				if (typeof height === 'number') {
					this.height = height;
				}

				var speed = statemap.speed;
				if (typeof speed === 'number') {
					this.__speed = speed;
					this.speedy  = speed;
				}

			}

		}

	};


	return Class;

});

