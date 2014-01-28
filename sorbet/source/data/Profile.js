
lychee.define('sorbet.data.Profile').exports(function(lychee, sorbet, global, attachments) {

	var fs = require('fs');


	/*
	 * HELPERS
	 */

	var _read_profile = function() {

		var url = this.url;
		if (url !== null) {

			var raw = fs.readFileSync(url, 'utf8');


			var cache = null;

			try {
				cache = JSON.parse(raw);
			} catch(e) {
				console.warn('JSON file at ' + url + ' is invalid.');
			}


			if (cache !== null) {
				this.__cache = cache;
			}

		}

	};

	var _write_profile = function() {

		var result = false;


		var url = this.url;
		if (url !== null) {

			var raw = JSON.stringify(this.__cache, undefined, 4);

			try {
				fs.writeFileSync(url, raw, 'utf8');
				result = true;
			} catch(e) {
			}

		}


		return result;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url = url;

		this.__cache = { database: {} };


		_read_profile.call(this);

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		init: function(id, defaults) {

 			id       = typeof id === 'string'     ? id       : null;
			defaults = defaults instanceof Object ? defaults : {};

			if (id !== null) {

				var blob = this.get(id);
				if (blob === null) {

					this.set(id, defaults);
					blob = this.get(id);

				}


				return blob;

			}


			return null;

		},

		get: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				if (this.__cache.database[id] !== undefined) {
					return this.__cache.database[id];
				}

			}


			return null;

		},

		set: function(id, data) {

			id   = typeof id === 'string' ? id   : null;
			data = data !== undefined     ? data : null;


			if (
				   id !== null
				&& data !== null
			) {

				this.__cache.database[id] = data;

				return true;

			}


			return false;

		},

		remove: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				delete this.__cache.database[id];

				return true;

			}


			return false;

		},

		flush: function() {

			if (_write_profile.call(this) === true) {
				return true;
			}


			return false;

		}

	};


	return Class;

});

