
lychee.define('sorbet.module.Server').exports(function(lychee, sorbet, global, attachments) {

	var child_process = require('child_process');



	/*
	 * HELPERS
	 */

	var _init_database = function() {

		var database = this.main.db.get('Server');
		if (database === null) {

			this.main.db.set('Server', this.defaults);
			database = this.main.db.get('Server');

		}

		this.database = database;

	};

	var _build_project = function(project) {

		var id = project.root[0];
		if (this.main.servers.get(id) !== null) {
			return false;
		}


		var root = project.root[0];
		var host = null;
		var port = this.getPort();


		if (lychee.debug === true) {
			console.log('sorbet.module.Server: Building Server for ' + root + ' [' + host + ',' + port + ']');
		}


		var server = child_process.fork(
			root + '/init-server.js', [
				host,
				port,
				this.main.root
			], {
				cwd: root
			}
		);

		server.id   = id;
		server.host = host;
		server.port = port;


		var that = this;
		server.on('exit', function() {
			that.main.servers.remove(this.id, null);
		});

		this.main.servers.set(id, server);
		this.queue.flush();


		return true;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.main     = main;
		this.type     = 'public';
		this.database = null;

		this.queue = new sorbet.data.Queue();
		this.queue.bind('update', _build_project, this);


		_init_database.call(this);


		this.__port = this.database.port[0];


		var vhosts = this.main.vhosts.values();
		for (var v = 0, vl = vhosts.length; v < vl; v++) {

			var vhost    = vhosts[v];

			if (lychee.debug === true) {
				console.log('sorbet.module.Server: Booting VHost "' + vhost.id + '"');
			}


			var projects = vhost.getProjects();
			for (var p = 0, pl = projects.length; p < pl; p++) {

				var project = projects[p];
				if (project.init[1] === true) {
					this.queue.add(project);
				}

			}

		}

	};


	Class.prototype = {

		defaults: {
			port: [ 8081, 8181 ]
		},

		getPort: function() {
			return this.__port++;
		},

		process: function(host, response, data) {

			var fs   = host.fs;
			var root = host.root;

			var resolved = fs.resolve(root);

			var server = this.main.servers.get(resolved);
			if (server !== null) {

				var settings = {
					port: server.port,
					host: server.host !== null ? server.host : data.host
				};


				response.status                 = 200;
				response.header['Content-Type'] = 'application/json';
				response.content                = JSON.stringify(settings);


				return true;

			}


			return false;

		}

	};


	return Class;

});

