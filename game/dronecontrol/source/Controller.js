
lychee.define('game.Controller').exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _refresh_state = function() {

		var client = this.client;
		if (client !== null) {

			client.send({
				id:     this.__id,
				method: 'state',
				value:  this.__state
			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game) {

		this.game   = game;
		this.client = game.client || null;

		this.__id    = null;
		this.__state = {
			roll:  0,
			pitch: 0,
			yaw:   0,
			heave: 0
		};

	};


	Class.prototype = {

		animation: function(method, type, value) {

			var client = this.client;
			if (client !== null) {

				client.send({
					id:     this.__id,
					method: method || 'animateFlight',
					type:   type,
					value:  value
				});

			}

		},

		command: function(command) {

			var client = this.client;
			if (client !== null) {

				client.send({
					id:     this.__id,
					method: command,
					value:  null
				});

			}

		},

		set: function(id, value) {

			this.__state[id] = value;

			_refresh_state.call(this);

		}

	};


	return Class;

});

