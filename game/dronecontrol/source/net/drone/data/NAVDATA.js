
lychee.define('game.net.drone.data.NAVDATA').exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _buffer = function(data) {

		this.__offset = 0;

		if (Buffer.isBuffer(data)) {
			this.__buffer = data;
		} else {
			this.__buffer = new Buffer(data, 'binary');
		}

	};


	_buffer.prototype = {

		int16: function() {
			this.__offset += 2;
			return this.__buffer.readInt16LE(this.__offset - 2);
		},

		uint16: function() {
			this.__offset += 2;
			return this.__buffer.readUInt16LE(this.__offset - 2);
		},

		int32: function() {
			this.__offset += 4;
			return this.__buffer.readInt32LE(this.__offset - 4);
		},

		uint32: function() {
			this.__offset += 4;
			return this.__buffer.readUInt32LE(this.__offset - 4);
		},

		float32: function() {
			this.__offset += 4;
			return this.__buffer.readFloatLE(this.__offset - 4);
		},

		extract: function(bytes) {

			this.__offset += bytes;


			var buffer = new Buffer(bytes);

			this.__buffer.copy(
				buffer,
				0,
				this.__offset - bytes,
				this.__offset
			);

			return buffer;

		},

		matrix3: function() {

			return {
				m11: this.float32(),
				m12: this.float32(),
				m13: this.float32(),
				m21: this.float32(),
				m22: this.float32(),
				m23: this.float32(),
				m31: this.float32(),
				m32: this.float32(),
				m33: this.float32()
			};

		},

		vector3: function() {

			return {
				x: this.float32(),
				y: this.float32(),
				z: this.float32()
			};

		},

		mask: function(value, mask) {

			var flags = {};

			for (var flag in mask) {
				flags[flag] = (value & mask[flag]) ? 1 : 0;
			}


			return flags;

		}

	};



	var _NAVDATA_HEADER = 0x55667788;

	var _DRONE_STATES = {
		flying:                       1 << 0,
		video:                        1 << 1,
		vision:                       1 << 2,
		control_algorithm:            1 << 3,  // (0) euler angles control, (1) angular speed control
		altitude_control_algorithm:   1 << 4,
//		startButtonState:             1 << 5,  // USER feedback : Start button state
		control_command_ack:          1 << 6,  // (0) None, (1) one received
		camera:                       1 << 7,  // is camera ready?
//		travelling:                   1 << 8,  // Travelling mask : (0) disable, (1) enable
		usb:                          1 << 9,  // is usb ready?
//		navdataDemo:                  1 << 10, // (0) All navdata, (1) only navdata demo
//		navdataBootstrap:             1 << 11, // Navdata bootstrap : (0) options sent in all or demo mode, (1) no navdata options sent
		motor_problem:                1 << 12,
		communication_lost:           1 << 13,
		software_fault:               1 << 14,
		low_battery:                  1 << 15,
		user_emergency_landing:       1 << 16,
		timer_elapsed:                1 << 17, // Timer elapsed : (1) elapsed, (0) not elapsed
		magnometer_needs_calibration: 1 << 18, // (0) Ok, no calibration needed, (1) not ok, calibration needed
		angles_out_of_range:          1 << 19, // (0) Ok, (1) out of range
		too_much_wind:                1 << 20, // (0) ok, (1) Too much wind
		ultrasonicsensor_deaf:        1 << 21, // (0) Ok, (1) deaf
//		cutoutDetected:               1 << 22, // Cutout system detection : (0) Not detected, (1) detected
//		picVersionNumberOk:           1 << 23, // PIC Version number OK : (0) a bad version number, (1) version number is OK
//		atCodecThreadOn:              1 << 24, // ATCodec thread ON : (0) thread OFF (1) thread ON
//		navdataThreadOn:              1 << 25, // Navdata thread ON : (0) thread OFF (1) thread ON
//		videoThreadOn:                1 << 26, // Video thread ON : (0) thread OFF (1) thread ON
//		acquisitionThreadOn:          1 << 27, // Acquisition thread ON : (0) thread OFF (1) thread ON
//		controlWatchdogDelay:         1 << 28, // CTRL watchdog : (1) delay in control execution (> 5ms), (0) control is well scheduled
//		adcWatchdogDelay:             1 << 29, // ADC Watchdog : (1) delay in uart2 dsr (> 5ms), (0) uart2 is good
//		comWatchdogProblem:           1 << 30, // Communication Watchdog : (1) com problem, (0) Com is ok
		emergency_landing:            1 << 31
	};

	var _ID_MAP = {
		0:     'demo',
		1:     'time',
		2:     'rawMeasures',
		3:     'physMeasures',
		4:     'gyrosOffsets',
		5:     'eulerAngles',
		6:     'references',
		7:     'trims',
		8:     'rcReferences',
		9:     'pwm',
		10:    'altitude',
		11:    'visionRaw',
		12:    'visionOf',
		13:    'vision',
		14:    'visionPerf',
		15:    'trackersSend',
		16:    'visionDetect',
		17:    'watchdog',
		18:    'adcDataFrame',
		19:    'videoStream',
		20:    'games',
		21:    'pressureRaw',
		22:    'magneto',
		23:    'windSpeed',
		24:    'kalmanPressure',
		25:    'hdvideoStream',
		26:    'wifi',
		27:    'zimmu3000',
		65535: 'checksum'
	};


	var _FLYING_STATES = {
		0: 'FLYING_OK',
		1: 'FLYING_LOST_ALT',
		2: 'FLYING_LOST_ALT_GO_DOWN',
		3: 'FLYING_ALT_OUT_ZONE',
		4: 'FLYING_COMBINED_YAW',
		5: 'FLYING_BRAKE',
		6: 'FLYING_NO_VISION'
	};

	var _CONTROL_STATES = {
		0: 'CONTROL_DEFAULT',
		1: 'CONTROL_INIT',
		2: 'CONTROL_LANDED',
		3: 'CONTROL_FLYING',
		4: 'CONTROL_HOVERING',
		5: 'CONTROL_TEST',
		6: 'CONTROL_TRANS_TAKEOFF',
		7: 'CONTROL_TRANS_GOTOFIX',
		8: 'CONTROL_TRANS_LANDING',
		9: 'CONTROL_TRANS_LOOPING'
	};

	var _parse_optionbuffer = function(buffer) {

		var data = {};

		data.flying  = _FLYING_STATES[buffer.uint16()];
		data.control = _CONTROL_STATES[buffer.uint16()];
		data.battery = buffer.uint32();


		/*
		 * FLYING STATE
		 */

		var theta = buffer.float32() / 1000;
		var phi   = buffer.float32() / 1000;
		var psi   = buffer.float32() / 1000;

		data.roll  = phi;
		data.pitch = theta;
		data.yaw   = psi;

		data.altitude = buffer.int32() / 1000;
		data.velocity = buffer.vector3();


		/*
		 * CAMERA
		 */

		data.camera = {};
		data.camera.frame       = buffer.uint32();
		data.camera.rotation    = buffer.matrix3();
		data.camera.translation = buffer.vector3();
		data.camera.tag         = buffer.uint32();
		data.camera.type        = buffer.uint32();

		/*
		 * HD CAMERA
		 */

		data.drone = {};
		data.drone.rotation     = buffer.matrix3();
		data.drone.translation  = buffer.vector3();


		return data;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {};


	Module.encode = function() {

		// TODO: encode
		return null;

	};


	Module.decode = function(data) {

		var buffer  = new _buffer(data);
		var navdata = {
			valid: false
		};


		var header = buffer.uint32();
		if (header === _NAVDATA_HEADER) {

			var statemask    = buffer.uint32();
			navdata.states   = buffer.mask(statemask, _DRONE_STATES);
			navdata.sequence = buffer.uint32();
			var vision_flag  = buffer.uint32();


			while (true) {

				var id           = buffer.uint16();
				var name         = _ID_MAP[id];
				var length       = buffer.uint16();
				var optionbuffer = new _buffer(buffer.extract(length - 4));


//console.log(length, id, name);

				if (name === 'checksum') {

					var expected = 0;
					for (var d = 0; d < data.length - length; d++) {
						expected += data[d];
					}

					var checksum = optionbuffer.uint32();
					if (checksum === expected) {
						navdata.valid = true;
					}

					break;

				} else {

					var optiondata = _parse_optionbuffer(optionbuffer);

					for (var optionkey in optiondata) {
						navdata[optionkey] = optiondata[optionkey];
					}

				}

			}

		}


		return navdata;

	};


	return Module;

});

