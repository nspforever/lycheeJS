
lychee.define('sorbet.module.Project').requires([
	'sorbet.data.Queue',
	'sorbet.data.Project'
]).exports(function(lychee, sorbet, global, attachments) {

	var child_process = require('child_process');

	var _environment = lychee.getEnvironment();
	var _project     = sorbet.data.Project;



	/*
	 * HELPERS
	 */

	var _build_project = function(project) {

		var root = project.root;

		if (lychee.debug === true) {
			console.log('sorbet.module.Project: Building Package for ' + root);
		}


		var sandbox     = lychee.createSandbox();
		var environment = lychee.createEnvironment();


		lychee.setEnvironment(environment);

		lychee.rebase({
			lychee: _environment.bases.lychee,
			game:   project.resolvedroot + '/source'
		});

		// TODO: Dynamic tag integration for all tags based on package config
		lychee.tag({
			platform: [ 'html' ]
		});

//		lychee.debug   = false;
		lychee.dynamic = false;


		var that = this;

console.log(lychee.getEnvironment());

		lychee.build(function() {

console.log('SANDBOX BUILD READY!');

			lychee.debug   = true;
			lychee.dynamic = true;
			lychee.setEnvironment(null);

			that.queue.flush();

		}, sandbox);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.main     = main;
		this.type     = 'public';
		this.database = this.main.db.init('Project', this.defaults);

		this.queue = new sorbet.data.Queue();
		this.queue.bind('update', _build_project, this);


// TODO: Implement _build_project method to correctly build tag-based prebuilds of projects
return;

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

