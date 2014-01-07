
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

			var entity = state.queryLayer('ui', 'root > multiplayer');
			if (entity !== null) {
				entity.setState('multiplayer');
			}

		}

	};

	var _unplug_service = function() {

		this.game.services.multiplayer = null;


		// TODO: Tween back to menu main if user is in multiplayer layer

		var state = this.game.getState('menu');
		if (state !== null) {

			var entity = state.queryLayer('ui', 'root > multiplayer');
			if (entity !== null) {
				entity.setState('multiplayer-disabled');
			}

		}

	};

	var _on_start = function(data) {

		if (this.game.isState('menu') === true) {

			this.game.changeState('game', {
				type:    'multiplayer',
				players: data.tunnels,
				player:  data.tid
			});

		}

	};

	var _on_stop = function(data) {

		if (this.game.isState('game') === true) {
			this.game.changeState('menu');
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client) {

		this.game = client.game;

		lychee.net.client.Session.call(this, 'multiplayer', client, {
			autostart: true,
			limit:     2
		});


		this.bind('plug',   _plug_service,   this);
		this.bind('unplug', _unplug_service, this);

		this.bind('start', _on_start, this);
		this.bind('stop',  _on_stop,  this);

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		sync: function(data) {

			this.multicast(data, {
				id:    this.id,
				event: 'sync'
			});

		},

		control: function(data) {

			this.multicast(data, {
				id:    this.id,
				event: 'control'
			});

		}

	};


	return Class;

});

