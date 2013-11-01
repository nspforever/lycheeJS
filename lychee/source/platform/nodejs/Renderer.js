
lychee.define('Renderer').tags({
	platform: 'nodejs'
}).supports(function(lychee, global) {

	if (
		   typeof process !== 'undefined'
		&& process.stdout
	) {
		return true;
	}


	return false;

}).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _is_color = function(color) {

		if (
			   typeof color === 'string'
			&& color.match(/(#[AaBbCcDdEeFf0-9]{6})/)
		) {
			return true;
		}


		return false;

	};

	var _update_environment = function() {

		var env = this.__environment;


		// TODO: Determine rows and columns of TTY

		env.screen.width  = 0;
		env.screen.height = 0;

		env.offset.x = 0;
		env.offset.y = 0;

		env.width  = this.__width;
		env.height = this.__height;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(id) {

		id = typeof id === 'string' ? id : null;


		this.__id     = id;
		this.__ctx    = this.createBuffer(0, 0);
		this.__buffer = this.__ctx;

		this.__environment = {
			width:  null,
			height: null,
			screen: {},
			offset: {}
		};

		this.__cache      = {};
		this.__state      = 0;
		this.__alpha      = 1;
		this.__background = null;
		this.__width      = 0;
		this.__height     = 0;

	};


	Class.prototype = {

		/*
		 * STATE AND ENVIRONMENT MANAGEMENT
		 */

		reset: function(width, height, resetCache) {

			width      = typeof width === 'number'  ? width  : this.__width;
			height     = typeof height === 'number' ? height : this.__height;
			resetCache = resetCache === true;

			if (resetCache === true) {
				this.__cache = {};
			}


			this.__width  = width;
			this.__height = height;


			var buffer = this.__buffer;

			buffer.width  = width;
			buffer.height = height;

			this.clearBuffer(buffer);


			_update_environment.call(this);

		},

		start: function() {
			this.__state = 1;
		},

		stop: function() {
			this.__state = 0;
		},

		clear: function() {

			if (this.__state !== 1) return;

		},

		flush: function(command) {

			if (this.__state !== 1 || typeof command !== 'number') return;

		},



		/*
		 * SETTERS AND GETTERS
		 */

		isRunning: function() {
			return this.__state === 1;
		},

		getEnvironment: function() {
			return this.__environment;
		},

		setAlpha: function(alpha) {

			alpha = typeof alpha === 'number' ? alpha : null;

			if (
				   alpha !== null
				&& alpha >= 0
				&& alpha <= 1
			) {

			}

		},

		setBackground: function(color) {

			color = _is_color(color) === true ? color : '#000000';

			this.__background = color;

		},

		createBuffer: function(width, height) {

			width  = typeof width === 'number'  ? width  : 1;
			height = typeof height === 'number' ? height : 1;


			var buffer = {
				data:   [],
				width:  width,
				height: height
			};


			return buffer;

		},

		clearBuffer: function(buffer) {

			var data = [];

			for (var x = 0, x < buffer.width; x++) {

				data[x] = [];

				for (var y = 0, y < buffer.height; y++) {
					data[x][y] = ' ';
				}

			}


			buffer.data = data;

		},

		setBuffer: function(buffer) {

			if (buffer === null) {
				this.__ctx = this.__buffer;
			} else {
				this.__ctx = buffer;
			}

		},



		/*
		 * DRAWING API
		 */

		drawArc: function(x, y, start, end, radius, color, background, lineWidth) {

			if (this.__state !== 1) return;

			color      = _is_color(color) === true ? color : '#000000';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


			var ctx = this.__ctx;
			var pi2 = Math.PI * 2;


			// TODO: Implement arc-drawing ASCII art algorithm

		},

		drawBox: function(x1, y1, x2, y2, color, background, lineWidth) {

			if (this.__state !== 1) return;

			color      = _is_color(color) === true ? color : '#000000';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


			var ctx = this.__ctx;
			var x = 0;
			var y = 0;


			// top - right - bottom - left

			y = y1;
			for (x = x1; x < x2; x++) ctx.data[x][y] = '-';

			x = x2;
			for (y = y1; y < y2; y++) ctx.data[x][y] = '|';

			y = y2;
			for (x = x1; x < x2; x++) ctx.data[x][y] = '-';

			x = x1;
			for (y = y1; y < y2; y++) ctx.data[x][y] = '|';


			if (background === true) {

				for (x = x1; x < x2; x++) {

					for (y = y1; y < y2; y++) {
						ctx.data[x][y] = '+';
					}

				}

			}

		},

		drawBuffer: function(x1, y1, buffer) {

			var x2 = Math.min(x1 + buffer.width,  this.__ctx.width);
			var y2 = Math.min(y1 + buffer.height, this.__ctx.height);

			for (var x = x1; x < x2; x++) {

				for (var y = y1; y < y2; y++) {
					this.__ctx.data[x][y] = buffer[x - x1][y - y1];
				}

			}

		},

		drawCircle: function(x, y, radius, color, background, lineWidth) {

			if (this.__state !== 1) return;

			color      = _is_color(color) === true ? color : '#000000';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


			var ctx = this.__ctx;


			// TODO: Implement circle-drawing ASCII art algorithm

		},

		drawLine: function(x1, y1, x2, y2, color, lineWidth) {

			if (this.__state !== 1) return;

			color     = _is_color(color) === true ? color : '#000000';
			lineWidth = typeof lineWidth === 'number' ? lineWidth : 1;


			var ctx = this.__ctx;


			// TODO: Implement line-drawing ASCII art algorithm

		},

		drawTriangle: function(x1, y1, x2, y2, x3, y3, color, background, lineWidth) {

			if (this.__state !== 1) return;

			color      = _is_color(color) === true ? color : '#000000';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


			var ctx = this.__ctx;


			// TODO: Implement triangle-drawing ASCII art algorithm

		},

		// points, x1, y1, [ ... x(a), y(a) ... ], [ color, background, lineWidth ]
		drawPolygon: function(points, x1, y1) {

			if (this.__state !== 1) return;

			var l = arguments.length;

			if (points > 3) {

				var optargs = l - (points * 2) - 1;


				var color, background, lineWidth;

				if (optargs === 3) {

					color      = arguments[l - 3];
					background = arguments[l - 2];
					lineWidth  = arguments[l - 1];

				} else if (optargs === 2) {

					color      = arguments[l - 2];
					background = arguments[l - 1];

				} else if (optargs === 1) {

					color      = arguments[l - 1];

				}


				color      = _is_color(color) === true ? color : '#000000';
				background = background === true;
				lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


				var ctx = this.__ctx;


				// TODO: Implement polygon-drawing ASCII art algorithm

			}

		},

		drawSprite: function(x1, y1, texture, map) {

			if (this.__state !== 1) return;

			texture = texture instanceof Texture ? texture : null;
			map     = map instanceof Object      ? map     : null;


			if (texture !== null) {

				if (map === null) {

				} else {

					if (lychee.debug === true) {

						this.drawBox(
							x1,
							y1,
							x1 + map.w,
							y1 + map.h,
							'#ff0000',
							false,
							1
						);

					}

				}

			}

		},

		drawText: function(x1, y1, text, font, center) {

			if (this.__state !== 1) return;

			font   = font instanceof Font ? font : null;
			center = center === true;


			if (font !== null) {

				var baseline = font.baseline;
				var kerning  = font.kerning;

				var chr, t, l;

				if (center === true) {

					var textwidth  = 0;
					var textheight = 0;

					for (t = 0, l = text.length; t < l; t++) {
						chr = font.get(text[t]);
						textwidth += chr.real + kerning;
						textheight = Math.max(textheight, chr.height);
					}

					x1 -= textwidth / 2;
					y1 -= (textheight - baseline) / 2;

				}


				y1 -= baseline / 2;


				var margin  = 0;
				var texture = font.texture;
				if (texture !== null) {

					for (t = 0, l = text.length; t < l; t++) {

						var chr = font.get(text[t]);

						var x = x1 + margin - font.spacing;
						var y = y1;

						this.__ctx.data[x][y] = text[t];


						margin += chr.real + font.kerning;

					}

				}

			}

		},



		/*
		 * RENDERING API
		 */

		renderEntity: function(entity, offsetX, offsetY) {

			if (typeof entity.render === 'function') {

				entity.render(
					this,
					offsetX || 0,
					offsetY || 0
				);

			}

		}

	};


	return Class;

});

