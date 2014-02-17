
lychee.define('game.net.remote.Control').requires([
	'game.net.Drone'
]).includes([
	'lychee.net.Service'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _drones = {};

	var _create_drone = function(ip) {

		if (typeof ip !== 'string') return false;


		var tunnel = this.tunnel;
		if (tunnel !== null) {

			if (
				(
					   tunnel.id.substr(0, 9) === '127.0.0.1'
					|| tunnel.id.substr(0, 10) === '192.168.1.'
				) && ip.substr(0, 10) === '192.168.1.'
			) {

				_drones[ip] = new game.net.Drone(ip, this);

			} else {

				this.report('Please follow the setup guide in /game/dronecontrol/README.md');

			}

		}


		return false;

	};

	var _on_command = function(data) {

		var drone = _drones[data.ip] || null;
		if (drone !== null) {

			if (drone.owner !== this) return false;


			var command = data.command;
			if (command === Class.COMMAND.takeoff) {

				drone.disableEmergency();
				drone.takeoff();

			} else if (command === Class.COMMAND.stop) {

				drone.stop();

			} else if (command === Class.COMMAND.land) {

				drone.land();

			}

		} else {

			var result = _create_drone.call(this, data.ip);
			if (result === true) {
				_on_command.call(this, data);
			}

		}

	};

	var _on_flip = function(data) {

		var drone = _drones[data.ip] || null;
		if (drone !== null) {

			if (drone.owner !== this) return false;


			data.animation = null;


			var flip = data.flip;
			if (flip === Class.FLIP.ahead) {
				data.animation = 'flip-ahead';
			} else if (flip === Class.FLIP.right) {
				data.animation = 'flip-right';
			} else if (flip === Class.FLIP.behind) {
				data.animation = 'flip-behind';
			} else if (flip === Class.FLIP.left) {
				data.animation = 'flip-left';
			}


			if (data.animation !== null) {

				drone.animateFlight(
					data.animation,
					data.duration
				);

			}

		}

	};

	var _on_state = function(data) {

		var drone = _drones[data.ip] || null;
		if (drone !== null) {

			if (drone.owner !== this) return false;


			var state = data.state || null;
			if (state instanceof Object) {

				drone.roll(state.roll);
				drone.pitch(state.pitch);
				drone.yaw(state.yaw);
				drone.heave(state.heave);

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		lychee.net.Service.call(this, 'control', remote, lychee.net.Service.TYPE.remote);



		/*
		 * INITIALIZATION
		 */

		this.bind('command', _on_command, this);
		this.bind('flip',    _on_flip,    this);
		this.bind('state',   _on_state,   this);


		this.bind('unplug', function() {

			for (var id in _drones) {

				if (_drones[id].owner === this) {

					_drones[id].stop();
					_drones[id].destroy();

					delete _drones[id];

				}

			}

		}, this);

	};


	Class.prototype = {

	};


	return Class;

});

