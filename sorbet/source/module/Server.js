
lychee.define('sorbet.module.Server').exports(function(lychee, sorbet, global, attachments) {

	var _env = lychee.getEnvironment();



	/*
	 * HELPERS
	 */

	var _get_projects = function(vhost, folder, data) {

		folder = typeof folder === 'string' ? folder : null;
		data   = data !== undefined         ? data   : null;


		var projects = [];

		var fs   = vhost.fs;
		var root = vhost.root;

		var files = fs.filter(
			root + folder,
			'Server.js',
			sorbet.data.Filesystem.TYPE.file
		);


		for (var f = 0, fl = files.length; f < fl; f++) {

			var resolved = files[f];


// TODO: Refactor dronecontrol app
if (resolved.match(/dronecontrol/)) continue;


			var tmp = resolved.split('/');
			tmp.pop(); // Server.js
			tmp.pop(); // source/

			var projectroot = tmp.join('/');
			var title       = tmp.pop();


			// TODO: Verify that this is correct behaviour for all VHosts
			projectroot = projectroot.substr(this.main.root.length + 1);
			projectroot = '../' + projectroot;


			projects.push({
				root:     projectroot,
				resolved: resolved,
				title:    title
			});

		}


		return projects;

	};


	var _build_project = function(project) {

		var root = project.root;

		if (lychee.debug === true) {
			console.log('sorbet.module.Sorbet: Building Isolated Server Instance for ' + root);
		}


		var env     = lychee.createEnvironment();
		var sandbox = lychee.createSandbox();


		lychee.setEnvironment(env);


		lychee.rebase({
			lychee: _env.bases.lychee,
			game:   root + '/source'
		});

		lychee.tag({
			platform: [ 'nodejs' ]
		});


		this.preloader.load(root + '/source/Server.js', {
			project: project,
			env:     env,
			sandbox: sandbox
		});

	};

	var _build_server = function(assets, mappings) {

		var url = Object.keys(assets)[0];
		var map = mappings[url];


		var that = this;
		var port = this.getPort();


		lychee.debug = false;

		lychee.build(function(lychee, global) {

			with (map.sandbox) {

				try {

					var server = new game.Server({
						port: port
					});

					that.main.ports.push(port);
					that.main.servers.push(server);

				} catch(e) {
				}

			}


			lychee.setEnvironment(null);

		}, map.sandbox);

	};



	/*
	 * IMPLEMENTATION
	 */

	var _port = 1337;


	var Class = function(main) {

		this.main = main;

		this.preloader = new lychee.Preloader();

		this.preloader.bind('ready', _build_server, this);

		this.preloader.bind('error', function(assets, map) {
			// TODO: What to do if preloading fails due to file access errors?
			lychee.setEnvironment(null);
		}, this);


		var vhosts = this.main.vhosts.all();
		for (var v = 0, vl = vhosts.length; v < vl; v++) {

			var vhost = vhosts[v];

			if (lychee.debug === true) {
				console.log('sorbet.module.Sorbet: Booting VHost "' + vhost.id + '"');
			}


			var internal_projects = _get_projects.call(this, vhost, '/game');
			for (var i = 0, il = internal_projects.length; i < il; i++) {
				_build_project.call(this, internal_projects[i]);
			}

			var external_projects = _get_projects.call(this, vhost, '/external');
			for (var e = 0, el = external_projects.length; e < el; e++) {
				_build_project.call(this, external_projects[i]);
			}

		}

	};


	Class.prototype = {

		getPort: function() {
			return _port++;
		},

		process: function(host, response, data) {

			return false;

		}

	};


	return Class;

});

