
lychee.define('lychee.ui.Switch').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

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

			this.setFont(lychee.deserialize(blob.font));

		},

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.Button';

			var settings = data['arguments'][0];
			var blob     = data['blob'] = (data['blob'] || {});


			if (this.options.length !== 0) settings.options = [].slice.call(this.options, 0);
			if (this.value !== '')         settings.value   = this.value;
 			if (this.__width !== 140)      settings.width   = this.__width;
			if (this.__height !== 140)     settings.height  = this.__height;


			if (this.font !== null) blob.font = this.font.serialize();


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var position = this.position;

			var ox = position.x + offsetX;
			var oy = position.y + offsetY;

			var color   = this.state === 'active' ? '#0099cc' : '#575757';
			var hwidth  = this.width / 2;
			var hheight = this.height / 2;


			renderer.drawLine(
				ox - hwidth,
				oy + hheight,
				ox + hwidth,
				oy + hheight,
				color,
				2
			);


			var font = this.font;
			if (font !== null) {

				var x = ox - hwidth;
				var y = oy;

				var options = this.options;
				var value   = this.value;

				var type = this.type;
				if (type === Class.TYPE.horizontal) {

					var segmentwidth = (this.width / options.length) | 0;

					for (var o = 0, ol = options.length; o < ol; o++) {

						var text = options[o];
						if (text === value) {

							renderer.setAlpha(0.6);

							renderer.drawBox(
								x,
								y - hheight,
								x + segmentwidth,
								y + hheight,
								'#33b5e5',
								true
							);

							renderer.setAlpha(1.0);

							renderer.drawTriangle(
								x + segmentwidth - 14,
								y + hheight,
								x + segmentwidth,
								y + hheight - 14,
								x + segmentwidth,
								y + hheight,
								color,
								true
							);

						}

						renderer.drawText(
							x + segmentwidth / 2,
							y,
							text,
							font,
							true
						);

						x += segmentwidth;

					}


				} else if (type === Class.TYPE.vertical) {

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

			if (_validate_enum(Class.TYPE, type) === true) {

				if (type === Class.TYPE.horizontal) {
					this.width  = this.__width;
					this.height = 28;
				} else if (type === Class.TYPE.vertical) {
					this.width  = 28;
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

