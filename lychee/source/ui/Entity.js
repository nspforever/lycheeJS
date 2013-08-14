
lychee.define('lychee.ui.Entity').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global) {

	var _default_state  = 'default';
	var _default_states = { 'default': null, 'active': null };



	/*
	 * HELPERS
	 */

	var _validate_enum = function(enumobject, value) {

		if (typeof value !== 'number') return false;


		var found = false;

		for (var id in enumobject) {

			if (value === enumobject[id]) {
				found = true;
				break;
			}

		}


		return found;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.width  = typeof settings.width  === 'number' ? settings.width  : 0;
		this.height = typeof settings.height === 'number' ? settings.height : 0;
		this.depth  = 0;
		this.radius = typeof settings.radius === 'number' ? settings.radius : 0;

		this.shape    = Class.SHAPE.rectangle;
		this.state    = _default_state;
		this.position = { x: 0, y: 0 };
		this.visible  = true;

		this.__clock  = null;
		this.__states = _default_states;
		this.__cache  = {
			tween: { x: 0, y: 0 }
		};
		this.__tween  = {
			active:       false,
			type:         Class.TWEEN.linear,
			start:        null,
			duration:     0,
			fromposition: { x: 0, y: 0 },
			toposition:   { x: 0, y: 0 }
		};


		if (settings.states instanceof Object) {

			this.__states = { 'default': null, 'active': null };

			for (var id in settings.states) {

				if (settings.states.hasOwnProperty(id)) {
					this.__states[id] = settings.states[id];
				}

			}

		}


		this.setShape(settings.shape);
		this.setState(settings.state);
		this.setPosition(settings.position);
		this.setTween(settings.tween);
		this.setVisible(settings.visible);


		lychee.event.Emitter.call(this);

		settings = null;

	};


	// Same ENUM values as lychee.game.Entity
	Class.SHAPE = {
		circle:    0,
		rectangle: 2
	};


	Class.TWEEN = {
		linear:        0,
		easein:        1,
		easeout:       2,
		bounceeasein:  3,
		bounceeaseout: 4
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var settings = {};


			if (this.width  !== 0) settings.width  = this.width;
			if (this.height !== 0) settings.height = this.height;
			if (this.radius !== 0) settings.radius = this.radius;

			if (this.shape !== Class.SHAPE.rectangle) settings.shape   = this.shape;
			if (this.state !== _default_state)        settings.state   = this.state;
			if (this.__states !== _default_states)    settings.states  = this.__states;
			if (this.visible !== true)                settings.visible = this.visible;


			if (
				   this.position.x !== 0
				|| this.position.y !== 0
			) {

				settings.position = {};

				if (this.position.x !== 0) settings.position.x = this.position.x;
				if (this.position.y !== 0) settings.position.y = this.position.y;

			}


			return {
				'constructor': 'lychee.ui.Entity',
				'arguments':   [ settings ]
			};

		},

		sync: function(clock) {

			if (this.__clock === null) {

				if (this.__tween.active === true && this.__tween.start === null) {
					this.__tween.start = clock;
				}

				this.__clock = clock;

			}

		},

		// HINT: Renderer skips if no render() method exists
		// render: function(renderer, offsetX, offsetY) {},

		update: function(clock, delta) {

			// 1. Sync clocks initially
			// (if Entity was created before loop started)
			if (this.__clock === null) {
				this.sync(clock);
			}


			var tween = this.__tween;

			// 2. Tweening
			if (
				   tween.active === true
				&& tween.start !== null
			) {

				var t = (this.__clock - tween.start) / tween.duration;

				if (t <= 1) {

					var type = tween.type;
					var from = tween.fromposition;
					var to   = tween.toposition;

					var dx = to.x - from.x;
					var dy = to.y - from.y;


					var cache = this.__cache.tween;

					if (type === Class.TWEEN.linear) {

						cache.x = from.x + t * dx;
						cache.y = from.y + t * dy;

					} else if (type === Class.TWEEN.easein) {

						var f = 1 * Math.pow(t, 3);

						cache.x = from.x + f * dx;
						cache.y = from.y + f * dy;

					} else if (type === Class.TWEEN.easeout) {

						var f = Math.pow(t - 1, 3) + 1;

						cache.x = from.x + f * dx;
						cache.y = from.y + f * dy;

					} else if (type === Class.TWEEN.bounceeasein) {

						var k = 1 - t;
						var f;

						if ((k /= 1) < ( 1 / 2.75 )) {
							f = 1 * ( 7.5625 * Math.pow(k, 2) );
						} else if (k < ( 2 / 2.75 )) {
							f = 7.5625 * ( k -= ( 1.5 / 2.75 )) * k + .75;
						} else if (k < ( 2.5 / 2.75 )) {
							f = 7.5625 * ( k -= ( 2.25 / 2.75 )) * k + .9375;
						} else {
							f = 7.5625 * ( k -= ( 2.625 / 2.75 )) * k + .984375;
						}

						cache.x = from.x + (1 - f) * dx;
						cache.y = from.y + (1 - f) * dy;

					} else if (type === Class.TWEEN.bounceeaseout) {

						var f;

						if ((t /= 1) < ( 1 / 2.75 )) {
							f = 1 * ( 7.5625 * Math.pow(t, 2) );
						} else if (t < ( 2 / 2.75 )) {
							f = 7.5625 * ( t -= ( 1.5 / 2.75 )) * t + .75;
						} else if (t < ( 2.5 / 2.75 )) {
							f = 7.5625 * ( t -= ( 2.25 / 2.75 )) * t + .9375;
						} else {
							f = 7.5625 * ( t -= ( 2.625 / 2.75 )) * t + .984375;
						}

						cache.x = from.x + f * dx;
						cache.y = from.y + f * dy;

					}


					this.setPosition(cache);

				} else {

					this.setPosition(tween.toposition);
					tween.active = false;

				}

			}


			this.__clock = clock;

		},



		/*
		 * CUSTOM API
		 */

		setShape: function(shape) {

			if (typeof shape !== 'number') return false;


			var found = false;

			for (var id in Class.SHAPE) {

				if (shape === Class.SHAPE[id]) {
					found = true;
					break;
				}

			}


			if (found === true) {
				this.shape = shape;
			}


			return found;

		},

		getStateMap: function() {
			return this.__states[this.state];
		},

		setState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.__states[id] !== undefined) {

				this.state = id;

				return true;

			}


			return false;

		},

		setPosition: function(position) {

			if (position instanceof Object) {

				this.position.x = typeof position.x === 'number' ? position.x : this.position.x;
				this.position.y = typeof position.y === 'number' ? position.y : this.position.y;

				return true;

			}


			return false;

		},

		setTween: function(settings) {

			if (settings instanceof Object) {

				var tween = this.__tween;

				tween.type     = _validate_enum(Class.TWEEN, settings.type) ? settings.type     : Class.TWEEN.linear;
				tween.duration = typeof settings.duration === 'number'      ? settings.duration : 1000;

				if (settings.position instanceof Object) {
					tween.toposition.x = typeof settings.position.x === 'number' ? settings.position.x : this.position.x;
					tween.toposition.y = typeof settings.position.y === 'number' ? settings.position.y : this.position.y;
				}

				tween.fromposition.x = this.position.x;
				tween.fromposition.y = this.position.y;

				tween.start  = this.__clock;
				tween.active = true;


				return true;

			}


			return false;

		},

		clearTween: function() {
			this.__tween.active = false;
		},

		setVisible: function(visible) {

			if (visible === true || visible === false) {

				this.visible = visible;

				return true;

			}


			return false;

		}

	};


	return Class;

});

