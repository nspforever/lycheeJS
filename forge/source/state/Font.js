
lychee.define('game.state.Font').requires([
	'game.data.Font',
	'game.state.Base'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global) {

	var _base = game.state.Base;
	var _font = game.data.Font;


	/*
	 * HELPERS
	 */

	var _bind_entity = function(property, entity) {

		entity.bind('change', function(value) {
			this.generator.settings[property] = value;
			this.generator.generate();
		}, this);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game) {

		lychee.game.State.call(this, game);

		this.preview = new lychee.ui.Sprite({
			position: {
				x: 0, y: 0
			}
		});

		this.generator = new _font(this);
		this.generator.bind('ready', function(data) {

			this.preview.width  = data.texture.width;
			this.preview.height = data.texture.height;
			this.preview.setTexture(data.texture);

		}, this);


		this.reset();

	};


	Class.prototype = {

		/*
		 * MODULE INCLUSION
		 */

		createWidget: function() {

			var args = [].slice.call(arguments, 0);

			_bind_entity.call(this, args[1], args[3]);

			_base.createWidget.apply(this, args);

		},



		/*
		 * STATE API
		 */

		reset: function() {

			_base.reset.call(this);


			var settings = this.generator.settings;


			this.createWidget(
				'settings', 'family',
				new lychee.ui.Button({
					font:  this.game.fonts.normal,
					label: 'Font Family'
				}),
				new lychee.ui.Input({
					font:  this.game.fonts.normal,
					type:  lychee.ui.Input.TYPE.text,
					value: settings.family
				})
			);

			this.createWidget(
				'settings', 'style',
				new lychee.ui.Button({
					font:  this.game.fonts.normal,
					label: 'Font Style'
				}),
				new lychee.ui.Select({
					font:    this.game.fonts.normal,
					options: [ 'normal', 'bold', 'italic' ],
					value:   settings.style
				})
			);

			this.createWidget(
				'settings', 'size',
				new lychee.ui.Button({
					font:  this.game.fonts.normal,
					label: 'Font Size'
				}),
				new lychee.ui.Slider({
					type:  lychee.ui.Slider.TYPE.horizontal,
					range: {
						from:  1,
						to:    64,
						delta: 1
					},
					value: settings.size
				})
			);

			this.createWidget(
				'settings', 'spacing',
				new lychee.ui.Button({
					font:  this.game.fonts.normal,
					label: 'Spacing'
				}),
				new lychee.ui.Slider({
					type:  lychee.ui.Slider.TYPE.horizontal,
					range: {
						from:  1,
						to:    64,
						delta: 1
					},
					value: settings.spacing
				})
			);

			this.createWidget(
				'settings', 'outline',
				new lychee.ui.Button({
					font:  this.game.fonts.normal,
					label: 'Outline'
				}),
				new lychee.ui.Slider({
					type:  lychee.ui.Slider.TYPE.horizontal,
					range: {
						from:  0,
						to:    16,
						delta: 1
					},
					value: settings.outline
				})
			);

			this.createWidget(
				'settings', 'color',
				new lychee.ui.Button({
					font:  this.game.fonts.normal,
					label: 'Color'
				}),
				new lychee.ui.Input({
					font:  this.game.fonts.normal,
					type:  lychee.ui.Input.TYPE.color,
					value: settings.color
				})
			);

			this.createWidget(
				'settings', 'outlinecolor',
				new lychee.ui.Button({
					font:  this.game.fonts.normal,
					label: 'Outline Color'
				}),
				new lychee.ui.Input({
					font:  this.game.fonts.normal,
					type:  lychee.ui.Input.TYPE.color,
					value: settings.outlinecolor
				})
			);


			this.getLayer('ui').addEntity(this.preview);

		},

		enter: function(data) {

			this.generator.generate();

			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});

