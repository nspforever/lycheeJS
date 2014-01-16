
lychee.define('game.entity.Foreground').exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _small_triangle = {
		x1: -35, y1:  25,
		x2:   0, y2: -35,
		x3:  35, y3:  25
	};

	var _translate_matrix = function(matrix, t) {

		var mat = _small_triangle;
		var sin = Math.sin(t * 2 * Math.PI);
		var cos = Math.cos(t * 2 * Math.PI);

		var scale = Math.sin(Math.PI * t);

		matrix.x1 = (cos * mat.x1 - sin * mat.y1) * scale;
		matrix.x2 = (cos * mat.x2 - sin * mat.y2) * scale;
		matrix.x3 = (cos * mat.x3 - sin * mat.y3) * scale;

		matrix.y1 = (sin * mat.x1 + cos * mat.y1) * scale;
		matrix.y2 = (sin * mat.x2 + cos * mat.y2) * scale;
		matrix.y3 = (sin * mat.x3 + cos * mat.y3) * scale;

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
			alpha:  1.0
		};

		this.__lights_big   = [];
		this.__lights_small = [];
		this.__radar_big    = [];
		this.__radar_matrix = lychee.extend({}, _small_triangle);
		this.__radar_alpha  = 1.0;
		this.__radar_small  = [];
		this.__clock        = [];


		this.setExplosion(settings.explosion);


		delete settings.explosion;


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

				var t = (this.__clock - explosion.start) / 500;

				if (t <= 1) {

					explosion.radius = (t * 200) | 0;
					explosion.alpha  = 1.0 - t;

				} else {

					explosion.active = false;

				}

			}


			var lights_big   = [];
			var lights_small = [];
			var radar_big    = [];
			var radar_small  = [];


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

					radar_small.push(position.x);
					radar_small.push(position.y);

				}

			}


			var t = (this.__clock % 1000) / 1000;
			if (t <= 1) {
				_translate_matrix(this.__radar_matrix, t);
				this.__radar_alpha = Math.sin(t * Math.PI) * 0.5;
			}


			this.__lights_big   = lights_big;
			this.__lights_small = lights_small;
			this.__radar_big    = radar_big;
			this.__radar_small  = radar_small;
			this.__clock        = clock;

		},

		render: function(renderer, offsetX, offsetY) {

			var explosion = this.__explosion;
			if (explosion.active === true) {

				renderer.setAlpha(explosion.alpha);
				renderer.drawCircle(
					offsetX + explosion.x,
					offsetY + explosion.y,
					explosion.radius,
					'#ff0000',
					true
				);
				renderer.setAlpha(1.0);

			}


			var matrix;
			var p, pl, posarray;

			var buffer = this.__buffer;
			if (buffer !== null) {

				renderer.clearBuffer(buffer);

				renderer.setBuffer(buffer);


				// 1. Draw Fog
				renderer.drawBox(
					0,
					0,
					buffer.width,
					buffer.height,
					'#000000',
					true
				);

				renderer.__ctx.globalCompositeOperation = 'destination-out';


				// 2. Draw Explosion
				if (explosion.active === true) {

					renderer.drawLight(
						offsetX + explosion.x,
						offsetY + explosion.y,
						explosion.radius,
						'#000000ff',
						true
					);

				}


				// 3. Draw small lights (lazers)
				posarray = this.__lights_big;
				for (var p = 0, pl = posarray.length; p < pl; p += 2) {

					var x = offsetX + posarray[p];
					var y = offsetY + posarray[p + 1];

					renderer.drawLight(
						x,
						y,
						160,
						'#000000ff',
						true
					);

				}


				// 4. Draw big lights (ships and blackholes)
				posarray = this.__lights_small;
				for (var p = 0, pl = posarray.length; p < pl; p += 2) {

					var x = offsetX + posarray[p];
					var y = offsetY + posarray[p + 1];

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
				renderer.setAlpha(this.__radar_alpha);

				posarray = this.__radar_small;
				matrix   = this.__radar_matrix;
 				for (var p = 0, pl = posarray.length; p < pl; p += 2) {

					var x = offsetX + posarray[p];
					var y = offsetY + posarray[p + 1];


					renderer.drawTriangle(
						x + matrix.x1, y + matrix.y1,
						x + matrix.x2, y + matrix.y2,
						x + matrix.x3, y + matrix.y3,
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

		}

	};


	return Class;

});

