
lychee.define('game.net.client.Highscore').includes([
	'lychee.net.Service'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(client) {

		lychee.net.Service.call(this, 'highscore', client, lychee.net.Service.TYPE.client);

	};


	Class.prototype = {

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

