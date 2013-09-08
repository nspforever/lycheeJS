
lychee.define('game.state.Scene').requires([
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
		 * MODULE API
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

