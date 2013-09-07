
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


		var range = this.__range;
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


		this.font  = null;
		this.type  = Class.TYPE.horizontal;
		this.value = 0;

		this.__drag   = { x: 0, y: 0 };
		this.__range  = { from: 0, to: 1, delta: 0.001 };
		this.__width  = typeof settings.width === 'number'  ? settings.width  : 140;
		this.__height = typeof settings.height === 'number' ? settings.height : 140;


		this.setFont(settings.font);
		this.setRange(settings.range);
		this.setType(settings.type);
		this.setValue(settings.value);

		delete settings.font;
		delete settings.range;
		delete settings.type;
		delete settings.value;


		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;
		settings.width  = this.width;
		settings.height = this.height;


		lychee.ui.Entity.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function(id, position, delta) {
			_refresh_drag.call(this, position.x, position.y);
		}, this);

		this.bind('swipe', function(id, type, position, delta, swipe) {
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

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lyche.ui.Slider';

			var settings = data['arguments'][0];


			if (this.font !== null)                  settings.font   = this.font.serialize();
			if (this.type !== Class.TYPE.horizontal) settings.type   = this.type;
			if (this.value !== 0)                    settings.value  = this.value;
			if (this.__width !== 140)                settings.width  = this.__width;
			if (this.__height !== 140)               settings.height = this.__height;

			if (
				   this.__range.from !== 0
				|| this.__range.to !== 1
				|| this.__range.delta !== 0.001
			) {

				settings.range = {};

				if (this.__range.from !== 0)      settings.range.from  = this.__range.from;
				if (this.__range.to !== 1)        settings.range.to    = this.__range.to;
				if (this.__range.delta !== 0.001) settings.range.delta = this.__range.delta;

			}


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;

			var color = this.state === 'active' ? '#33b5e5' : '#0099cc';
			var alpha = this.state === 'active' ? 0.7       : 0.3;


			var type    = this.type;
			var drag    = this.__drag;
			var hwidth  = this.width / 2;
			var hheight = this.height / 2;


			if (type === Class.TYPE.horizontal) {

				renderer.drawLine(
					x - hwidth,
					y,
					x + drag.x,
					y,
					color,
					2
				);

				renderer.drawLine(
					x + drag.x,
					y,
					x + hwidth,
					y,
					'#575757',
					2
				);

			} else if (type === Class.TYPE.vertical) {

				renderer.drawLine(
					x,
					y + hheight,
					x,
					y + drag.y,
					color,
					2
				);

				renderer.drawLine(
					x,
					y + drag.y,
					x,
					y - hheight,
					'#575757',
					2
				);

			}


			renderer.drawCircle(
				x + drag.x,
				y + drag.y,
				4,
				color,
				true
			);

			renderer.setAlpha(alpha);

			renderer.drawCircle(
				x + drag.x,
				y + drag.y,
				14,
				color,
				true
			);

			renderer.setAlpha(1.0);

		},



		/*
		 * CUSTOM API
		 */

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.font = font;

				return true;

			}


			return false;

		},

		setRange: function(range) {

			if (range instanceof Object) {

				this.__range.from  = typeof range.from === 'number'  ? range.from  : this.__range.from;
				this.__range.to    = typeof range.to === 'number'    ? range.to    : this.__range.to;
				this.__range.delta = typeof range.delta === 'number' ? range.delta : this.__range.delta;

				return true;

			}


			return true;

		},

		setType: function(type) {

			if (typeof type !== 'number') return false;


			var found = false;

			for (var id in Class.TYPE) {

				if (type === Class.TYPE[id]) {
					found = true;
					break;
				}

			}


			if (found === true) {

				if (type === Class.TYPE.horizontal) {
					this.width  = this.__width;
					this.height = 28;
				} else if (type === Class.TYPE.vertical) {
					this.width  = 28;
					this.height = this.__height;
				}

				this.type = type;

			}


			return found;

		},

		setValue: function(value) {

			value = typeof value === 'number' ? value : null;


			if (value !== null) {

				var range = this.__range;
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


				this.__value = value;

				return true;

			}


			return false;

		}

	};


	return Class;

});

