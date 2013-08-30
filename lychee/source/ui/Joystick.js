
lychee.define('lychee.ui.Joystick').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _refresh_drag = function(x, y) {

		var indexx = x / (this.width / 2);
		var indexy = y / (this.height / 2);

		var value = this.value;

		value.x = indexx;
		value.y = indexy;


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


		this.width  = typeof settings.width  === 'number' ? settings.width  : 240;
		this.height = typeof settings.height === 'number' ? settings.height : 240;
		this.value  = { x: 0, y: 0 };

		this.__drag = { x: 0, y: 0 };


		this.setValue(settings.value);

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

			if (type === 'end') {
				_refresh_drag.call(this, 0, 0);
			} else {
				_refresh_drag.call(this, position.x, position.y);
			}

		}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {
			this.setState('default');
		}, this);


		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lyche.ui.Joystick';

			var settings = data['arguments'][0];


			if (this.value !== 0) settings.value = this.value;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;

			var color = this.state === 'active' ? '#ff1b1b' : '#aa1b1b';


			var drag    = this.__drag;
			var hwidth  = this.width / 2;
			var hheight = this.height / 2;


			renderer.drawBox(
				x - hwidth,
				y - hheight,
				x + hwidth,
				y + hheight,
				color,
				false,
				2
			);

			renderer.drawCircle(
				x + drag.x,
				y + drag.y,
				22,
				color,
				true
			);

		},



		/*
		 * CUSTOM API
		 */

		setValue: function(value) {

			if (value instanceof Object) {

				this.value.x = typeof value.x === 'number' ? value.x : this.value.x;
				this.value.y = typeof value.y === 'number' ? value.y : this.value.y;


				var val = 0;

				val = this.value.x;
				val = val >= -1.0 ? val : -1.0;
				val = val <=  1.0 ? val :  1.0;
				this.value.x = val;

				val = this.value.y;
				val = val >= -1.0 ? val : -1.0;
				val = val <=  1.0 ? val :  1.0;
				this.value.y = val;


				var hwidth  = this.width / 2;
				var hheight = this.height / 2;

				this.__drag.x = this.value.x * hwidth;
				this.__drag.y = this.value.y * hheight;


				return true;

			}


			return false;

		}

	};


	return Class;

});

