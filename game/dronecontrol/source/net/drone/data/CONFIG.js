
lychee.define('game.net.drone.data.CONFIG').exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _encode = function(key, values, sequence) {

		var value = '';

		for (var v = 0, vl = values.length; v < vl; v++) {

			value += values[v];

			if (v !== vl - 1) {
				value += ',';
			}

		}


		var str = 'AT*CONFIG=';

		str += sequence + ',';

		str += '"' + key   + '"' + ',';
		str += '"' + value + '"';

		str += '\r';


		return str;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {};


	Module.encode = function(data, sequence) {

		sequence = typeof sequence === 'number' ? sequence : 1;


		var key    = null;
		var values = null;


		if (data instanceof Object) {

			key    = typeof data.key === 'string'    ? data.key   : null;
			values = typeof data.values === 'string' ? [ values ] : values;


			if (data.values instanceof Array) {
				// TODO: Validate values array
				values = data.values;
			}

		}


		var value = _encode(key, values, sequence);
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

