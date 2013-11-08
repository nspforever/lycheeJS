
lychee.define('game.entity.ui.Menu').requires([
	'lychee.ui.Button',
	'lychee.ui.Select'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(game, settings) {


		lychee.ui.Layer.call(this, settings);

		settings = null;

	};


	Class.prototype = {
	};


	return Class;

});

