
lychee.define('game.net.drone.data.REF').exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _encode = function(flying, emergency, sequence) {

		var value = (flying << 9) | (emergency << 8);

		var str = 'AT*REF=';

		str += sequence + ',';
		str += value    + '';

		str += '\r';


		return str;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {};


	Module.encode = function(data, sequence) {

		sequence = typeof sequence === 'number' ? sequence : 1;


		var flying    = false;
		var emergency = false;


		if (data instanceof Object) {

			flying    = data.flying === true;
			emergency = data.emergency === true;

		}


		var value = _encode(flying, emergency, sequence);
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

