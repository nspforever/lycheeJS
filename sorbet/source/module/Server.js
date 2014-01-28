
lychee.define('sorbet.module.Server').exports(function(lychee, sorbet, global, attachments) {

	var child_process = require('child_process');



	/*
	 * HELPERS
	 */

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

	var _resolve_project = function(host, data) {

		var fs      = host.fs;
		var root    = host.fs.resolve(host.root);
		var referer = data.referer || null;

		/*
		 * 1. Resolve by Domain
		 *
		 * cosmo.lycheejs.org/sorbet/module/Server
		 * is called by cosmo.lycheejs.org
		 */

		var server = this.main.servers.get(root);
		if (server !== null) {

			return server;


		/*
		 * 2. Resolve by URL
		 *
		 * localhost:8080/sorbet/module/Server
		 * is called by localhost:8080/game/cosmo/index.html
		 */

		} else if (referer !== null) {

			var tmp = referer;

			// remove protocol (http://, https://)
			if (tmp.indexOf('://') >= 0) {
				tmp = tmp.substr(tmp.indexOf('://') + 3);
			}

			// remove index.html
			if (tmp.indexOf('/index.html') >= 0) {
				tmp = tmp.substr(0, tmp.indexOf('/index.html'));
			}

			// remove subdomain + domain (sorbet.lycheejs.org, localhost:8080)
			tmp = tmp.split('/');
			tmp.splice(0, 1);
			tmp = tmp.join('/');


			var resolved = host.fs.resolve(host.root + '/' + tmp);

			var server = this.main.servers.get(resolved);
			if (server !== null) {
				return server;
			}

		}


		return null;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.main     = main;
		this.type     = 'public';
		this.database = this.main.db.init('Server', this.defaults);

		this.queue = new sorbet.data.Queue();
		this.queue.bind('update', _build_project, this);

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

			var server = _resolve_project.call(this, host, data);
			if (server !== null) {

				var settings = {
					port: server.port,
					host: server.host !== null ? server.host : data.host
				};


				response.status                 = 200;
				response.header['Content-Type'] = 'application/json';
				response.content                = JSON.stringify(settings);


				return true;

			} else {

				var settings = {
					port: null,
					host: null
				};


				response.status                 = 404;
				response.header['Content-Type'] = 'application/json';
				response.content                = JSON.stringify(settings);


				return true;

			}


			return false;

		}

	};


	return Class;

});

