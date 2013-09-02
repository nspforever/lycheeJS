
lychee.define('sorbet.module.Builder').exports(function(lychee, sorbet, global, attachments) {

	var child_process = require('child_process');



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

	var _get_projects = function(vhost, folder, data) {

		folder = typeof folder === 'string' ? folder : null;
		data   = data !== undefined         ? data   : null;


		var projects = [];

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


		return projects;

	};

	var _build_project = function(project) {

		var root = project.root;

		if (lychee.debug === true) {
			console.log('sorbet.module.Builder: Building optimized Package for ' + root);
		}


		var resolved = project.resolved;


		this.preloader.load(resolved, project);

	};

	var _get_build_variants = function(tree) {

		var builds = {};


		for (var nsId in tree) {

			var namespace = tree[nsId];

		}




		return builds;

	};

	var _prepare_project = function(assets, mappings) {

		for (var url in assets) {

			var data = assets[url];
			var map  = mappings[url];


			var id = map.resolved;
			if (this.__done[id] !== true) {

				var builds = _get_build_variants(data.tree);


console.log('----------------------');
console.log(id);
console.log('----------------------');
console.log('BUILD VARIANTS', builds);


				this.__done[id] = true;

			}

		}

	};




	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.main     = main;
		this.type     = 'public';
		this.database = null;


		_init_database.call(this);


		this.preloader = new lychee.Preloader();
		this.preloader.bind('ready', _prepare_project, this);
		this.preloader.bind('error', _prepare_project, this);

		this.__done = {};


		var lychee_project = _get_projects.call(this, this.main, '/lychee')[0] || null;
		if (lychee_project !== null) {
			_build_project.call(this, lychee_project);
		}


		var vhosts = this.main.vhosts.all();
		for (var v = 0, vl = vhosts.length; v < vl; v++) {

			var vhost = vhosts[v];

			if (lychee.debug === true) {
				console.log('sorbet.module.Builder: Booting VHost "' + vhost.id + '"');
			}

			var internal_projects = _get_projects.call(this, vhost, '/game');
			for (var i = 0, il = internal_projects.length; i < il; i++) {
				_build_project.call(this, internal_projects[i]);
			}

			var external_projects = _get_projects.call(this, vhost, '/external');
			for (var e = 0, el = external_projects.length; e < el; e++) {
				_build_project.call(this, external_projects[e]);
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

