
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


		this.width  = typeof settings.width  === 'number' ? settings.width  : 140;
		this.height = typeof settings.height === 'number' ? settings.height : 140;
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

			var color  = this.state === 'active' ? '#33b5e5' : '#0099cc';
			var color2 = this.state === 'active' ? '#0099cc' : '#575757';
			var alpha  = this.state === 'active' ? 0.6       : 0.3;


			var drag    = this.__drag;
			var hwidth  = this.width / 2;
			var hheight = this.height / 2;


			renderer.drawBox(
				x - hwidth,
				y - hheight,
				x + hwidth,
				y + hheight,
				color2,
				false,
				2
			);

			renderer.drawLine(
				x - hwidth,
				y - hheight,
				x + hwidth,
				y + hheight,
				'#575757',
				1
			);

			renderer.drawLine(
				x,
				y - hheight,
				x,
				y + hheight,
				'#575757',
				2
			);

			renderer.drawLine(
				x + hwidth,
				y - hheight,
				x - hwidth,
				y + hheight,
				'#575757',
				1
			);

			renderer.drawLine(
				x - hwidth,
				y,
				x + hwidth,
				y,
				'#575757',
				2
			);


			renderer.drawTriangle(
				x - hwidth,
				y - hheight + 14,
				x - hwidth,
				y - hheight,
				x - hwidth + 14,
				y - hheight,
				'#0099cc',
				true
			);

			renderer.drawTriangle(
				x + hwidth - 14,
				y - hheight,
				x + hwidth,
				y - hheight,
				x + hwidth,
				y - hheight + 14,
				'#0099cc',
				true
			);

			renderer.drawTriangle(
				x + hwidth,
				y + hheight - 14,
				x + hwidth,
				y + hheight,
				x + hwidth - 14,
				y + hheight,
				'#0099cc',
				true
			);

			renderer.drawTriangle(
				x - hwidth + 14,
				y + hheight,
				x - hwidth,
				y + hheight,
				x - hwidth,
				y + hheight - 14,
				'#0099cc',
				true
			);


			renderer.drawLine(
				x,
				y,
				x + drag.x,
				y,
				color,
				2
			);

			renderer.drawLine(
				x,
				y,
				x,
				y + drag.y,
				color,
				2
			);


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

