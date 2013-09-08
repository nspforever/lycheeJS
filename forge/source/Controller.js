
lychee.define('game.Controller').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(game) {

		this.game = game;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {
	};


	return Class;

});

