
lychee.define('lychee.ui.Select').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.font    = null;
		this.options = [];
		this.value   = '';


		this.setFont(settings.font);
		this.setOptions(settings.options);
		this.setValue(settings.value);

		delete settings.font;
		delete settings.options;
		delete settings.value;


		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;
		settings.width  = typeof settings.width === 'number' ? settings.width : 140;
		settings.height = 28;


		lychee.ui.Entity.call(this, settings);


		if (this.value === '') {
			this.setValue(this.options[0] || null);
		}



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function(id, position, delta) {

			// 1. Show dropdown menu
			if (this.state !== 'active') {

				this.setState('active');

			// 2. Select option from dropdown menu
			} else {

				var index = ((position.y + this.height / 2) / 28) | 0;
				if (index > 0) {

					var value = this.options[index - 1] || null;
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


				this.setState('default');

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
			data['constructor'] = 'lyche.ui.Select';

			var settings = data['arguments'][0];


			if (this.font !== null)        settings.font    = this.font.serialize();
			if (this.options.length !== 0) settings.options = [].slice.call(this.options, 0);
			if (this.value !== '')         settings.value   = this.value;
			if (this.width !== 140)        settings.width   = this.width;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;

			var color = this.state === 'active' ? '#0099cc' : '#575757';


			var font    = this.font;
			var hwidth  = this.width / 2;
			var hheight = this.height / 2;


			var state = this.state;
			if (state === 'active') {

				renderer.drawBox(
					x - hwidth,
					y - hheight,
					x + hwidth,
					y + hheight,
					'#282828',
					true
				);

				renderer.drawBox(
					x - hwidth,
					y - hheight,
					x + hwidth,
					y + hheight,
					color,
					false,
					2
				);


				var lhh  = 28 / 2;
				var cury = y - hheight + lhh;

				renderer.drawLine(
					x - hwidth,
					cury + lhh,
					x + hwidth,
					cury + lhh,
					color,
					2
				);

				renderer.drawTriangle(
					x + hwidth - 14,
					cury + lhh,
					x + hwidth,
					cury + lhh - 14,
					x + hwidth,
					cury + lhh,
					color,
					true
				);

				if (font !== null) {

					var text = this.value;

					renderer.drawText(
						x,
						cury,
						text,
						font,
						true
					);

					var options = this.options;
					for (var o = 0, ol = options.length; o < ol; o++) {

						cury += lhh * 2;

						var text = options[o];

						if (text === this.value) {

							renderer.setAlpha(0.7);

							renderer.drawBox(
								x - hwidth,
								cury - lhh,
								x + hwidth,
								cury + lhh,
								'#33b5e5',
								true
							);

							renderer.setAlpha(1.0);

						}

						renderer.drawText(
							x,
							cury,
							text,
							font,
							true
						);

					}

				}

			} else {

				renderer.drawLine(
					x - hwidth,
					y + hheight,
					x + hwidth,
					y + hheight,
					color,
					2
				);

				renderer.drawTriangle(
					x + hwidth - 14,
					y + hheight,
					x + hwidth,
					y + hheight - 14,
					x + hwidth,
					y + hheight,
					color,
					true
				);


				if (font !== null) {

					var text = this.value;

					renderer.drawText(
						x,
						y,
						text,
						font,
						true
					);

				}

			}

		},



		/*
		 * CUSTOM ENTITY API
		 */

		setState: function(id) {

			var result = lychee.ui.Entity.prototype.setState.call(this, id);
			if (result === true) {

				if (id === 'default') {

					this.position.y -= (this.height - 28) / 2;
					this.height      = 28;

				} else if (id === 'active') {

					// active value on top, then options
					var ol = 1 + this.options.length;

					this.height      = Math.max(28, ol * 28);
					this.position.y += (this.height - 28) / 2;

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

