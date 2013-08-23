
lychee.define('game.ar.Drone').requires([
	'game.ar.command.CONFIG',
	'game.ar.command.PCMD',
	'game.ar.command.REF',
	'game.ar.command.Socket',
	'game.ar.navdata.Socket',
	'game.ar.video.Socket'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var _config = game.ar.command.CONFIG;
	var _pcmd   = game.ar.command.PCMD;
	var _ref    = game.ar.command.REF;
	var _commandsocket = game.ar.command.Socket;
	var _navdatasocket = game.ar.navdata.Socket;
	var _videosocket   = game.ar.video.Socket;



	/*
	 * HELPERS
	 */

	var _process_navdata = function(data) {

		if (data instanceof Object) {

			if (
				   data.states
				&& data.states.emergency_landing === 1
				&& this.__disableEmergency === true
			) {

				this.__ref.setEmergency(true);

			} else {

				this.__ref.setEmergency(false);
				this.__disableEmergency = false;

			}


			if (this.navdata === null) {
				console.log('game.ar.Drone (' + this.ip + '): Navdata Socket online.');
			}

			this.navdata = data;

			this.trigger('navdata', [ this.navdata ]);

		}

	};

	var _process_video = function(data) {

		this.video = data;

		this.trigger('video', [ this.video ]);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(ip) {

		ip = typeof ip === 'string' ? ip : '192.168.1.1';


		this.ip      = ip;
		this.flying  = false;
		this.navdata = null;

		this.__ref    = new _ref(false, false);
		this.__pcmd   = new _pcmd(0, 0, 0, 0);
		this.__config = new _config();


		this.__sockets = {};
		this.__sockets.command = new _commandsocket(ip);
		this.__sockets.navdata = new _navdatasocket(ip);
//		this.__sockets.video   = new _videosocket(ip);

		this.__sockets.navdata.bind('receive', _process_navdata, this);
//		this.__sockets.video.bind('receive',   _process_video,   this);


		this.__state = {};
		this.__state.roll   = 0;
		this.__state.pitch  = 0;
		this.__state.yaw    = 0;
		this.__state.heave  = 0;
		this.__state.config = {
			'general:navdata_demo': [ 'TRUE' ]
		};


		this.__flightanimation = {};
		this.__flightanimation.active   = false;
		this.__flightanimation.type     = null;
		this.__flightanimation.start    = null;
		this.__flightanimation.duration = null;
		this.__flightanimation.sent     = false;


		this.__disableEmergency = false;


		lychee.event.Emitter.call(this);

	};


	Class.FLIGHTANIMATION = {
		'turn':         6,
		'turn-down':    7,
		'yaw-shake':    8,
		'roll-dance':  10,
		'pitch-dance': 11,
		'yaw-dance':    9,

		'wave':        13,

		'flip-ahead':  16,
		'flip-behind': 17,
		'flip-left':   18,
		'flip-right':  19
	};


	Class.LEDANIMATION = {
		'blinkGreenRed':  0,
		'blinkGreen':     1,
		'blinkRed':       2,
		'blinkOrange':    3,
		'snakeGreenRed':  4,
		'fire':           5,
		'standard':       6,
		'red':            7,
		'green':          8,
		'redSnake':       9,
		'blank':         10
	};


	Class.prototype = {

		disableEmergency: function() {
			this.__disableEmergency = true;
		},

		update: function(clock, delta) {

			var socket = this.__sockets.command;
			if (socket != null) {

				var config = this.__config;
				var ref    = this.__ref;
				var pcmd   = this.__pcmd;


				// 1. CONFIG
				var state = this.__state;
				for (var id in state.config) {
					config.set(id, state.config[id]);
					socket.add(config);
				}

				for (var id in state.config) {
					delete state.config[id];
				}


				// 2. REF
				socket.add(ref);


				// 3. PCMD
				pcmd.set(
					state.roll,
					state.pitch,
					state.yaw,
					state.heave
				);

				socket.add(pcmd);


				// 4. flush()
				socket.flush();

			}

		},



		/*
		 * INTERACTION API
		 */

		takeoff: function() {
			this.flying = true;
			this.__ref.setFlying(this.flying);
		},

		land: function() {
			this.flying = false;
			this.__ref.setFlying(this.flying);
		},

		stop: function() {

			var state = this.__state;

			state.roll  = 0;
			state.pitch = 0;
			state.yaw   = 0;
			state.heave = 0;

		},

		roll: function(speed) {

			if (
				typeof speed === 'number'
				&& speed >= -1.0
				&& speed <=  1.0
			) {
				this.__state.roll = speed;
				return true;
			}


			return false;

		},

		pitch: function(speed) {

			if (
				typeof speed === 'number'
				&& speed >= -1.0
				&& speed <=  1.0
			) {
				this.__state.pitch = speed;
				return true;
			}


			return false;

		},

		yaw: function(speed) {

			if (
				typeof speed === 'number'
				&& speed >= -1.0
				&& speed <=  1.0
			) {
				this.__state.yaw = speed;
				return true;
			}


			return false;

		},

		heave: function(speed) {

			if (
				typeof speed === 'number'
				&& speed >= -1.0
				&& speed <=  1.0
			) {
				this.__state.heave = speed;
				return true;
			}


			return false;

		},

		animateFlight: function(type, duration) {

			duration = typeof duration === 'number' ? duration : null;


			var valid   = false;
			var enumval = 0;

			for (var id in Class.FLIGHTANIMATION) {

				if (id === type) {
					enumval = Class.FLIGHTANIMATION[id];
					valid   = true;
					break;
				}

			}


			if (
				   valid === true
				&& duration !== null
			) {
				this.__state.config['control:flight_anim'] = [ enumval, duration ];
				return true;
			}


			return false;

		},

		animateLEDs: function(type, duration, hertz) {

			duration = typeof duration === 'number' ? duration : null;
			hertz    = typeof hertz === 'number'    ? hertz    : 2;


			var enumval = 0;
			var valid   = false;

			for (var id in Class.LEDANIMATION) {

				if (id === type) {
					enumval = Class.LEDANIMATION[id];
					valid   = true;
					break;
				}

			}


			if (
				   valid === true
				&& duration !== null
			) {
				this.__state.config['control:leds_anim'] = [ enumval, hertz, (duration / 1000) | 0 ];
				return true;
			}


			return false;

		}

	};


	return Class;

});

