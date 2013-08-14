
lychee.define('sorbet.module.Builder').exports(function(lychee, sorbet, global, attachments) {

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
			'package.json',
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



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main, data) {

		var settings = lychee.extendsafe({

		}, data);

return;

	};


	Class.prototype = {

	};


	return Class;

});

