
lychee.define('game.net.client.Multiplayer').includes([
	'lychee.net.client.Session'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _plug_service = function() {

		this.game.services.multiplayer = this;


		var state = this.game.getState('menu');
		if (state !== null) {

			var root = state.getLayer('ui').getEntity('root');
			if (root !== null) {

				var entity = root.getEntity('multiplayer');
				if (entity !== null) {
					entity.setState('multiplayer');
				}

			}

		}

	};

	var _unplug_service = function() {

		this.game.services.multiplayer = null;


		var state = this.game.getState('menu');
		if (state !== null) {

			var root = state.getLayer('ui').getEntity('root');
			if (root !== null) {

				var entity = root.getEntity('multiplayer');
				if (entity !== null) {
					entity.setState('multiplayer-disabled');
				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client) {

		this.game = client.game;

		lychee.net.client.Session.call(this, 'multiplayer', client, {
			autorun: true,
			limit:   2
		});


		this.bind('plug',   _plug_service,   this);
		this.bind('unplug', _unplug_service, this);

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		control: function(data) {

			// TODO: multicast data with a given player id etc.

			this.multicast({
				playerid: 123
			}, {
				id:    this.id,
				event: 'control'
			});

		}

	};


	return Class;

});

