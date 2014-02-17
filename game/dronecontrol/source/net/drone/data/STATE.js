
lychee.define('game.net.drone.data.STATE').supports(function() {

	if (typeof Buffer !== 'undefined') {
		// TODO: Better feature detection
		return true;
	}


	return false;

}).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _float_to_int = function(sequence) {

		var buffer = new Buffer(4);
		buffer.writeFloatBE(sequence, 0);

		return -~parseInt(buffer.toString('hex'), 16) - 1;

	};


	var _encode = function(roll, pitch, yaw, heave, sequence) {

		var flag = 0;
		if (
			   roll !== 0
			|| pitch !== 0
			|| yaw !== 0
			|| heave !== 0
		) {
			flag = 1;
		}


		/*
		 * Pitch is inverted, because the sensor's
		 * top is actually the physical bottom side
		 * of the mainboard
		 */

		var str = 'AT*PCMD=';

		str += sequence + ',';
		str += flag     + ',';
		str += _float_to_int( roll)  + ',';
		str += _float_to_int(-pitch) + ',';
		str += _float_to_int( heave) + ',';
		str += _float_to_int( yaw);

		str += '\r';


		return str;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {};


	Module.encode = function(data, sequence) {

		sequence = typeof sequence === 'number' ? sequence : 1;

		var roll  = 0;
		var pitch = 0;
		var yaw   = 0;
		var heave = 0;


		if (data instanceof Object) {

			roll  = typeof data.roll === 'number'  ? data.roll  : roll;
			pitch = typeof data.pitch === 'number' ? data.pitch : pitch;
			yaw   = typeof data.yaw === 'number'   ? data.yaw   : yaw;
			heave = typeof data.heave === 'number' ? data.heave : heave;

		}


		var value = _encode(roll, pitch, yaw, heave, sequence);
		if (value === undefined) {
			return null;
		} else {
			return value;
		}

	};


	Module.decode = function(data) {

		// TODO: decode
		return null;

	};


	return Module;

});

