
lychee.define('game.state.Scene').requires([
//	'game.data.Scene',
	'game.state.Base'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global) {

	var _base = game.state.Base;


	/*
	 * HELPERS
	 */

	var _bind_entity = function(property, entity) {

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game) {

		this.scene = game.scene || null;


		lychee.game.State.call(this, game);


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

/*
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

*/
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

