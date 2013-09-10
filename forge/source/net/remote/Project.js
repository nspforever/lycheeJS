
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

				var resolved = files[f];


				var tmp = resolved.split('/');
				tmp.pop();
				tmp.pop();

				var projectroot  = tmp.join('/');
				var resolvedroot = projectroot;
				var title        = tmp.pop();

				projectroot = projectroot.substr(root.length + 1);
				projectroot = '../' + projectroot;

				projects.push({
					root:         projectroot,
					resolvedroot: resolvedroot,
					resolved:     resolved,
					title:        title
				});

			}

		}


		return projects;

	};


	var _update = function() {

		var projects = _get_projects.call(this, this.remote.server, '/game');

console.log(projects);

		for (var p = 0, pl = projects.length; p < pl; p++) {
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

			_update.call(this);

		},

		unplug: function() {

		}

	};


	return Class;

});

