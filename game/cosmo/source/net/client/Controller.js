
lychee.define('game.net.client.Controller').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, game) {

	var Class = function(client) {

		this.id      = 'controller';
		this.client  = client;
		this.session = null;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * SERVICE API
		 */

		init: function() {
			this.trigger('init', []);
		},



		/*
		 * CUSTOM API
		 */

	};


	return Class;

});

