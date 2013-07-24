
lychee.define('tool.FontGenerator').tags({
	platform: 'html'
}).requires([
	'ui.Main'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global) {

	var Class = function(canvas) {

		this.__canvas = canvas instanceof HTMLCanvasElement ? canvas : document.createElement('canvas');
		this.__ctx = this.__canvas.getContext('2d');

		lychee.event.Emitter.call(this, 'fonttool');

	};


	Class.prototype = {

		defaults: {
			font: 'Ubuntu',
			size: 32,
			color: '#933',
			style: 'normal',
			spacing: 1,
			outline: 1,
			outlineColor: '#000',
			firstChar: 32,
			lastChar: 127
		},

		__updateFont: function(font, style, size) {

			this.__ctx.font = style + ' ' + size + 'px ' + '"' + font + '"';
			this.__ctx.textBaseline = 'top';

		},

		__clear: function() {
			this.__ctx.clearRect(0, 0, this.__canvas.width, this.__canvas.height);
		},

		__render: function(charset, widthMap, spacing, offsetY, color) {

			spacing = typeof spacing === 'number' ? spacing : 0;
			offsetY = typeof offsetY === 'number' ? offsetY : 0;

			this.__ctx.fillStyle = color;

			for (var c = 0, margin = spacing; c < charset.length; c++) {
				this.__ctx.fillText(charset[c], margin, offsetY);
				margin += widthMap[c] + spacing * 2;
			}

		},

		__renderOutline: function(charset, widthMap, outline, spacing, offsetY, color) {

			offsetY = typeof offsetY === 'number' ? offsetY : 0;
			outline = typeof outline === 'number' ? outline : 0;

			this.__ctx.fillStyle = color;


			for (var c = 0, margin = spacing; c < charset.length; c++) {

				for (var x = -1 * outline; x <= outline; x++) {
					for (var y = -1 * outline; y <= outline; y++) {
						this.__ctx.fillText(charset[c], margin + x, offsetY + y);
					}
				}

				margin += widthMap[c] + spacing * 2;

			}

		},

		__getBaseline: function(charset, widthMap, spacing) {

			var width = this.__canvas.width,
				height = this.__canvas.height;

			var baselines = [],
				data = this.__ctx.getImageData(0, 0, width, height);


			for (var c = 0, margin = spacing; c < charset.length; c++) {

				var baseline = height;

				for (var x = margin; x < margin + widthMap[c]; x++) {

					for (var y = 0; y < height / 2; y++) {

						if (
							data.data[y * width * 4 + x * 4 + 3]
							&& baseline > y
						) {
							baseline = y;
							break;
						}

					}

				}

				baselines.push(baseline);

				margin += widthMap[c] + spacing * 2;

			}


			var rating = {};
			for (var b = 0; b < baselines.length; b++) {

				if (rating[baselines[b]] === undefined) {
					rating[baselines[b]] = 0;
				} else {
					rating[baselines[b]]++;
				}

			}


			var currentAmount = 0;
			var currentBaseline = 0;
			for (var r in rating) {

				var baseline = parseInt(r, 10);

				if (rating[r] > currentAmount) {
					currentAmount = rating[r];
					currentBaseline = baseline;
				} else if (rating[r] === currentAmount && baseline < currentBaseline) {
					currentBaseline = baseline;
				}

			}


			return currentBaseline;

		},

		__getMargin: function() {

			var width = this.__canvas.width,
				height = this.__canvas.height;


			var data = this.__ctx.getImageData(0, 0, width, height);

			var margin = {
				top: 0,
				bottom: 0
			};

			var x, y, found = false;
			for (y = 0; y < height; y++) {

				found = false;

				for (x = 0; x < width; x++) {
					if (data.data[y * width * 4 + x * 4 + 3]) {
						found = true;
						break;
					}
				}

				if (found === true) {
					margin.top = y;
					break;
				}

			}


			for (y = height - 1; y >= 0; y--) {

				found = false;

				for (x = 0; x < width; x++) {
					if (data.data[y * width * 4 + x * 4 + 3]) {
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

		},

		export: function(data) {

			var settings = lychee.extend({}, this.defaults, data);

			var charset = [];
			for (var c = settings.firstChar; c < settings.lastChar; c++) {
				charset.push(String.fromCharCode(c));
			}


			this.__updateFont(settings.font, settings.style, settings.size);


			// 1. Measure the approximate the canvas dimensions
			var width = settings.spacing,
				widthMap = [];

			for (var i = 0; i < charset.length; i++) {

				var m = this.__ctx.measureText(charset[i]);
				var charWidth = Math.max(1, Math.ceil(m.width)) + settings.outline * 2;

				widthMap.push(charWidth);
				width += charWidth + settings.spacing * 2;

			}


			// 2. Render it the first time to find out character heights
			this.__canvas.width = width;
			this.__canvas.height = settings.size * 3;
			this.__updateFont(settings.font, settings.style, settings.size);

			this.__clear();

			if (settings.outline > 0) {
				this.__renderOutline(charset, widthMap, settings.outline, settings.spacing, settings.size, settings.outlineColor);
			}

			this.__render(charset, widthMap, settings.spacing, settings.size, settings.color);


			// 3. Rerender everything if we know that the font size differed from the actual height
			var margin = this.__getMargin();
			if (margin.top > 0 || margin.bottom > 0) {

				var height = this.__canvas.height;
				this.__canvas.height = height - margin.top - (height - margin.bottom);
				this.__updateFont(settings.font, settings.style, settings.size);

				this.__clear();

				if (settings.outline > 0) {
					this.__renderOutline(charset, widthMap, settings.outline, settings.spacing, settings.size - margin.top, settings.outlineColor);
				}

				this.__render(charset, widthMap, settings.spacing, settings.size - margin.top, settings.color);

			}


			// 4. Detect the Baseline
			var baseline = this.__getBaseline(charset, widthMap, settings.spacing);


			// 5. Export settings
			var exported = {
				texture:    this.__canvas.toDataURL('image/png'),
				lineheight: this.__canvas.height,
				map:        widthMap,
				baseline:   baseline,
				charset:    charset.join(''),
				kerning:    0,
				spacing:    settings.spacing
			};


			this.trigger('ready', [ exported ]);

		}

	};


	return Class;

});

