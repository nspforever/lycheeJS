
lychee.define('sorbet.module.Blacklist').exports(function(lychee, sorbet, global, attachments) {

	var fs = require('fs');


	/*
	 * HELPERS
	 */

	var _init_database = function() {

		var database = this.main.db.get('Blacklist');
		if (database === null) {

			this.main.db.set('Blacklist', this.defaults);
			database = this.main.db.get('Blacklist');

		}

		this.database = database;

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
		this.type     = 'private';
		this.database = null;


		_init_database.call(this);

	};


	Class.prototype = {

		defaults: {
			hosts: {}
		},

		process: function(host, response, request) {

			// TODO: This needs to be implemented

			return false;

		},



		/*
		 * CUSTOM API
		 */

		log: function(request) {

			if (lychee.debug === true) {
				console.error('sorbet.module.Blacklist: Logging Illegal Request "' + request.host + ' , ' + request.url + ' , ' + request.remote + '"');
			}


			var database = this.database;
			if (database !== null) {

				var host = database.hosts[request.host];
				if (host === undefined) {
					host = database.hosts[request.host] = {};
				}

				var entry = host[request.url];
				if (entry === undefined) {
					entry = host[request.url] = {
						remotes:    [],
						useragents: [],
						log:        0
					};
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

		}

	};


	return Class;

});

