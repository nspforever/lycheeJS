
lychee.define('game.state.Font').requires([
	'lychee.ui.Button',
	'lychee.ui.Input',
	'lychee.ui.Slider',
	'game.state.Base',
	'game.entity.ui.Sidebar',
	'game.entity.ui.Widget'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global) {

	var _base = game.state.Base;

	var _sidebar = game.entity.ui.Sidebar;
	var _widget  = game.entity.ui.Widget;


	/*
	 * HELPERS
	 */

	var _create_widget = function(property, label, entity) {

		property = typeof property === 'string' ? property : null;


		if (property !== null) {

			var widget = new _widget({
				width:  this.width - this.margin * 4,
				margin: this.margin,
				reflow: {
					x: false,
					y: true
				}
			});


			if (label !== null) {

				label.width = widget.width - widget.margin * 2;
				widget.addEntity(label);

			}

			if (entity !== null) {

				entity.width = widget.width - widget.margin * 2;
				widget.addEntity(entity);

				entity.bind('touch', function() {
					this.relayout(true);
				}, widget);

			}


			this.addEntity(widget);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.reset();

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		reset: function() {

			_base.reset.call(this);


			var settings = this.getLayer('ui').getEntity('settings');


			_create_widget.call(
				settings,
				'family',
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

			_create_widget.call(
				settings,
				'style',
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

			_create_widget.call(
				settings,
				'size',
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

			_create_widget.call(
				settings,
				'spacing',
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

			_create_widget.call(
				settings,
				'outline',
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

			_create_widget.call(
				settings,
				'color',
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

			_create_widget.call(
				settings,
				'outlinecolor',
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

