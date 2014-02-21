
lychee.define('game.net.client.Ping').includes([
	'lychee.net.Service'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _on_pong = function(data) {

		data.pongstop = Date.now();

		var pingdelta = data.pingstop - data.pingstart;
		var pongdelta = data.pongstop - data.pongstart;


		this.trigger('statistics', [ pingdelta, pongdelta ]);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client) {

		this.game = client.game;

		lychee.net.Service.call(this, 'ping', client, lychee.net.Service.TYPE.client);


		this.bind('pong', _on_pong, this);

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		ping: function() {

			if (this.tunnel !== null) {

				this.tunnel.send({
					pingstart: Date.now()
				}, {
					id:    this.id,
					event: 'ping'
				});

				return true;

			}


			return false;

		}

	};


	return Class;

});

