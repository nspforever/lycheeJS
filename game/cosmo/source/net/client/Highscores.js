
lychee.define('game.net.client.Highscores').includes([
	'lychee.net.Service'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _sync_service = function(data) {
	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client) {

		this.game = client.game;

		lychee.net.Service.call(this, 'highscores', client, lychee.net.Service.TYPE.client);


		this.bind('sync',   _sync_service,   this);

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		sync: function() {

			if (this.tunnel !== null) {

				this.tunnel.send({
				}, {
					id:     this.id,
					method: 'sync'
				});

			}

		}

	};


	return Class;

});

