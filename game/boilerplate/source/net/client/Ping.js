
lychee.define('game.net.client.Ping').includes([
	'lychee.net.Service'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _on_pong = function(data) {

		data.pongstop = new Date();

		var pingdelta = data.pingstop.valueOf() - data.pingstart.valueOf();
		var pongdelta = data.pongstop.valueOf() - data.pongstart.valueOf();


		pingdelta = parseInt(pingdelta + '', 10);
		pongdelta = parseInt(pongdelta + '', 10);


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
					pingstart: new Date()
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

