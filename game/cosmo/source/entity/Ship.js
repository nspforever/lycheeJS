
lychee.define('game.entity.Ship').requires([
	'game.entity.Lazer',
	'game.entity.Shield'
]).includes([
	'lychee.game.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _config   = attachments["json"];
	var _textures = {
		red:   attachments["red.png"],
		green: attachments["green.png"],
		blue:  attachments["blue.png"],
	};
	var _lazer  = game.entity.Lazer;
	var _shield = game.entity.Shield;


	var Class = function(settings, logic) {

		if (settings === undefined) {
			settings = {};
		}


		this.logic  = logic || null;
		this.shield = new _shield();


		this.color   = 'red';
		this.health  = 0;
		this.speedx  = 0;
		this.speedy  = 0;
		this.type    = 'ship';
		this.weapons = [ 0, 0, 0, 1, 0, 0, 0 ];

		this.__speed   = 0;
		this.__timeout = 0;


		settings.map       = _config.map;
		settings.states    = _config.states;
		settings.texture   = _textures[color];

		settings.width     = _config.width;
		settings.height    = _config.height;
		settings.collision = lychee.game.Entity.COLLISION.A;
		settings.shape     = lychee.game.Entity.SHAPE.rectangle;


		lychee.game.Sprite.call(this, settings);

		this.setColor(settings.color);
		this.setHealth(settings.health);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			this.setHealth(blob.health);
			this.setSpeedX(blob.speedx);
			this.setSpeedY(blob.speedy);

		},

		serialize: function() {

			var data = lychee.game.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Ship';

			var settings = data['arguments'][0];
			var blob     = data['blob'] = (data['blob'] || {});


			if (this.color !== 'red') settings.color = this.color;


			if (this.health !== 200) blob.health = this.health;
			if (this.speedx !== 0)   blob.speedx = this.speedx;
			if (this.speedy !== 0)   blob.speedy = this.speedy;


			return data;

		},

		update: function(clock, delta, config) {

			lychee.game.Sprite.prototype.update.call(this, clock, delta);

			this.shield.update(clock, delta);


			var minx = Math.floor(-1/2 * config.width);
			var maxx = Math.round( 1/2 * config.width);


			var position = this.position;
			var velocity = this.velocity;

			if (position.x < minx) {
				this.speedx = 0;
				position.x  = minx;
				velocity.x  = 0;
			}

			if (position.x > maxx) {
				this.speedx = 0;
				position.x  = maxx;
				velocity.x  = 0;
			}

		},

		render: function(renderer, offsetX, offsetY) {

			lychee.game.Sprite.prototype.render.call(this, renderer, offsetX, offsetY);


			var position = this.position;

			this.shield.render(
				renderer,
				offsetX + position.x,
				offsetY + position.y
			);

		},



		/*
		 * CUSTOM API
		 */

		left: function() {

			this.velocity.x = -500;
			this.setSpeedX(-50);

		},

		right: function() {

			this.velocity.x = 500;
			this.setSpeedX(50);

		},

		stop: function() {

			this.velocity.x = 0;
			this.setSpeedX(0);

		},

		fire: function() {

			var now = Date.now();
			if (now < this.__timeout) return false;


			this.stop();

			var state = this.state;
			if (
				   state === 'default'
				|| state.substr(0, 5) === 'level'
			) {

				var logic = this.logic;
				if (logic !== null) {


					var weapons  = this.weapons;

					var cx = this.position.x;
					var cy = this.position.y;

					var posarray = [];

					if (weapons[0] !== 0) posarray.push({ x: cx +  0, y: cy +  0 });
					if (weapons[1] !== 0) posarray.push({ x: cx - 30, y: cy - 18 });
					if (weapons[2] !== 0) posarray.push({ x: cx + 30, y: cy - 18 });
					if (weapons[3] !== 0) posarray.push({ x: cx - 53, y: cy - 15 });
					if (weapons[4] !== 0) posarray.push({ x: cx + 53, y: cy - 15 });
					if (weapons[5] !== 0) posarray.push({ x: cx - 72, y: cy -  6 });
					if (weapons[6] !== 0) posarray.push({ x: cx + 72, y: cy -  6 });


					var velarray = [];

					for (var p = 0, pl = posarray.length; p < pl; p++) {
						velarray.push({ x: 0, y: -300 });
					}


					logic.spawn(
						_lazer,
						posarray,
						velarray,
						this
					);

				}

			}


			this.__timeout = now + 200;

		},

		setColor: function(color) {

			color = typeof color === 'string' ? color : null;

			if (
				color !== null
				&& _textures[color] instanceof Texture
			) {


				if (this.setTexture(_textures[color]) === true) {

					this.color = color;

					return true;

				}

			}


			return false;

		},

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

				if (id.substr(0, 7) === 'upgrade') {
					this.health = 100;
				}


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

