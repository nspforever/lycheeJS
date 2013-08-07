
lychee.define('game.net.client.Multiplayer').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, game) {

	var Class = function(client) {

		this.id      = 'multiplayer';
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

		enter: function(data) {

			if (typeof data.code === 'number') {

				this.client.send({
					code: data.code,
					type: data.type || null
				}, {
					id:     this.id,
					method: 'enter'
				});

			}

		}

	};


	return Class;

});

