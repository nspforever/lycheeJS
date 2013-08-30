
lychee.define('game.net.client.Highscore').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(client) {

		this.id      = 'highscore';
		this.client  = client;


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

		update: function() {

			this.client.send({
			}, {
				id:     this.id,
				method: 'update'
			});

		}

	};


	return Class;

});

