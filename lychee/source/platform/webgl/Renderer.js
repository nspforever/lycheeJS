
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

// TODO: REMOVE THIS SHIT

global.COUNT = 1;

	/*
	 * HELPERS
	 */

	var _programs = {};

	(function(attachments) {

		for (var file in attachments) {

			var tmp = file.split('.');
			var id  = tmp[0];
			var ext = tmp[1];


			var entry = _programs[id] || null;
			if (entry === null) {
				entry = _programs[id] = {
					fs: '',
					vs: ''
				};
			}


			if (ext === 'fs') {
				entry.fs = attachments[file];
			} else if (ext === 'vs') {
				entry.vs = attachments[file];
			}

		}

	})(attachments);



	var _init_program = function(id) {

		id = typeof id === 'string' ? id : '';


		if (_programs[id] instanceof Object) {

			var gl      = this.__ctx;
			var shader  = _programs[id];
			var program = gl.createProgram();


			var fs = gl.createShader(gl.FRAGMENT_SHADER);

			gl.shaderSource(fs, shader.fs);
			gl.compileShader(fs);

console.log(gl.getShaderInfoLog(fs));


			var vs = gl.createShader(gl.VERTEX_SHADER);

			gl.shaderSource(vs, shader.vs);
			gl.compileShader(vs);

console.log(gl.getShaderInfoLog(vs));

			gl.attachShader(program, vs);
			gl.attachShader(program, fs);
			gl.linkProgram(program);


			if (gl.getProgramParameter(program, gl.LINK_STATUS)) {

				gl.useProgram(program);

				program._uTexture  = gl.getUniformLocation(program, 'uTexture');
				program._uViewport = gl.getUniformLocation(program, 'uViewport');

				program._aPosition = gl.getAttribLocation(program,  'aPosition');
				gl.enableVertexAttribArray(program._aPosition);

				program._aTexture  = gl.getAttribLocation(program,  'aTexture');
				gl.enableVertexAttribArray(program._aTexture);


				return program;

			}

		}


		return null;

	};

	var _init_texture = function(texture) {

		if (texture instanceof Texture) {

			var gl = this.__ctx;

			if (texture._gl === undefined) {
				texture._gl = gl.createTexture();
			} else {
				// TODO: Evaluate what has to be done if texture is already used on different GPU or GL context
			}


			var max = gl.getParameter(gl.MAX_TEXTURE_SIZE);
			if (texture.width > max || texture.height > max) {
				return null;
			}


			gl.bindTexture(gl.TEXTURE_2D, texture._gl);

			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.buffer);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.CLAMP_TO_EDGE);

/*
 * TODO: Figure out why Mipmaps won't work :/
			var is_power_of_two = texture.width === texture.height && (texture.width & (texture.width - 1) === 0);
			if (is_power_of_two === true) {
				gl.generateMipmap(gl.TEXTURE_2D);
			}
*/

			gl.bindTexture(gl.TEXTURE_2D, null);


			return texture;

		}


		return null;

	};


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
	 * IMPLEMENTATION
	 */

	var Class = function(id) {

		id = typeof id === 'string' ? id : null;


		this.__id       = id;
		this.__canvas   = global.document.createElement('canvas');
		this.__ctx      = this.__canvas.getContext('webgl');
		this.__programs = {};

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


		for (var id in _programs) {
			this.__programs[id] = _init_program.call(this, id);
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
			var gl     = this.__ctx;

			canvas.width  = width;
			canvas.height = height;

			gl.viewport(0, 0, width, height);

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

				gl.clearColor(bg[0], bg[1], bg[2], bg[3]);

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


			if (this.__cache[texture.url] === undefined) {
				this.__cache[texture.url] = _init_texture.call(this, texture);
			}


			var program = this.__programs['Sprite'];

			if (
				   program !== null
				&& texture !== null
			) {

				var gl = this.__ctx;

				var tx1, ty1, tx2, ty2;
				var x2, y2;


				if (map === null) {

					x2 = x1 + texture.width;
					y2 = y1 + texture.height;

					tx1 = 0;             ty1 = 0;
					tx2 = texture.width; ty2 = texture.height;

				} else {

					x2 = x1 + map.w;
					y2 = y1 + map.h;

					tx1 = map.x;       ty1 = map.y;
					tx2 = tx1 + map.w; ty2 = ty1 + map.h;

				}


				gl.useProgram(program);
				// TODO: Evaluate if gl.activeTexture() usage is correct
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, texture._gl);

console.log('position:', x1, y1, x2, y2);
console.log('texture:',  tx1, ty1, tx2, ty2);


				// TODO: Evaluate if this can be done in reset()
				gl.uniform2f(program._uViewport, this.__width,  this.__height);


				// TODO: Bake this in the texture via Fragment Shader
				gl.uniform1i(program._uSampler, 0);
				gl.uniform2f(program._uTexture, texture.width, texture.height);


				var position = gl.createBuffer();
				var texture  = gl.createBuffer();

				gl.bindBuffer(gl.ARRAY_BUFFER, position);
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
					x1, y1,
					x2, y1,
					x2, y2,
					x1, y2
				]), gl.STATIC_DRAW);

				gl.bindBuffer(gl.ARRAY_BUFFER, texture);
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
					tx1, ty1,
					tx2, ty1,
					tx2, ty2,
					tx1, ty2
				]), gl.STATIC_DRAW);

//				gl.bindBuffer(gl.ARRAY_BUFFER, bPosition);
				gl.vertexAttribPointer(program._aPosition, 2, gl.FLOAT, false, 0, 0);
				gl.vertexAttribPointer(program._aTexture,  2, gl.FLOAT, false, 0, 0);
				gl.drawArrays(gl.TRIANGLE_STRIP, 0, 2);

/*
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
*/


if (++global.COUNT > 10) {
	this.stop();
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

