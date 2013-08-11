
lychee.define('game.ar.command.CONFIG').exports(function(lychee, game, global, attachments) {

	var Class = function(key, value) {

		this.key    = '';
		this.values = [ '' ];

		this.set(key, value);

	};

	Class.prototype = {

		set: function(key, values) {

			key = typeof key === 'string' ? key : this.key;


			this.key = key;


			if (values instanceof Array) {
				this.values = values;
			} else if (typeof values === 'string') {
				this.values = [ values ];
			}

		},

		toString: function(sequence) {

			if (typeof sequence !== 'number') {
				sequence = 1;
			}


			var key   = this.key;
			var value = '';

			for (var v = 0, vl = this.values.length; v < vl; v++) {

				value += this.values[v];

				if (v !== vl - 1) {
					value += ',';
				}

			}


			var str = 'AT*CONFIG=';

			str += sequence + ',';

			str += '"' + key + '",';
			str += '"' + value    + '"';

			str += '\r';


			return str;

		}

	};


	return Class;

});

