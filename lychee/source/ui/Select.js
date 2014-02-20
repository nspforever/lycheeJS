
lychee.define('lychee.ui.Select').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.font    = null;
		this.options = [];
		this.value   = '';

		this.__pulse = {
			active:   false,
			duration: 250,
			start:    null,
			alpha:    0.0,
			height:   { from: 0, to: 0 },
			position: { from: 0, to: 0 }
		};


		this.setFont(settings.font);
		this.setOptions(settings.options);
		this.setValue(settings.value);

		delete settings.font;
		delete settings.options;
		delete settings.value;


		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;
		settings.width  = typeof settings.width === 'number'  ? settings.width  : 128;
		settings.height = typeof settings.height === 'number' ? settings.height : 64;


		lychee.ui.Entity.call(this, settings);


		if (this.value === '') {
			this.setValue(this.options[0] || null);
		}



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function(id, position, delta) {

			if (this.options.length === 0) return;


			if (this.state === 'active') {

				var index = -1;

				var elh = this.height / (1 + this.options.length);
				var y   = (position.y + this.height / 2 - elh);
				if (y > 0) {
					index = (y / elh) | 0;
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

		deserialize: function(blob) {

			var font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}

		},

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lyche.ui.Select';

			var settings = data['arguments'][0];
			var blob     = data['blob'] = (data['blob'] || {});


			if (this.options.length !== 0) settings.options = [].slice.call(this.options, 0);
			if (this.value !== '')         settings.value   = this.value;


			if (this.font !== null) blob.font = this.font.serialize();


			return data;

		},

		update: function(clock, delta) {

			var pulse = this.__pulse;
			if (pulse.active === true) {

				if (pulse.start === null) {
					pulse.start = clock;
				}

				var t = (clock - pulse.start) / pulse.duration;
				if (t <= 1) {

					pulse.alpha = (1 - t) * 0.6;

					var height   = pulse.height;
					var position = pulse.position;

					this.height     = height.from   + t * (height.to - height.from);
					this.position.y = position.from + t * (position.to - position.from);

				} else {

					pulse.alpha  = 0.0;
					pulse.active = false;

					this.height     = pulse.height.to;
					this.position.y = pulse.position.to;

				}

			}


			lychee.ui.Entity.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;

			var color  = this.state === 'active' ? '#33b5e5' : '#0099cc';
			var color2 = this.state === 'active' ? '#0099cc' : '#575757';


			var hwidth  = (this.width  - 2) / 2;
			var hheight = (this.height - 2) / 2;


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
				y + hheight,
				x + hwidth,
				y + hheight,
				color2,
				2
			);

			renderer.drawTriangle(
				x + hwidth - 14,
				y + hheight,
				x + hwidth,
				y + hheight - 14,
				x + hwidth,
				y + hheight,
				color2,
				true
			);


			var pulse = this.__pulse;
			if (pulse.active === true) {

				renderer.setAlpha(pulse.alpha);

				renderer.drawBox(
					x - hwidth,
					y - hheight,
					x + hwidth,
					y + hheight,
					color,
					true
				);

				renderer.setAlpha(1.0);

			}



			var font  = this.font;
			var state = this.state;


			if (state === 'default') {

				if (font !== null) {

					renderer.drawText(
						x,
						y,
						this.value,
						font,
						true
					);

				}

			} else if (state === 'active') {

				var elh = this.height / (1 + this.options.length);
				var y1  = y - this.height / 2;


				if (font !== null) {

					renderer.setAlpha(0.3);

					renderer.drawText(
						x,
						y1 + elh / 2,
						this.value,
						font,
						true
					);

					renderer.setAlpha(1.0);


					var options = this.options;
					for (var o = 0, ol = options.length; o < ol; o++) {

						if (options[o] === this.value) {

							renderer.setAlpha(0.6);

							renderer.drawBox(
								x  - hwidth,
								y1 + (o + 1) * elh,
								x  + hwidth,
								y1 + (o + 1) * elh + elh,
								color,
								true
							);

							renderer.setAlpha(1.0);

						}

						renderer.drawText(
							x,
							y1 + (o + 1) * elh + elh / 2,
							options[o],
							font,
							true
						);

					}

				}

			}

		},



		/*
		 * CUSTOM ENTITY API
		 */

		setState: function(id) {

			var result = lychee.ui.Entity.prototype.setState.call(this, id);
			if (result === true) {

				var pulse = this.__pulse;


				if (id === 'default') {

					var ol  = 1 + this.options.length;
					var elh = this.height / ol;


					pulse.alpha  = 0.0;
					pulse.start  = null;
					pulse.active = true;

					pulse.position.from = this.position.y;
					pulse.position.to   = this.position.y - (ol - 1) * elh / 2;
					pulse.height.from   = this.height;
					pulse.height.to     = elh;

				} else if (id === 'active') {

					var ol  = 1 + this.options.length;
					var elh = this.height;


					pulse.alpha  = 0.6;
					pulse.start  = null;
					pulse.active = true;

					pulse.position.from = this.position.y;
					pulse.position.to   = this.position.y + (ol - 1) * elh / 2;
					pulse.height.from   = this.height;
					pulse.height.to     = ol * elh;

				}

			}


			return result;

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

