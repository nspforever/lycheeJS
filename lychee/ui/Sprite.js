
lychee.define('lychee.ui.Sprite').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.frame   = 0;
		this.texture = null;

		this.__animation = {
			active:   false,
			start:    null,
			frames:   0,
			duration: 0,
			loop:     false
		};
		this.__map = {};


		this.setAnimation(settings.animation);
		this.setTexture(settings.texture);
		this.setMap(settings.map);

		delete settings.texture;
		delete settings.map;


		lychee.ui.Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lyche.game.Sprite';

			var settings = data['arguments'][0];


			if (this.__animation.active === true) {

				settings.animation = {};

				if (this.__animation.duration !== 1000) settings.animation.duration = this.__animation.duration;
				if (this.frame !== 0)                   settings.animation.frame    = this.frame;
				if (this.__animation.frames !== 25)     settings.animation.frames   = this.__animation.frames;
				if (this.__animation.loop !== false)    settings.animation.loop     = true;

			}

			if (Object.keys(this.__map).length > 0) {

				settings.map = {};


				for (var stateId in this.__map) {

					settings.map[stateId] = [];


					var frames = this.__map[stateId];
					for (var f = 0, fl = frames.length; f < fl; f++) {

						var frame  = frames[f];
						var sframe = {};

						if (frame.x !== 0) sframe.x = frame.x;
						if (frame.y !== 0) sframe.y = frame.y;
						if (frame.w !== 0) sframe.w = frame.w;
						if (frame.h !== 0) sframe.h = frame.h;


						settings.map.push(sframe);

					}

				}

			}


			return data;

		},

		sync: function(clock, force) {

			force = force === true;


			if (force === true) {
				this.__clock = clock;
			}


			if (this.__clock === null) {

				if (this.__animation.active === true && this.__animation.start === null) {
					this.__animation.start = clock;
				}

			}

			lychee.ui.Entity.prototype.sync.call(this, clock, force);

		},

		render: function(renderer, offsetX, offsetY) {

			var texture = this.texture;
			if (texture !== null) {

				var position = this.position;

				var map = this.getMap();
				if (map !== null) {

					var x1 = position.x + offsetX - map.w / 2;
					var y1 = position.y + offsetY - map.h / 2;

					renderer.drawSprite(
						x1,
						y1,
						texture,
						map
					);

				} else {

					var hw = (this.width / 2)  || this.radius;
					var hh = (this.height / 2) || this.radius;

					var x1 = position.x + offsetX - hw;
					var y1 = position.y + offsetY - hh;

					renderer.drawSprite(
						x1,
						y1,
						texture
					);

				}

			}

		},

		update: function(clock, delta) {

			lychee.ui.Entity.prototype.update.call(this, clock, delta);


			var animation = this.__animation;

			// 1. Animation (Interpolation)
			if (
				animation.active === true
				&& animation.start !== null
			) {

				var t = (this.__clock - animation.start) / animation.duration;

				if (t <= 1) {

					this.frame = Math.max(0, Math.ceil(t * animation.frames) - 1);

				} else {

					if (animation.loop === true) {
						animation.start = this.__clock;
					} else {
						this.frame = animation.frames - 1;
						animation.active = false;
					}

				}

			}

		},



		/*
		 * CUSTOM API
		 */

		setAnimation: function(settings) {

			if (settings instanceof Object) {

				var duration = typeof settings.duration === 'number' ? settings.duration : 1000;
				var frame    = typeof settings.frame === 'number'    ? settings.frame    : 0;
				var frames   = typeof settings.frames === 'number'   ? settings.frames   : 25;
				var loop     = settings.loop === true;


				var animation = this.__animation;

				animation.start    = this.__clock;
				animation.active   = true;
				animation.duration = duration;
				animation.frames   = frames;
				animation.loop     = loop;

				this.frame = frame;

				return true;

			}


			return false;

		},

		clearAnimation: function() {
			this.__animation.active = false;
			this.frame = 0;
		},

		setState: function(id) {

			var result = lychee.game.Entity.prototype.setState.call(this, id);
			if (result === true) {

				var map = this.__map[this.state] || null;
				if (map !== null) {

					if (map instanceof Array) {

						var statemap = this.getStateMap();
						if (statemap !== null && statemap instanceof Object) {

							this.clearAnimation();

							if (statemap.animation === true) {

								this.setAnimation({
									duration: statemap.duration || 1000,
									frame:    0,
									frames:   map.length,
									loop:     statemap.loop === true
								});

							}

						}


						map = map[0];

					}


					if (map.width !== undefined && typeof map.width === 'number') {
						this.width = map.width;
					}

					if (map.height !== undefined && typeof map.height === 'number') {
						this.height = map.height;
					}

					if (map.radius !== undefined && typeof map.radius === 'number') {
						this.radius = map.radius;
					}

				}

			}


			return result;

		},

		setTexture: function(texture) {

			if (
				   texture instanceof Texture
				|| texture === null
			) {

				this.texture = texture;

				return true;

			}


			return false;

		},

		getMap: function() {

			var state = this.state;
			var frame = this.frame;

			if (
				   this.__map[state] instanceof Array
				&& this.__map[state][frame] != null
			) {

				return this.__map[state][frame];

			}


			return null;

		},

		setMap: function(map) {

			var valid = false;

			if (map instanceof Object) {

				for (var stateId in map) {

					var frames = map[stateId];
					if (frames instanceof Array) {

						this.__map[stateId] = [];


						for (var f = 0, fl = frames.length; f < fl; f++) {

							var frame = frames[f];
							if (frame instanceof Object) {

								frame.x = typeof frame.x === 'number' ? frame.x : 0;
								frame.y = typeof frame.y === 'number' ? frame.y : 0;
								frame.w = typeof frame.w === 'number' ? frame.w : 0;
								frame.h = typeof frame.h === 'number' ? frame.h : 0;


								this.__map[stateId].push(frame);

							}

						}


						valid = true;

					}

				}

			}


			return valid;

		}

	};


	return Class;

});

