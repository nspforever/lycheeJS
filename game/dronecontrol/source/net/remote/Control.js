
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

	var _on_dance = function(data) {

		var drone = _drones[data.ip] || null;
		if (drone !== null) {

			if (drone.owner !== this) return false;


			if (lychee.enumof(Class.DANCE, data.dance) === true) {

				drone.setDance(
					data.dance,
					data.duration
				);

			}

		}

	};

	var _on_flip = function(data) {

		var drone = _drones[data.ip] || null;
		if (drone !== null) {

			if (drone.owner !== this) return false;


			if (lychee.enumof(Class.FLIP, data.flip) === true) {

				drone.setFlip(
					data.flip,
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
				drone.setState(data.state);
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
		this.bind('dance',   _on_dance,   this);
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


	Class.COMMAND = {
		takeoff: 0,
		land:    1,
		stop:    2
	};


	Class.DANCE = {
		roll:    10,
		pitch:   11,
		yaw:      9,

		shake:    8,
		wave:    13,

		turn:     6,
		turndown: 7
	};


	Class.FLIP = {
		ahead:  16,
		behind: 17,
		left:   18,
		right:  19
	};


	Class.prototype = {

	};


	return Class;

});

