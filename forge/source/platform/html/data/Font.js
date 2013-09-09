
lychee.define('game.data.Font').tags({
	platform: 'html'
}).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * FEATURE DETECTION
	 */

	var _ctx = null;

	(function(canvas) {

		_ctx = canvas.getContext('2d');

	})(document.createElement('canvas'));



	/*
	 * HELPERS
	 */

	var _create_buffer = function(renderer, width, height) {

		width  = width || 0;
		height = height || 0;


		var buffer = null;

		if (renderer !== null) {
			buffer = renderer.createBuffer(width, height)
		}


		return buffer;

	};

	var _measure_font = function(settings, charset) {

		var width    = settings.spacing;
		var height   = settings.size * 3;
		var widthmap = [];


		this.font         = settings.style + ' ' + settings.size + 'px ' + '"' + settings.family + '"';
		this.textBaseline = 'top';


		for (var c = 0; c < charset.length; c++) {

			var m = this.measureText(charset[c]);
			var w = Math.max(1, Math.ceil(m.width)) + settings.outline * 2;

			widthmap.push(w);
			width += w + settings.spacing * 2;

		}


		return {
			width:    width,
			height:   height,
			widthmap: widthmap
		};

	};

	var _measure_baseline = function(settings, charset, widthmap, x1, y1, x2, y2) {

		x1 = typeof x1 === 'number' ? x1 : 0;
		y1 = typeof y1 === 'number' ? y1 : 0;
		x2 = typeof x2 === 'number' ? x2 : 0;
		y2 = typeof y2 === 'number' ? y2 : 0;


		var data      = this.getImageData(x1, y1, x2, y2);
		var baselines = [];
		var margin    = settings.spacing;

		for (var c = 0; c < charset.length; c++) {

			var baseline = y2;

			for (var x = margin; x < margin + widthmap[c]; x++) {

				for (var y = y1; y < (y2 - y1) / 2; y++) {

					if (baseline > y) {

						if (data.data[y * (y2 - y1) * 4 + x * 4 + 3]) {
							baseline = y;
							break;
						}

					}

				}

			}


			baselines.push(baseline);

			margin += widthmap[c] + settings.spacing * 2;

		}


		var rating = {};
		for (var b = 0; b < baselines.length; b++) {

			if (rating[baselines[b]] === undefined) {
				rating[baselines[b]] = 0;
			} else {
				rating[baselines[b]]++;
			}

		}


		var amount  = 0;
		var current = 0;

		for (var r in rating) {

			var baseline = parseInt(r, 10);

			if (rating[r] > amount) {
				amount  = rating[r];
				current = baseline;
			} else if (
				rating[r] === current
				&& baseline < current
			) {
				current = baseline;
			}

		}


		return current;

	};

	var _measure_margin = function(x1, y1, x2, y2) {

		x1 = typeof x1 === 'number' ? x1 : 0;
		y1 = typeof y1 === 'number' ? y1 : 0;
		x2 = typeof x2 === 'number' ? x2 : 0;
		y2 = typeof y2 === 'number' ? y2 : 0;


		var margin = {
			top:    0,
			bottom: 0
		};


		var data  = this.getImageData(x1, y1, x2, y2);
		var x     = 0;
		var y     = 0;
		var found = false;


		for (y = y1; y < y2; y++) {

			found = false;

			for (x = x1; x < x2; x++) {

				if (data.data[y * (y2 - y1) * 4 + x * 4 + 3]) {
					found = true;
					break;
				}

			}

			if (found === true) {
				margin.top = y;
				break;
			}

		}


		for (y = y2 - 1; y >= 0; y--) {

			found = false;

			for (x = x1; x < x2; x++) {

				if (data.data[y * (y2 - y1) * 4 + x * 4 + 3]) {
					found = true;
					break;
				}

			}

			if (found === true) {
				margin.bottom = y + 1;
				break;
			}

		}


		return margin;

	};

	var _render_outline = function(settings, charset, widthmap, offset) {

		offset = typeof offset === 'number' ? offset : 0;


		this.font         = settings.style + ' ' + settings.size + 'px ' + '"' + settings.family + '"';
		this.textBaseline = 'top';
		this.fillStyle    = settings.outlinecolor;


		var outline = settings.outline;
		var margin  = settings.spacing;

		for (var c = 0; c < charset.length; c++) {

			for (var x = -1 * outline; x <= outline; x++) {

				for (var y = -1 * outline; y <= outline; y++) {

					this.fillText(
						charset[c],
						margin + x,
						offset + y
					);

				}

			}

			margin += widthmap[c] + settings.spacing * 2;

		}

	};

	var _render_font = function(settings, charset, widthmap, offset) {

		offset = typeof offset === 'number' ? offset : 0;


		this.font         = settings.style + ' ' + settings.size + 'px ' + '"' + settings.family + '"';
		this.textBaseline = 'top';
		this.fillStyle    = settings.color;


		var margin = settings.spacing;

		for (var c = 0; c < charset.length; c++) {

			this.fillText(
				charset[c],
				margin,
				offset
			);

			margin += widthmap[c] + settings.spacing * 2;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(state) {

		this.renderer = state.renderer || null;

		this.settings = {
			family:       'Ubuntu Mono',
			style:        'normal',
			size:         32,
			spacing:      8,
			outline:      0,
			color:        '#ffffff',
			outlinecolor: '#000000',
			charset:      [ 32, 127 ]
		};


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		generate: function() {

			var settings = this.settings;


			var charset = [];
			for (var c = settings.charset[0]; c < settings.charset[1]; c++) {
				charset.push(String.fromCharCode(c));
			}


			/*
			 * 1. Measure approximate canvas dimensions
			 */

			var measurements = _measure_font.call(_ctx, settings, charset);
			var width        = measurements.width;
			var height       = measurements.height;
			var widthmap     = measurements.widthmap;


			/*
			 * 2. Render Font + Outline
			 */

			var buffer = _create_buffer.call(this, this.renderer, width, height);

			if (settings.outline > 0) {

				_render_outline.call(
					buffer.getContext('2d'),
					settings,
					charset,
					widthmap,
					settings.size
				);

			}

			_render_font.call(
				buffer.getContext('2d'),
				settings,
				charset,
				widthmap,
				settings.size
			);


			/*
			 * 3. Measure font dimensions
			 * 4. Render Font + Outline again
			 */

			var margin = _measure_margin.call(buffer.getContext('2d'), 0, 0, width, height);
			if (margin.top > 0 || margin.bottom > 0) {

				var h  = height - margin.top - (height - margin.bottom);
				height = h;
				buffer = _create_buffer.call(this, this.renderer, width, height);

				if (settings.outline > 0) {

					_render_outline.call(
						buffer.getContext('2d'),
						settings,
						charset,
						widthmap,
						settings.size - margin.top
					);

				}

				_render_font.call(
					buffer.getContext('2d'),
					settings,
					charset,
					widthmap,
					settings.size - margin.top
				);

			}


			/*
			 * 5. Measure Baseline
			 */

			var baseline = _measure_baseline.call(
				buffer.getContext('2d'),
				settings,
				charset,
				widthmap,
				0,
				0,
				width,
				height
			);


			/*
			 * Export Settings
			 */

			var data = {
				texture:    null,
				lineheight: buffer.height,
				map:        widthmap,
				baseline:   baseline,
				charset:    charset.join(''),
				kerning:    0,
				spacing:    settings.spacing
			};


			var that    = this;
			var texture = new Texture(buffer.toDataURL('image/png'));

			texture.onload = function() {

				data.texture = this;
				that.trigger('ready', [ data ]);

			};

			texture.load();

		}

	};


	return Class;

});

