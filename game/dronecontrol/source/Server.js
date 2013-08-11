
lychee.define('game.Server').requires([
	'game.ar.Drone',
	'lychee.game.Loop'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, game, global, attachments) {

	var _drone = game.ar.Drone;



	/*
	 * HELPERS
	 */

	var _process_receive = function(data) {

		var drone = this.getDroneById(data.droneId || null);
		if (drone === null) {
			return false;
		}


		var method = data.method;
		var type   = data.type || null;
		var value  = data.value;


		switch (method) {

			case 'takeoff':
				drone.disableEmergency();
				drone.takeoff();
			break;

			case 'land': drone.land(); break;
			case 'stop': drone.stop(); break;

			case 'roll':  drone.roll(value);  break;
			case 'pitch': drone.pitch(value); break;
			case 'yaw':   drone.yaw(value);   break;
			case 'heave': drone.heave(value); break;

			case 'animateFlight': drone.animateFlight(type, value); break;
			case 'animateLEDs':   drone.animateLEDs(type, value);   break;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({

			drones: [
				{ id: 'Lima',     ip: '192.168.1.1' },
				{ id: 'Jordan',   ip: '192.168.1.2' },
				{ id: 'Victoria', ip: '192.168.1.3' }
			]

		}, data);


		lychee.net.Server.call(this, JSON.stringify, JSON.parse);



		// SETUP

		this.loop = new lychee.game.Loop({
			render: 0,
			update: 33
		});

		this.loop.bind('update', this.update, this);


		this.__drones = {};



		// INITIALIZATION

		this.bind('connect', function(remote) {

			console.log('(Dronecontrol) game.Server: New Remote (' + remote.id + ')');

			remote.bind('receive', _process_receive, this);
			remote.accept();

		}, this);


		var drones = settings.drones;
		for (var d = 0, dl = drones.length; d < dl; d++) {
			this.setDrone(drones[d].id, new game.ar.Drone(drones[d].ip));
		}

	};


	Class.prototype = {

		/*
		 * SERVER API
		 */

		listen: function(port, host) {

			console.log('(Dronecontrol) game.Server: Listening on ' + host + ':' + port);

			lychee.net.Server.prototype.listen.call(this, port, host);

		},



		/*
		 * CUSTOM API
		 */

		update: function(clock, delta) {

			var drones = this.__drones;
			for (var did in this.__drones) {
				this.__drones[did].update(clock, delta);
			}

		},

		setDrone: function(id, drone) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				this.__drones[id] = drone;

				return true;

			}


			return false;

		},

		getDrone: function(id) {

			id = typeof id === 'string' ? id : null;


			for (var did in this.__drones) {

				if (
					    id === null
					|| (id === did)
				) {
					return this.__drones[did];
				}

			}


			return null;

		}

	};


	return Class;

});

