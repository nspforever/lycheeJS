
lychee.define('sorbet.data.Project').exports(function(lychee, sorbet, global, attachments) {

	var fs = require('fs');


	/*
	 * HELPERS
	 */

	var _read_package = function() {

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

	var _write_package = function() {

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

		this.__cache = {};


		_read_profile.call(this);

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		flush: function() {

			if (_write_profile.call(this) === true) {
				return true;
			}


			return false;

		}

	};


	return Class;

});

