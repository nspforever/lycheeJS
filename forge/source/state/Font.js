
lychee.define('game.state.Font').requires([
	'game.state.Base'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global) {

	var _base = game.state.Base;


	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.reset();

	};


	Class.prototype = {

		/*
		 * MODULE INCLUSION
		 */

		createWidget: function() {
			var args = [].slice.call(arguments, 0);
			return _base.createWidget.apply(this, args);
		},



		/*
		 * STATE API
		 */

		reset: function() {

			_base.reset.call(this);


			this.createWidget(
				'settings', 'family',
				new lychee.ui.Button({
					font:  this.game.fonts.normal,
					label: 'Font Family'
				}),
				new lychee.ui.Input({
					font:  this.game.fonts.normal,
					type:  lychee.ui.Input.TYPE.text,
					value: 'Ubuntu Mono'
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
					value:   'normal'
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
					value: 32
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
					value: 8
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
					value: 1
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
					value: '#ffffff'
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
					value: '#000000'
				})
			);


var test = new lychee.ui.Textarea({
	font: this.game.fonts.normal,
	value: 'This is just a test\nfor typing\nstuff...',
	width:  140 * 3,
	height: 140
});

this.getLayer('ui').addEntity(test);

		},

		enter: function(data) {

			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});

