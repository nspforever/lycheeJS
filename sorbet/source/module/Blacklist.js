
lychee.define('sorbet.module.Blacklist').exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _get_database = function(host, url) {

		var database = this.main.db.get('Blacklist');
		if (database !== null) {

			var blob = database[host] || null;
			if (blob !== null) {

				var entry = blob[url] || null;
				if (entry !== null) {
					return entry;
				}

			}

		}


		return null;

	};

	var _set_database = function(host, url, data) {

		data = data instanceof Object ? data : null;


		var database = this.main.db.get('Blacklist');
		if (database !== null) {

			var blob = database[host] || null;
			if (blob === null) {
				blob = database[host] = {};
			}


			blob[url] = data;


			return true;

		}


		return false;

	};

	var _remove_database = function(host, url) {

		var database = this.main.db.get('Blacklist');
		if (database !== null) {

			var blob  = database[host] || null;
			var entry = blob !== null ? (blob[url] || null) : null;

			if (url === null) {

				delete database[host];

				return true;

			} else if (blob !== null && entry !== null) {

				delete blob[url];

				return true;

			}

		}


		return false;

	};

	var _flush_database = function() {

		// Everything is linked, so we can
		// directly flush the main db
		this.main.db.flush();

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.main     = main;
		this.type     = 'public';
		this.database = this.main.db.init('Blacklist', this.defaults);

	};


	Class.THRESHOLD = 10;


	Class.prototype = {

		/*
		 * MODULE API
		 */

		process: function(host, response, request) {

			if (request.host !== 'localhost') {
				return false;
			}

			var action = request.action || null;
			if (action !== null) {

				var parameters = request.parameters || null;

				if (action === 'remove') {

					var host = parameters.host || null;
					var url  = parameters.url  || null;

					if (host !== null) {

						var result = _remove_database.call(this, host, url);
						if (result === true) {
							_flush_database.call(this);
						}


						var settings = {
							result: result
						};


						response.status                 = 200;
						response.header['Content-Type'] = 'application/json';
						response.content                = JSON.stringify(settings);

					}

				}


				return true;

			}


			return false;

		},



		/*
		 * CUSTOM API
		 */

		check: function(host, response, request) {

			var entry = _get_database.call(this, request.host, request.url);
			if (entry !== null) {

				if (
					   entry.remotes.indexOf(request.remote) !== -1
					&& entry.useragents.indexOf(request.useragent) !== -1
					&& entry.log > Class.THRESHOLD
				) {

					return true;

				}

			}


			return false;

		},

		log: function(request) {

			if (lychee.debug === true) {
				console.error('sorbet.module.Blacklist: Logging Illegal Request "' + request.host + ' , ' + request.url + ' , ' + request.remote + '"');
			}


			var entry = _get_database.call(this, request.host, request.url);
			if (entry === null) {

				entry = {
					remotes:    [],
					useragents: [],
					log:        0
				};

				_set_database.call(this, request.host, request.url, entry);

			}


			entry.log++;


			if (entry.useragents.indexOf(request.useragent) === -1) {
				entry.useragents.push(request.useragent);
			}

			if (entry.remotes.indexOf(request.remote) === -1) {
				entry.remotes.push(request.remote);
			}


			_flush_database.call(this);

		}

	};


	return Class;

});

