
lychee.define('game.net.remote.Project').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _get_projects = function(main, folder) {

		folder = typeof folder === 'string' ? folder : null;


		var projects = [];

		if (folder !== null) {

			var fs   = main.fs;
			var root = main.root;

			var files = fs.filter(
				root + folder,
				'package.json',
				sorbet.data.Filesystem.TYPE.file
			);


			for (var f = 0, fl = files.length; f < fl; f++) {

				var resolvedfile = files[f];


				var tmp = resolvedfile.split('/');
				tmp.pop();
				tmp.pop();

				var projectroot  = tmp.join('/');
				var resolvedroot = projectroot;
				var title        = tmp.pop();

				projectroot = projectroot.substr(root.length + 1);
				projectroot = '../' + projectroot;


				var file = projectroot + '/' + resolvedfile.substr(resolvedroot.length + 1);

				projects.push({
					root:         projectroot,
					resolvedroot: resolvedroot,
					file:         file,
					resolvedfile: resolvedfile,
					title:        title.charAt(0).toUpperCase() + title.substr(1)
				});

			}

		}


		return projects;

	};


	var _update = function() {

		var filtered = [];
		var p, pl, projects;

		projects = _get_projects.call(this, this.remote.server, '/game');
		for (p = 0, pl = projects.length; p < pl; p++) {
			filtered.push(projects[p]);
		}

		projects = _get_projects.call(this, this.remote.server, '/external');
		for (p = 0, pl = projects.length; p < pl; p++) {
			filtered.push(projects[p]);
		}


		if (filtered.length > 0) {

			this.remote.send({
				projects: filtered
			}, {
				id:    this.id,
				event: 'update'
			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		this.id     = 'project';
		this.remote = remote;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * SERVICE API
		 */

		plug: function() {

		},

		unplug: function() {

		},



		/*
		 * CUSTOM API
		 */

		update: function() {

			_update.call(this);

		}

	};


	return Class;

});

