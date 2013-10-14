
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

	var _get_projects = function(vhost, folder, projects) {

		folder   = typeof folder === 'string' ? folder   : null;
		projects = projects instanceof Array  ? projects : [];


		var fs   = vhost.fs;
		var root = vhost.root;

		var files = fs.filter(
			root + folder,
			'init-server.js',
			sorbet.data.Filesystem.TYPE.file
		);


		for (var f = 0, fl = files.length; f < fl; f++) {

			var resolved = files[f];


			var tmp = resolved.split('/');
			tmp.pop();

			var projectroot  = tmp.join('/');
			var resolvedroot = projectroot;
			var title        = tmp.pop();

			// TODO: Verify that this is correct behaviour for all VHosts
			projectroot = projectroot.substr(this.main.root.length + 1);
			projectroot = '../' + projectroot;

			projects.push({
				vhost:        vhost,
				root:         projectroot,
				resolvedroot: resolvedroot,
				resolved:     resolved,
				title:        title
			});

		}


		return projects;

	};


	var _build_project = function(project) {

		var id = project.resolvedroot;
		if (this.main.servers.get(id) !== null) {
			return false;
		}


		var root = project.root;

		if (lychee.debug === true) {
			console.log('sorbet.module.Server: Building Isolated Server Instance for ' + root);
		}


		var resolved = project.resolved;
		var cwd      = project.resolvedroot;

		var that = this;
		var port = this.getPort();
		var host = null;


		var server = child_process.fork(
			resolved, [
				port,
				host,
				this.main.root
			], {
				cwd: cwd
			}
		);

		server.id   = id;
		server.port = port;
		server.host = host;

		server.on('exit', function() {
			that.main.servers.remove(this.id, null);
		});

		this.main.servers.set(id, server);


		return true;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.main     = main;
		this.type     = 'public';
		this.database = null;


		_init_database.call(this);


		this.__port = this.database.port[0];


		var vhosts = this.main.vhosts.values();
		for (var v = 0, vl = vhosts.length; v < vl; v++) {

			var vhost = vhosts[v];

			if (lychee.debug === true) {
				console.log('sorbet.module.Server: Booting VHost "' + vhost.id + '"');
			}


			var projects = [];

			_get_projects.call(this, vhost, '/forge',    projects);
			_get_projects.call(this, vhost, '/game',     projects);
			_get_projects.call(this, vhost, '/external', projects);

			for (var p = 0, pl = projects.length; p < pl; p++) {
				_build_project.call(this, projects[p]);
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

			var referer = data.referer;
			if (referer !== null) {

				var tmp = referer.split(/\//);
				for (var t = 0, tl = tmp.length; t < tl; t++) {

					var str = tmp[t];
					if (
						   str === ''
						|| str === 'http:'
						|| str === 'https:'
						|| str.match(/(.*)\:([0-9]{0,5})/)
						|| str === 'index.html'
					) {
						tmp.splice(t, 1);
						tl--;
						t--;
					}

				}


				var game = tmp.join('/');
				var fs   = host.fs;
				var root = host.root;

				var resolved = fs.resolve(root + '/' + game);
				if (
					   resolved !== null
					&& fs.isDirectory(resolved)
					&& fs.isFile(resolved + '/index.html') === true
				) {

					var server = this.main.servers.get(resolved);
					if (server !== null) {

						var settings = {
							port: server.port,
							host: server.host !== null ? server.host : data.host
						};


						response.status                 = 200;
						response.header['Content-Type'] = 'application/json';
						response.content                = JSON.stringify(settings);

					}

				}


				return true;

			}


			return false;

		}

	};


	return Class;

});

