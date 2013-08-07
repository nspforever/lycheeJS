
lychee.define('game.net.client.MultiPlayerService').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, game) {

	var Class = function(client) {

		this.__playerId = null;


		this.client = client;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * SERVICE API
		 */

		getId: function() {
			return 'MultiPlayerService';
		},



		/*
		 * CUSTOM API
		 */

		enter: function(data) {

		}

	};


	return Class;

});

