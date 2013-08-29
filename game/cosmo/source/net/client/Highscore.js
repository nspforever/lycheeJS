
lychee.define('game.net.client.Highscore').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, game) {

	var Class = function(client) {

		this.id      = 'Highscore';
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

		triggerupdate: function(data) {
			this.trigger('update', [ data ]);
		},

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

