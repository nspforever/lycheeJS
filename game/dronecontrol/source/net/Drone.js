
lychee.define('game.net.Drone').requires([
	'lychee.game.Loop',
	'game.net.drone.data.CONFIG',
	'game.net.drone.data.NAVDATA',
	'game.net.drone.data.REF',
	'game.net.drone.data.STATE',
	'game.net.drone.socket.Command',
	'game.net.drone.socket.Navdata'
]).exports(function(lychee, game, global, attachments) {

	var _CONFIG  = game.net.drone.data.CONFIG;
	var _NAVDATA = game.net.drone.data.NAVDATA;
	var _REF     = game.net.drone.data.REF;
	var _STATE   = game.net.drone.data.STATE;

	var _socket = game.net.drone.socket;



	/*
	 * HELPERS
	 */

	var _instances = [];

	var _loop = new lychee.game.Loop({
		render: 0,
		update: lychee.debug === true ? 1 : 30
	});

	_loop.bind('update', function(clock, delta) {

		for (var i = 0, il = _instances.length; i < il; i++) {
			_instances[i].update(clock, delta);
		}

	}, this);


	var _validate_state = function(state) {

		if (state instanceof Object) {

			for (var prop in state) {

				if (
					   typeof state[prop] !== 'number'
					|| state[prop] < -1.0
					|| state[prop] > 1.0
				) {
					return false;
				}

			}


			return true;

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(ip, owner) {

		ip = typeof ip === 'string' ? ip : '192.168.1.1';


		this.ip      = ip;
		this.owner   = owner || null;
		this.navdata = null;
		this.sockets = {};
		this.sockets.command = new _socket.Command(ip);
		this.sockets.navdata = new _socket.Navdata(ip);

		this.__disableEmergency = false;

		this.__config = {
			'general:navdata_demo': [ 'TRUE' ]
		};
		this.__ref    = {
			flying:    false,
			emergency: false
		};
		this.__state  = {
			roll:  0.0,
			pitch: 0.0,
			yaw:   0.0,
			heave: 0.0
		};


		lychee.event.Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		this.sockets.navdata.bind('receive', function(blob) {

			var data = _NAVDATA.decode(blob);
			if (data !== null) {

				if (data.valid === true) {

					if (
						   data.states.emergency_landing === 1
						&& this.__disableEmergency === true
					) {
						this.__ref.emergency = true;
					} else {
						this.__ref.emergency = false;
						this.__disableEmergency = false;
					}

				}


				this.navdata = data;

			}

		}, this);


		_instances.push(this);

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


	Class.LED = {

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

		destroy: function() {

			for (var i = 0, il = _instances.length; i < il; i++) {

				if (_instances[i] === this) {
					_instances.splice(i, 1);
					il--;
					i--;
				}

			}

		},

		disableEmergency: function() {
			this.__disableEmergency = true;
		},

		update: function(clock, delta) {

			var socket = this.sockets.command;
			if (socket != null) {

				// TODO: delete the config values
				// for (var id in this.config) {
				//	delete this.config[id];
				// }

				for (var key in this.__config) {

					socket.push(_CONFIG.encode({
						key:    key,
						values: this.__config[key]
					}, socket.sequence++));

				}


				socket.push(_REF.encode(this.__ref, socket.sequence++));
				socket.push(_STATE.encode(this.__state, socket.sequence++));


				socket.flush();

			}


			var socket = this.sockets.navdata;
			if (socket !== null) {

				if (this.navdata === null) {
					socket.flush();
				}

			}

		},



		/*
		 * INTERACTION API
		 */

		takeoff: function() {
			this.__ref.flying = true;
		},

		land: function() {
			this.__ref.flying = false;
		},

		stop: function() {

			var state = this.__state;

			state.roll  = 0;
			state.pitch = 0;
			state.yaw   = 0;
			state.heave = 0;

		},

		setDance: function(dance, duration) {

			duration = typeof duration === 'number' ? duration : 3000;


			if (lychee.enumof(Class.DANCE, dance) === true) {

				this.__config['control:flight_anim'] = [ dance, duration ];

				return true;

			}


			return false;

		},

		setFlip: function(flip, duration) {

			duration = typeof duration === 'number' ? duration : 700;


			if (lychee.enumof(Class.FLIP, flip) === true) {

				this.__config['control:flight_anim'] = [ flip, duration ];

				return true;

			}


			return false;

		},

		setState: function(state) {

			if (_validate_state(state) === true) {

				this.__state.roll  = typeof state.roll === 'number'  ? state.roll  : this.__state.roll;
				this.__state.pitch = typeof state.pitch === 'number' ? state.pitch : this.__state.pitch;
				this.__state.yaw   = typeof state.yaw === 'number'   ? state.yaw   : this.__state.yaw;
				this.__state.heave = typeof state.heave === 'number' ? state.heave : this.__state.heave;

				return true;

			}


			return false;

		},

		animateLEDs: function(animation, duration, hertz) {

			duration = typeof duration === 'number' ? duration : null;
			hertz    = typeof hertz === 'number'    ? hertz    : 2;


			if (
				   lychee.enumof(Class.LEDANIMATION, animation) === true
				&& duration !== null
			) {

				var value = Class.LEDANIMATION[animation];

				this.__config['control:leds_anim'] = [ value, hertz, (duration / 1000) | 0 ];

				return true;

			}


			return false;

		}

	};


	return Class;

});

