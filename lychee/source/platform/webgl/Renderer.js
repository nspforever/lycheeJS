
lychee.define('Renderer').tags({
	platform: 'webgl'
}).supports(function(lychee, global) {

	/*
	 * Hint for check against undefined
	 *
	 * typeof WebGLRenderingContext is:
	 * > function in Chrome, Firefox, IE11
	 * > object in Safari, Safari Mobile
	 *
	 */


	if (
		   typeof global.document !== 'undefined'
		&& typeof global.document.createElement === 'function'
		&& typeof global.WebGLRenderingContext !== 'undefined'
	) {

		var canvas = global.document.createElement('canvas');
		if (typeof canvas.getContext === 'function') {

			if (canvas.getContext('webgl') instanceof global.WebGLRenderingContext) {
				return true;
			}

		}

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


		env.screen.width  = global.innerWidth;
		env.screen.height = global.innerHeight;

		env.offset.x = this.__canvas.offsetLeft;
		env.offset.y = this.__canvas.offsetTop;

		env.width  = this.__width;
		env.height = this.__height;

	};



	/*
	 * SHADERS
	 */

	var _shaders = {
		fragment: {},
		vertex:   {}
	};

	(function(attachments) {

		for (var file in attachments) {

			var tmp = file.split('.');
			var id  = tmp[0];
			var ext = tmp[1];

			if (ext === 'fs') {
				_shaders.fragment[id] = attachments[file];
			} else if (ext === 'vs') {
				_shaders.vertex[id]   = attachments[file];
			}

		}


console.log('----- SHADERS ------');
console.log(_shaders);

	})(attachments);



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(id) {

		id = typeof id === 'string' ? id : null;


		this.__id     = id;
		this.__canvas = global.document.createElement('canvas');
		this.__ctx    = this.__canvas.getContext('webgl');

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


		if (this.__id !== null) {
			this.__canvas.id = this.__id;
		}


		if (!this.__canvas.parentNode) {
			this.__canvas.className = 'lychee-Renderer-canvas';
			global.document.body.appendChild(this.__canvas);
		}

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


			var canvas = this.__canvas;

			canvas.width  = width;
			canvas.height = height;

			canvas.style.width  = width + 'px';
			canvas.style.height = height + 'px';


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


			var gl = this.__ctx;
			var bg = this.__background;
			if (bg !== null) {

				gl.clearColor(bg[0], bg[1], bg[2], 1.0);

			} else {

				gl.clear(gl.COLOR_BUFFER_BIT);

			}

		},

		flush: function(command) {

			if (this.__state !== 1 || typeof command !== 'number') return;

			// TODO: Implement flush commands

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

				this.__alpha = alpha;

			}

		},

		setBackground: function(color) {

			color = _is_color(color) === true ? color : '#000000';

			this.__background = color;
			this.__canvas.style.backgroundColor = color;

		},

		createBuffer: function(width, height) {

			width  = typeof width === 'number'  ? width  : 1;
			height = typeof height === 'number' ? height : 1;

			var gl = this.__ctx;
			var buffer = gl.createFramebuffer();


			return buffer;

		},

		clearBuffer: function(buffer) {

			// TODO: Implement clearBuffer() for Framebuffer

		},

		setBuffer: function(buffer) {

			// TODO: Implement setBuffer() for Framebuffer

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


			// TODO: Implement arc drawing


		},

		drawBox: function(x1, y1, x2, y2, color, background, lineWidth) {

			if (this.__state !== 1) return;

			color      = _is_color(color) === true ? color : '#000000';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


			var ctx = this.__ctx;

			// TODO: Implement box drawing

		},

		drawBuffer: function(x1, y1, buffer) {

			// TODO: Implement buffer drawing

		},

		drawCircle: function(x, y, radius, color, background, lineWidth) {

			if (this.__state !== 1) return;

			color      = _is_color(color) === true ? color : '#000000';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


			var ctx = this.__ctx;

			// TODO: Implement circle drawing

		},

		drawLine: function(x1, y1, x2, y2, color, lineWidth) {

			if (this.__state !== 1) return;

			color     = _is_color(color) === true ? color : '#000000';
			lineWidth = typeof lineWidth === 'number' ? lineWidth : 1;


			var ctx = this.__ctx;


			// TODO: Implement line drawing

		},

		drawTriangle: function(x1, y1, x2, y2, x3, y3, color, background, lineWidth) {

			if (this.__state !== 1) return;

			color      = _is_color(color) === true ? color : '#000000';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


			var ctx = this.__ctx;


			// TODO: Implement triangle drawing

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


				// TODO: Implement polygon drawing

			}

		},

		drawSprite: function(x1, y1, texture, map) {

			if (this.__state !== 1) return;

			texture = texture instanceof Texture ? texture : null;
			map     = map instanceof Object      ? map     : null;


			if (texture !== null) {

				if (map === null) {

					// TODO: Implement drawSprite() without map

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

					// TODO: Implement drawSprite() with map

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

					var ctx = this.__ctx;


					ctx.globalAlpha = this.__alpha;

					for (t = 0, l = text.length; t < l; t++) {

						var chr = font.get(text[t]);

						if (lychee.debug === true) {

							this.drawBox(
								x1 + margin,
								y1,
								x1 + margin + chr.real,
								y1 + chr.height,
								'#00ff00',
								false,
								1
							);

						}

/*
 * TODO: Implement Text drawing
						ctx.drawImage(
							texture.buffer,
							chr.x,
							chr.y,
							chr.width,
							chr.height,
							x1 + margin - font.spacing,
							y1,
							chr.width,
							chr.height
						);
*/

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

