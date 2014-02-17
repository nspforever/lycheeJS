
lychee.define('game.net.client.Control').includes([
	'lychee.net.Service'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(client) {

		this.game = client.game;


		this.ip    = '192.168.1.1';
		this.state = {
			roll:  0.0,
			pitch: 0.0,
			yaw:   0.0,
			heave: 0.0
		};


		lychee.net.Service.call(this, 'control', client, lychee.net.Service.TYPE.client);



		/*
		 * INITIALIZATION
		 */


		this.bind('error', function(data) {

			if (lychee.debug === true) {
				console.error(data.message, data.blob);
			}

		}, this);

	};


	Class.COMMAND = {
		takeoff: 0,
		land:    1,
		stop:    2
	};


	Class.FLIP = {
		ahead:  0,
		right:  1,
		behind: 2,
		left:   3
	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		setCommand: function(command) {

			if (lychee.enumof(Class.COMMAND, command) === true) {

				if (this.tunnel !== null) {

					this.tunnel.send({
						ip:       this.ip,
						command:  command
					}, {
						id:    this.id,
						event: 'command'
					});

					return true;

				}

			}


			return false;

		},

		setFlip: function(flip, duration) {

			duration = typeof duration === 'number' ? duration : 700;


			if (lychee.enumof(Class.FLIP, flip) === true) {

				if (this.tunnel !== null) {

					this.tunnel.send({
						ip:       this.ip,
						flip:     flip,
						duration: duration
					}, {
						id:    this.id,
						event: 'flip'
					});

					return true;

				}

			}


			return false;

		},

		setIp: function(ip) {

			ip = typeof ip === 'string' ? ip : null;


			if (ip !== null) {

				this.ip = ip;

				return true;

			}


			return false;

		},

		setState: function(state) {

			state = state instanceof Object ? state : null;


			if (state !== null) {

				this.state.roll  = typeof state.roll === 'number'  ? state.roll  : this.state.roll;
				this.state.pitch = typeof state.pitch === 'number' ? state.pitch : this.state.pitch;
				this.state.yaw   = typeof state.yaw === 'number'   ? state.yaw   : this.state.yaw;
				this.state.heave = typeof state.heave === 'number' ? state.heave : this.state.heave;


				if (this.tunnel !== null) {

					this.tunnel.send({
						ip:    this.ip,
						state: this.state
					}, {
						id:    this.id,
						event: 'state'
					});

					return true;

				}

			}


			return false;

		}

	};


	return Class;

});

