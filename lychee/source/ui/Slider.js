
lychee.define('lychee.ui.Slider').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _refresh_drag = function(x, y) {

		var type   = this.type;
		var width  = this.width;
		var height = this.height;
		var index  = 0;


		if (type === Class.TYPE.horizontal) {
			index = Math.max(0.0, Math.min(1.0,     (x + width  / 2) / width));
		} else if (type === Class.TYPE.vertical) {
			index = Math.max(0.0, Math.min(1.0, 1 - (y + height / 2) / height));
		}


		var range = this.range;
		var value = index * (range.to - range.from);

		if (range.from < 0) {
			value += range.from;
		}

		value = ((value / range.delta) | 0) * range.delta;


		var result = this.setValue(value);
		if (result === true) {
			this.trigger('change', [ value ]);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.range = { from: 0, to: 1, delta: 0.001 };
		this.type  = Class.TYPE.horizontal;
		this.value = 0;

		this.__drag = { x: 0, y: 0 };
		this.__pulse = {
			active:   false,
			duration: 250,
			start:    null,
			alpha:    0.0
		};


		this.setRange(settings.range);
		this.setType(settings.type);
		this.setValue(settings.value);

		delete settings.range;
		delete settings.type;
		delete settings.value;


		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;
		settings.width  = typeof settings.width === 'number'  ? settings.width  : 128;
		settings.height = typeof settings.height === 'number' ? settings.height : 128;


		lychee.ui.Entity.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function(id, position, delta) {
			_refresh_drag.call(this, position.x, position.y);
		}, this);

		this.bind('swipe', function(id, state, position, delta, swipe) {
			_refresh_drag.call(this, position.x, position.y);
		}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {
			this.setState('default');
		}, this);


		settings = null;

	};


	Class.TYPE = {
		horizontal: 0,
		vertical:   1
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) { },

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lyche.ui.Slider';

			var settings = data['arguments'][0];


			if (this.type !== Class.TYPE.horizontal) settings.type   = this.type;
			if (this.value !== 0)                    settings.value  = this.value;

			if (
				   this.range.from !== 0
				|| this.range.to !== 1
				|| this.range.delta !== 0.001
			) {

				settings.range = {};

				if (this.range.from !== 0)      settings.range.from  = this.range.from;
				if (this.range.to !== 1)        settings.range.to    = this.range.to;
				if (this.range.delta !== 0.001) settings.range.delta = this.range.delta;

			}


			return data;

		},

		update: function(clock, delta) {

			var pulse = this.__pulse;
			if (pulse.active === true) {

				if (pulse.start === null) {
					pulse.start = clock;
				}

				var t = (clock - pulse.start) / pulse.duration;
				if (t <= 1) {
					pulse.alpha = (1 - t) * 0.6;
				} else {
					pulse.alpha  = 0.0;
					pulse.active = false;
				}

			}


			lychee.ui.Entity.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;

			var color  = this.state === 'active' ? '#33b5e5' : '#0099cc';
			var color2 = this.state === 'active' ? '#0099cc' : '#575757';
			var alpha  = this.state === 'active' ? 0.6       : 0.3;


			var drag    = this.__drag;
			var pulse   = this.__pulse;
			var hwidth  = this.width / 2;
			var hheight = this.height / 2;

			var x1 = x - hwidth;
			var y1 = y - hheight;
			var x2 = x + hwidth;
			var y2 = y + hheight;


			var type = this.type;
			if (type === Class.TYPE.horizontal) {

				renderer.drawLine(
					x1,
					y,
					x + drag.x,
					y,
					color2,
					2
				);

				renderer.drawLine(
					x + drag.x,
					y,
					x2,
					y,
					'#575757',
					2
				);


				if (pulse.active === true) {

					renderer.setAlpha(pulse.alpha);

					renderer.drawTriangle(
						x1,
						y,
						x + drag.x,
						y - 14,
						x + drag.x,
						y + 14,
						color,
						true
					);

					renderer.setAlpha(1.0);

				}

			} else if (type === Class.TYPE.vertical) {

				renderer.drawLine(
					x,
					y2,
					x,
					y + drag.y,
					color2,
					2
				);

				renderer.drawLine(
					x,
					y + drag.y,
					x,
					y1,
					'#575757',
					2
				);


				if (pulse.active === true) {

					renderer.setAlpha(pulse.alpha);

					renderer.drawTriangle(
						x,
						y2,
						x - 14,
						y + drag.y,
						x + 14,
						y + drag.y,
						color,
						true
					);

					renderer.setAlpha(1.0);

				}

			}


			renderer.setAlpha(alpha);

			renderer.drawCircle(
				x + drag.x,
				y + drag.y,
				14,
				color,
				true
			);

			renderer.setAlpha(1.0);


			renderer.drawCircle(
				x + drag.x,
				y + drag.y,
				4,
				color,
				true
			);

		},



		/*
		 * CUSTOM API
		 */

		setRange: function(range) {

			if (range instanceof Object) {

				this.range.from  = typeof range.from === 'number'  ? range.from  : this.range.from;
				this.range.to    = typeof range.to === 'number'    ? range.to    : this.range.to;
				this.range.delta = typeof range.delta === 'number' ? range.delta : this.range.delta;

				return true;

			}


			return true;

		},

		setState: function(id) {

			var result = lychee.ui.Entity.prototype.setState.call(this, id);
			if (result === true) {

				var pulse = this.__pulse;


				if (id === 'active') {

					pulse.alpha  = 0.6;
					pulse.start  = null;
					pulse.active = true;

				}


				return true;

			}


			return false;

		},

		setType: function(type) {

			if (lychee.enumof(Class.TYPE, type) === true) {

				this.type = type;

				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = typeof value === 'number' ? value : null;


			if (value !== null) {

				var range = this.range;
				var index = (value - range.from) / (range.to - range.from);

				var type   = this.type;
				var width  = this.width;
				var height = this.height;


				if (type === Class.TYPE.horizontal) {

					this.__drag.x = width * index - (width / 2);
					this.__drag.y = 0;

				} else if (type === Class.TYPE.vertical) {

					this.__drag.x = 0;
					this.__drag.y = height * (1 - index) - (height / 2);

				}


				this.value = value;

				return true;

			}


			return false;

		}

	};


	return Class;

});

