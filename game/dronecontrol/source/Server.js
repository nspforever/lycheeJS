
lychee.define('game.Server').requires([
	'game.ar.Drone',
	'lychee.game.Loop'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, game, global, attachments) {

	var _drone  = game.ar.Drone;



	/*
	 * HELPERS
	 */

	var _process_receive = function(data) {

		var drone = this.getDrone(data.id || null);
		if (drone === null) {
			return false;
		}


		var method = data.method;
		var type   = data.type || null;
		var value  = data.value;


		console.log('(Dronecontrol) game.Server (' + data.id + '): ' + method + '/' + type + ' - ' + JSON.stringify(value));


		switch (method) {

			case 'takeoff':
				drone.disableEmergency();
				drone.takeoff();
			break;

			case 'land': drone.land(); break;
			case 'stop': drone.stop(); break;

			case 'state':
				drone.roll(value.roll);
				drone.pitch(value.pitch);
				drone.yaw(value.yaw);
				drone.heave(value.heave);
			break;

			case 'animateFlight': drone.animateFlight(type, value); break;
			case 'animateLEDs':   drone.animateLEDs(type, value);   break;

		}

	};

	var _process_navdata = function(drone, navdata) {

		var data = {
			ip:   drone.ip,
			type: 'navdata',
			data: navdata
		};


		var remotes = this.remotes;
		for (var r = 0, rl = remotes.length; r < rl; r++) {
			remotes[r].send(data);
		}

	};

	var _process_video = function(drone, videodata) {

		var data = {
			ip:   drone.ip,
			type: 'video',
			data: videodata
		};


		var remotes = this.remotes;
		for (var r = 0, rl = remotes.length; r < rl; r++) {
			remotes[r].send(data);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({
		}, data);


		this.drones = {};
		this.loop   = null;


		lychee.net.Server.call(this, JSON.stringify, JSON.parse);


		this.load();

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

		load: function() {

			var preloader = new lychee.Preloader();

			preloader.bind('ready', function(assets, mappings) {

				var url = Object.keys(assets)[0];
				var settings = assets[url];

				var drones = null;
				if (settings !== null) {
					drones = settings.drones;
				}

				preloader.unbind('ready');
				preloader.unbind('error');

				this.init(drones);

			}, this);

			preloader.bind('error', function(assets, mappings) {

				preloader.unbind('ready');
				preloader.unbind('error');

				this.init(null);

			}, this);

			preloader.load('./config.json');

		},

		init: function(drones) {


			if (drones instanceof Array) {

				for (var d = 0, dl = drones.length; d < dl; d++) {
					this.setDrone(drones[d].id, new game.ar.Drone(drones[d].ip));
				}

			}


			this.loop = new lychee.game.Loop({
				render: 0,
				update: 33
			});

			this.loop.bind('update', this.update, this);


			this.bind('connect', function(remote) {

				console.log('(Dronecontrol) game.Server: New Remote (' + remote.id + ')');

				remote.bind('receive', _process_receive, this);
				remote.accept();

			}, this);

		},

		update: function(clock, delta) {

			var drones = this.drones;
			for (var did in this.drones) {
				this.drones[did].update(clock, delta);
			}

		},

		setDrone: function(id, drone) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				this.drones[id] = drone;
				this.drones[id].bind('#navdata', _process_navdata, this);
				this.drones[id].bind('#video',   _process_video,   this);

				return true;

			}


			return false;

		},

		getDrone: function(id) {

			id = typeof id === 'string' ? id : null;


			for (var did in this.drones) {

				if (
					    id === null
					|| (id === did)
				) {
					return this.drones[did];
				}

			}


			return null;

		}

	};


	return Class;

});

