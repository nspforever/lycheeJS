
lychee.define('game.Controller').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _refresh_state = function() {

		if (this.ip === null) return;

		var client = this.client;
		if (client !== null) {

			client.send({
				ip:     this.ip,
				method: 'state',
				value:  this.__state
			});

		}

	};

	var _process_receive = function(data) {

		if (data instanceof Object) {

			if (
				    this.ip === null
				|| (this.ip !== null && this.ip === data.ip)
			) {

				var type = data.type;
				if (type === 'video') {
					this.trigger('video',   [ data.data ]);
				} else if (type === 'navdata') {
					this.trigger('navdata', [ data.data ]);
				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game) {

		this.game   = game;
		this.client = game.client || null;
		this.ip     = null;


		this.__state = {
			roll:  0,
			pitch: 0,
			yaw:   0,
			heave: 0
		};


		lychee.event.Emitter.call(this);


		this.client.bind('receive', _process_receive, this);

	};


	Class.prototype = {

		animation: function(method, type, value) {

			if (this.ip === null) return;

			var client = this.client;
			if (client !== null) {

				client.send({
					ip:     this.ip,
					method: method || 'animateFlight',
					type:   type,
					value:  value
				});

			}

		},

		command: function(command) {

			if (this.ip === null) return;

			var client = this.client;
			if (client !== null) {

				client.send({
					ip:     this.ip,
					method: command,
					value:  null
				});

			}

		},

		set: function(id, value) {

			this.__state[id] = value;

			_refresh_state.call(this);

		},

		setIP: function(ip) {

			ip = typeof ip === 'string' ? ip : null;

			this.ip = ip;

		}

	};


	return Class;

});

