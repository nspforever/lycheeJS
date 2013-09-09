
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


		this.font         = settings.style + ' ' + settings.size + 'px ' + '"' + settings.font + '"';
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

	var _render_outline = function(settings, charset, widthmap, offset) {

		offset = typeof offset === 'number' ? offset : 0;


		this.font         = settings.style + ' ' + settings.size + 'px ' + '"' + settings.font + '"';
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



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game) {

		this.game     = game;
		this.renderer = this.game.renderer || null;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		set: function(data) {

			this.settings = lychee.extendsafe({
				outline:      0,
				outlinecolor: '#000000'
				charset:      [ 32, 127 ]
			}, data);

		},

		generate: function() {

			var settings = this.settings;


			var charset = [];
			for (var c = settings.charset[0]; c < settings.charset[1]; c++) {
				charset.push(String.fromCharCode(c));
			}


			var measurements = _measure_font.call(_ctx, settings, charset);


			// 1. Measure the approximate canvas dimensions
			var width    = measurements.width;
			var height   = measurements.height;
			var widthmap = measurements.widthmap;


			var buffer = _create_buffer.call(this, this.renderer, width, height);

			if (settings.outline > 0) {
				_render_outline.call(buffer.getContext('2d'), settings, charset, widthmap);
			}

		}

	};


	return Class;

});

