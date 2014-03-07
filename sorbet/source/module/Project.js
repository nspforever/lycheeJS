
lychee.define('sorbet.module.Project').requires([
	'sorbet.data.Queue',
	'sorbet.data.Project'
]).exports(function(lychee, sorbet, global, attachments) {

	var _environment = lychee.getEnvironment();
	var _fs          = require('fs');
	var _project     = sorbet.data.Project;



	/*
	 * BOOTSTRAP INJECTION
	 */

	var _bootstrap = {};
	(function() {

		var lychee_path = '../lychee/source';


		var data = JSON.parse(_fs.readFileSync(lychee_path + '/package.json'));
		if (data !== null) {

			var core = '';

			core += _fs.readFileSync(lychee_path + '/core.js').toString();
			core += _fs.readFileSync(lychee_path + '/Builder.js').toString();
			core += _fs.readFileSync(lychee_path + '/Preloader.js').toString();


			var platform = data.tags.platform || null;
			if (platform !== null) {

				for (var type in platform) {

					try {

						var code = _fs.readFileSync(lychee_path + '/' + platform[type] + '/bootstrap.js').toString();

						_bootstrap[type] = core + '\n' + code;

					} catch(e) {
					}

				}

			}

		}

	})();



	// TODO: database integration


	/*
	 * HELPERS
	 */

	var _projects = {};

	var _build_project = function(project) {

		var root = project.root[0];
		var host = project.vhost;


		host.fs.read(project.package[0], function(raw, mtime) {

			var data = JSON.parse(raw);
			if (data.build instanceof Object) {

				if (lychee.debug === true) {
					console.log('sorbet.module.Project: Building Project for ' + root);
				}

				var tasks = _get_build_tasks(data.build);
				if (tasks.length > 0) {

					this.data[root] = [];

					for (var t = 0, tl = tasks.length; t < tl; t++) {

						tasks[t].project = project;
						this.data[root].push(tasks[t]);

					}

				}

			}


			var result = this.queue.flush();
			if (result === false) {

				this.queue.destroy();
				this.queue = new sorbet.data.Queue();

				for (var uid in this.data) {

					var data = this.data[uid];
					for (var d = 0, dl = data.length; d < dl; d++) {
						this.queue.add(data[d]);
					}

				}

				this.queue.bind('update', _build_project_task, this);

			}

		}, this);

	};

	var _build_project_task = function(data) {

		var that = this;
		var root = data.project.root[0];


		if (lychee.debug === true) {
			console.log('sorbet.module.Project: Building source "' + data.source + '" of Project for ' + root);
		}

		var fs = data.project.vhost.fs;

		var resolvedsource = fs.resolve(fs.toAbs(root + '/source/' + data.source + '.js'));
		if (resolvedsource !== null) {

			var tmp = fs.toAbs(root + '/' + data.build).split('/');
			tmp.pop();

			var directory = tmp.join('/');

			fs.mkdir(directory);


			var environment = null;
			var sandbox     = null;

			if (_projects[root] !== undefined) {
				environment = _projects[root].environment;
				sandbox     = _projects[root].sandbox;
			} else {
				environment = lychee.createEnvironment();
				sandbox     = lychee.createSandbox();
			}


			lychee.setEnvironment(environment);


			lychee.debug = data.debug === true;
			lychee.type  = 'build';


			if (data.rebase !== null) {

				var bases = {};
				for (var base in data.rebase) {

					var absbase  = fs.toAbs(this.main.root + '/' + data.project.root[1] + '/' + data.rebase[base]);
					var resolved = fs.resolve(absbase);
					if (resolved !== null) {
						bases[base] = '../' + resolved.substr(this.main.root.length + 1);
					}

				}

				lychee.rebase(bases);

			}


			if (data.tags !== null) {
				lychee.tag(data.tags);
			}


			require(resolvedsource);
console.log(resolvedsource, environment.tree);


			// TODO: Asset integration

			lychee.build(function(lychee, global, order) {

				var file = fs.toAbs(root + '/' + data.build + '.js');


				var code = '';

				var platform = environment.tags.platform || null;
				if (platform !== null) {

					for (var p = 0, pl = platform.length; p < pl; p++) {

						var type = platform[p];
						if (typeof _bootstrap[type] === 'string') {
							code += _bootstrap[type] + '\n';
							break;
						}

					}

				}


				for (var o = 0, ol = order.length; o < ol; o++) {
					code += environment.tree[order[o]].toString();
					code += '\n';
				}


				lychee.debug = true;
				lychee.type  = 'source';
				lychee.setEnvironment(null);


				_projects[root] = {
					environment: environment,
					sandbox:     sandbox
				};


				fs.write(file, code, function(result) {

					if (result === true) {

						if (lychee.debug === true) {
							console.log('sorbet.module.Project: Build succeeded for "' + data.source + '" at ' + file);
						}

					} else {

						if (lychee.debug === true) {
							console.error('sorbet.module.Project: Build failed for "' + data.source + '" at ' + file);
						}

					}

					this.queue.flush();

				}, that);

			}, sandbox);

		}

	};

	var _validate_task = function(task) {

		if (
			task instanceof Array
			&& typeof task[0] === 'string'
			&& typeof task[1] === 'boolean'
			&& (task[2] instanceof Object || task[2] === null)
			&& (task[3] instanceof Object || task[3] === null)
		) {

			return true;

		}


		return false;

	};

	var _get_build_tasks = function(node, path, tasks) {

		var retval = false;
		if (tasks === undefined) {
			retval = true;
			path   = './build';
			tasks  = [];
		}


		if (node instanceof Array) {

			if (
				   path !== './build'
				&& _validate_task(node) === true
			) {

				tasks.push({
					build:  path,
					source: node[0],
					debug:  node[1] === true,
					rebase: node[2],
					tags:   node[3]
				});

			}

		} else if (node instanceof Object) {

			for (var file in node) {
				_get_build_tasks(node[file], path + '/' + file, tasks);
			}

		}


		if (retval === true) {
			return tasks;
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.main     = main;
		this.type     = 'private';
		this.data     = {};
		this.database = this.main.db.init('Project', this.defaults);

		this.queue = new sorbet.data.Queue();
		this.queue.bind('update', _build_project, this);


		var vhosts = this.main.vhosts.values();
		for (var v = 0, vl = vhosts.length; v < vl; v++) {

			var vhost = vhosts[v];

			if (lychee.debug === true) {
				console.log('sorbet.module.Project: Booting VHost "' + vhost.id + '"');
			}


			var projects = vhost.getProjects();
			for (var p = 0, pl = projects.length; p < pl; p++) {

				var project = projects[p];
				if (project.init[0] === true) {
					this.queue.add(project);
				}

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

