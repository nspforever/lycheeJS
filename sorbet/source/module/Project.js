
lychee.define('sorbet.module.Project').requires([
	'sorbet.data.Queue',
	'sorbet.data.Project'
]).exports(function(lychee, sorbet, global, attachments) {

	var child_process = require('child_process');

	var _project = sorbet.data.Project;



	/*
	 * HELPERS
	 */

	var _init_database = function() {

		var database = this.main.db.get('Builder');
		if (database === null) {

			this.main.db.set('Builder', this.defaults);
			database = this.main.db.get('Builder');

		}

		this.database = database;

	};

	var _get_projects = function(vhost, folder) {

		folder = typeof folder === 'string' ? folder : null;


		var projects = [];

		if (folder !== null) {

			var fs   = vhost.fs;
			var root = vhost.root;

			var files = fs.filter(
				root + folder,
				'package.json',
				sorbet.data.Filesystem.TYPE.file
			);


			for (var f = 0, fl = files.length; f < fl; f++) {

				var resolved = files[f];


				var tmp = resolved.split('/');
				tmp.pop();
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

		}


		return projects;

	};


	var _environment = lychee.getEnvironment();

	var _build_project = function(project) {

console.log(project);


		var root = project.root;

		if (lychee.debug === true) {
			console.log('sorbet.module.Builder: Building optimized Package for ' + root);
		}


		this.queue.flush();


/*

		var sandbox     = lychee.createSandbox();
		var environment = lychee.createEnvironment();


		lychee.rebase({
			lychee: _environment.bases.lychee + '/source',
			game:   project.resolvedroot + '/source'
		});

		lychee.tag({
			platform: [ 'webgl' ]
		});

		lychee.dynamic = false;


		lychee.build(function() {

			lychee.setEnvironment(null);

		}, sandbox);

		lychee.setEnvironment(_environment);


console.log(project.root);



		var vproj = new _project(project.resolved);



		var resolved = vproj.resolve('lychee.data.BitON');

console.log(resolved);

*/


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


		var lychee_project = _get_projects.call(this, this.main, '/lychee')[0] || null;
		if (lychee_project !== null) {
			this.queue.add(lychee_project);
		}


		var vhosts = this.main.vhosts.values();
		for (var v = 0, vl = vhosts.length; v < vl; v++) {

			var vhost = vhosts[v];

			if (lychee.debug === true) {
				console.log('sorbet.module.Builder: Booting VHost "' + vhost.id + '"');
			}

			var internal_projects = _get_projects.call(this, vhost, '/game');
			for (var i = 0, il = internal_projects.length; i < il; i++) {
				this.queue.add(internal_projects[i]);
			}

			var external_projects = _get_projects.call(this, vhost, '/external');
			for (var e = 0, el = external_projects.length; e < el; e++) {
				this.queue.add(external_projects[e]);
			}

		}

	};


	Class.prototype = {

		defaults: {

		},

		process: function(host, response, data) {

		}

	};


	return Class;

});

