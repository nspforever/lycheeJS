
lychee.define('game.entity.ui.VideoLayer').requires([

]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		lychee.ui.Layer.call(this, settings);

		settings = null;


		this.reset();

	};


	Class.prototype = {

	};


	return Class;

});

