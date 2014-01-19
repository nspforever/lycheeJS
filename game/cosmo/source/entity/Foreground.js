
lychee.define('game.entity.Foreground').exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _explosion = [];

	(function() {

		for (var i = 0; i < 16; i++) {

			var t = i / 16;
			var sin = Math.sin(t * 2 * Math.PI);
			var cos = Math.cos(t * 2 * Math.PI);

			_explosion.push(sin * 200);
			_explosion.push(cos * 200);

		};

	})();


	var _small_triangle = [
		-35,  25,
		 0,  -35,
		 35,  25
	];

	var _translate_triangle = function(matrix, t) {

		var mat = _small_triangle;
		var sin = Math.sin(t * 2 * Math.PI);
		var cos = Math.cos(t * 2 * Math.PI);

		var scale = Math.sin(Math.PI * t);

		matrix[0] = (cos * mat[0] - sin * mat[1]) * scale;
		matrix[2] = (cos * mat[2] - sin * mat[3]) * scale;
		matrix[4] = (cos * mat[4] - sin * mat[5]) * scale;

		matrix[1] = (sin * mat[0] + cos * mat[1]) * scale;
		matrix[3] = (sin * mat[2] + cos * mat[3]) * scale;
		matrix[5] = (sin * mat[4] + cos * mat[5]) * scale;

	};

	var _translate_explosion = function(matrix, t) {

		var mat = _explosion;
 		var sin = Math.sin(t * 2 * Math.PI);
		var cos = Math.cos(t * 2 * Math.PI);

		var scale = t;

		for (var m = 0, ml = mat.length; m < ml; m += 2) {

			matrix[m]     = (cos * mat[m] - sin * mat[m + 1]) * scale;
			matrix[m + 1] = (sin * mat[m] + cos * mat[m + 1]) * scale;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}

		this.__buffer = settings.buffer || null;
		this.__width  = settings.width  || 0;
		this.__height = settings.height || 0;

		this.__clock = null;
		this.__explosion = {
			active: false,
			start:  null,
			x:      0,
			y:      0,
			radius: 0,
			alpha:  1.0,
			matrix: _explosion.slice(0)
		};
		this.__flash = {
			active:   false,
			start:    null,
			alpha:    1.0,
			duration: 500
		};
		this.__lights = {
			big:   [],
			small: []
		};
		this.__radar = {
			alpha:     1.0,
			matrix:    _small_triangle.slice(0),
			positions: []
		};


		this.setExplosion(settings.explosion);
		this.setFlash(settings.flash);


		delete settings.explosion;
		delete settings.flash;


		settings = null;

	};


	Class.prototype = {

		sync: function(clock, force) {

			force = force === true;


			if (force === true) {
				this.__clock = clock;
			}


			if (this.__clock === null) {

				if (this.__explosion.active === true && this.__explosion.start === null) {
					this.__explosion.start = clock;
				}

				if (this.__flash.active === true && this.__flash.start === null) {
					this.__flash.start = clock;
				}

				this.__clock = clock;

			}

		},

		update: function(clock, delta, config) {

			// 1. Sync clock initially
			// (if Entity was created before loop started)
			if (this.__clock === null) {
				this.sync(clock);
			}


			var explosion = this.__explosion;
			if (
				   explosion.active === true
				&& explosion.start !== null
			) {

				var t = (this.__clock - explosion.start) / 400;

				if (t <= 1) {

					_translate_explosion(explosion.matrix, t);
					explosion.radius = (t * 200) | 0;
					explosion.alpha  = 1.0 - t;

				} else {

					explosion.active = false;

				}

			}


			var flash = this.__flash;
			if (
				   flash.active === true
				&& flash.start !== null
			) {

				var t = (this.__clock - flash.start) / flash.duration;

				if (t <= 1) {

					flash.alpha = t;

				} else {

					flash.active = false;

				}

			}



			var lights = this.__lights;
			var radar  = this.__radar;


			var lights_big      = [];
			var lights_small    = [];
			var radar_positions = [];


			for (var e = 0, el = config.entities.length; e < el; e++) {

				var entity   = config.entities[e];
				var position = entity.position;

				if (
					   entity.type === 'ship'
					|| entity.type === 'blackhole'
				) {

					lights_big.push(position.x);
					lights_big.push(position.y);

				} else if (entity.type === 'lazer') {

					lights_small.push(position.x);
					lights_small.push(position.y);

				}

				if (
					   entity.type === 'enemy'
					|| entity.type === 'meteor'
				) {

					radar_positions.push(position.x);
					radar_positions.push(position.y);

				}

			}


			var t = (this.__clock % 1000) / 1000;

			if (t <= 1) {

				_translate_triangle(radar.matrix, t);
				radar.alpha = Math.sin(t * Math.PI) * 0.5;

			}


			lights.big      = lights_big;
			lights.small    = lights_small;
			radar.positions = radar_positions;

			this.__clock = clock;

		},

		render: function(renderer, offsetX, offsetY) {

			var explosion = this.__explosion;
			if (explosion.active === true) {

				renderer.setAlpha(explosion.alpha);

				var matrix = explosion.matrix;
				var x = offsetX + explosion.x;
				var y = offsetY + explosion.y;


				renderer.setAlpha(explosion.alpha);

				for (var m = 0, ml = matrix.length; m < ml; m += 4) {

					renderer.drawTriangle(
						x,                      y,
						x + matrix[m % ml],     y + matrix[m + 1 % ml],
						x + matrix[m + 2 % ml], y + matrix[m + 3 % ml],
						'#2793e6',
						true
					);

				}

				renderer.setAlpha(1.0);

			}


			var buffer = this.__buffer;
			if (buffer !== null) {

				renderer.clearBuffer(buffer);

				renderer.setBuffer(buffer);


				var flash = this.__flash;
				if (flash.active === true) {
					renderer.setAlpha(flash.alpha);
				}


				// 1. Draw Fog
				renderer.drawBox(
					0,
					0,
					buffer.width,
					buffer.height,
					'#000000',
					true
				);


				renderer.setAlpha(1.0);


				renderer.__ctx.globalCompositeOperation = 'destination-out';


				// 2. Draw Explosion light
				if (explosion.active === true) {

					renderer.drawLight(
						offsetX + explosion.x,
						offsetY + explosion.y,
						explosion.radius,
						'#000000ff',
						true
					);

				}


				var lights = this.__lights;

				// 3. Draw small lights (lazers)
				var positions = lights.big;
				for (var p = 0, pl = positions.length; p < pl; p += 2) {

					var x = offsetX + positions[p];
					var y = offsetY + positions[p + 1];

					renderer.drawLight(
						x,
						y,
						160,
						'#000000ff',
						true
					);

				}


				// 4. Draw big lights (ships and blackholes)
				var positions = lights.small;
				for (var p = 0, pl = positions.length; p < pl; p += 2) {

					var x = offsetX + positions[p];
					var y = offsetY + positions[p + 1];

					renderer.drawLight(
						x,
						y,
						40,
						'#000000ff',
						true
					);

				}

				renderer.__ctx.globalCompositeOperation = 'source-over';


				// 5. Draw small radar triangles

				var radar = this.__radar;

				renderer.setAlpha(radar.alpha);

				var positions = radar.positions;
				var matrix    = radar.matrix;
 				for (var p = 0, pl = positions.length; p < pl; p += 2) {

					var x = offsetX + positions[p];
					var y = offsetY + positions[p + 1];

					renderer.drawTriangle(
						x + matrix[0], y + matrix[1],
						x + matrix[2], y + matrix[3],
						x + matrix[4], y + matrix[5],
						'#2793e6',
						false,
						3
					);

				}

				renderer.setAlpha(1.0);


				renderer.setBuffer(null);

				renderer.drawBuffer(
					offsetX - buffer.width / 2,
					offsetY - buffer.height / 2,
					buffer
				);

			}

		},

		setExplosion: function(position) {

			if (position instanceof Object) {

				position.x = typeof position.x === 'number' ? position.x : this.__explosion.x;
				position.y = typeof position.y === 'number' ? position.y : this.__explosion.y;


				var explosion = this.__explosion;


				explosion.x     = position.x;
				explosion.y     = position.y;
				explosion.alpha = 1.0;

				explosion.start  = this.__clock;
				explosion.active = true;


				return true;

			}


			return false;

		},

		setFlash: function(duration) {

			duration = typeof duration === 'number' ? duration : 500;


			var flash = this.__flash;


			flash.alpha    = 1.0;
			flash.duration = duration;

			flash.start  = this.__clock;
			flash.active = true;

		}

	};


	return Class;

});

