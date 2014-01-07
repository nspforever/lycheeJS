
lychee.define('game.net.client.Highscore').includes([
	'lychee.net.Service'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _plug_service = function() {

		this.game.services.highscore = this;


		var state = this.game.getState('menu');
		if (state !== null) {

			var entity = state.queryLayer('ui', 'root > highscore');
			if (entity !== null) {
				entity.setState('highscore');
			}

		}

	};

	var _unplug_service = function() {

		this.game.services.multiplayer = null;


		var state = this.game.getState('menu');
		if (state !== null) {

			var entity = state.queryLayer('ui', 'root > highscore');
			if (entity !== null) {
				entity.setState('highscore-disabled');
			}

		}

	};

	var _sync_service = function(data) {
	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client) {

		this.game = client.game;

		lychee.net.Service.call(this, 'highscore', client, lychee.net.Service.TYPE.client);


		this.bind('plug',   _plug_service,   this);
		this.bind('unplug', _unplug_service, this);
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

