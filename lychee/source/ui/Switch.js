
lychee.define('lychee.ui.Switch').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _refresh = function(x, y) {

		var type   = this.type;
		var width  = this.width;
		var height = this.height;
		var index  = 0;


		if (type === Class.TYPE.horizontal) {
			var segw = width  / this.options.length;
			index    = ((x + width  / 2) / segw) | 0;
		} else if (type === Class.TYPE.vertical) {
			var segh = height / this.options.length;
			index    = ((y + height / 2) / segh) | 0;
		}


		if (index >= 0) {

			var value = this.options[index] || null;
			if (
				   value !== null
				&& value !== this.value
			) {

				var result = this.setValue(value);
				if (result === true) {
					this.trigger('change', [ this.value ]);
				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.font    = null;
		this.options = [ 'on', 'off' ];
		this.type    = Class.TYPE.horizontal;
		this.value   = 'off';

		this.__width  = typeof settings.width === 'number'  ? settings.width  : 140;
		this.__height = typeof settings.height === 'number' ? settings.height : 140;


		this.setFont(settings.font);
		this.setOptions(settings.options);
		this.setType(settings.type);
		this.setValue(settings.value);

		delete settings.font;
		delete settings.options;
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
			_refresh.call(this, position.x, position.y);
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

		deserialize: function(blob) {

			var font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}

		},

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.Button';

			var settings = data['arguments'][0];
			var blob     = data['blob'] = (data['blob'] || {});


			if (this.options.length !== 0)           settings.options = [].slice.call(this.options, 0);
			if (this.type !== Class.TYPE.horizontal) settings.type    = this.type;
			if (this.value !== '')                   settings.value   = this.value;
 			if (this.__width !== 140)                settings.width   = this.__width;
			if (this.__height !== 140)               settings.height  = this.__height;


			if (this.font !== null) blob.font = this.font.serialize();


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var position = this.position;

			var ox = position.x + offsetX;
			var oy = position.y + offsetY;

			var color   = this.state === 'active' ? '#0099cc' : '#575757';
			var color2  = this.state === 'active' ? '#33b5e5' : '#0099cc';
			var alpha   = this.state === 'active' ? 0.6       : 0.3;
			var hwidth  = this.width / 2;
			var hheight = this.height / 2;


			var font = this.font;
			if (font !== null) {

				var x1 = ox - hwidth;
				var x2 = ox - hwidth;
				var y1 = oy - hheight;
				var y2 = oy - hheight;


				var options = this.options;
				var value   = this.value;

				var type = this.type;
				if (type === Class.TYPE.horizontal) {

					renderer.drawLine(
						ox - hwidth,
						oy + hheight,
						ox + hwidth,
						oy + hheight,
						color,
						2
					);


					var segw = (this.width / options.length) | 0;

					x2 += segw;
					y2 += hheight * 2;

					for (var o = 0, ol = options.length; o < ol; o++) {

						var text = options[o];
						if (text === value) {

							renderer.setAlpha(alpha);

							renderer.drawBox(
								x1,
								y1,
								x2,
								y2,
								color2,
								true
							);

							renderer.setAlpha(1.0);

							renderer.drawTriangle(
								x2 - 14,
								y2,
								x2,
								y2 - 14,
								x2,
								y2,
								color,
								true
							);

						}

						renderer.drawText(
							x1 + segw / 2,
							y1 + hheight,
							text,
							font,
							true
						);

						x1 += segw;
						x2 += segw;

					}


				} else if (type === Class.TYPE.vertical) {

					renderer.drawLine(
						ox + hwidth,
						oy - hheight,
						ox + hwidth,
						oy + hheight,
						color,
						2
					);


					var segh = (this.height / options.length) | 0;

					x2 += hwidth * 2;
					y2 += segh;

					for (var o = 0, ol = options.length; o < ol; o++) {

						var text = options[o];
						if (text === value) {

							renderer.setAlpha(alpha);

							renderer.drawBox(
								x1,
								y1,
								x2,
								y2,
								color2,
								true
							);

							renderer.setAlpha(1.0);

							renderer.drawTriangle(
								x2 - 14,
								y2,
								x2,
								y2 - 14,
								x2,
								y2,
								color,
								true
							);

						}

						renderer.drawText(
							x1 + hwidth,
							y1 + segh / 2,
							text,
							font,
							true
						);

						y1 += segh;
						y2 += segh;

					}

				}

			}

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

		setOptions: function(options) {

			if (options instanceof Array) {

				var filtered = [];

				for (var o = 0, ol = options.length; o < ol; o++) {
					filtered.push(options[o] + '');
				}

				this.options = filtered;

				return true;

			}


			return false;

		},

		setType: function(type) {

			if (lychee.enumof(Class.TYPE, type) === true) {

				if (type === Class.TYPE.horizontal) {
					this.width  = this.__width;
					this.height = 28;
				} else if (type === Class.TYPE.vertical) {
					this.width  = 140;
					this.height = this.__height;
				}

				this.type = type;


				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (
				   value !== null
				&& this.options.indexOf(value) !== -1
			) {

				this.value = value;

				return true;

			}


			return false;

		}

	};


	return Class;

});

