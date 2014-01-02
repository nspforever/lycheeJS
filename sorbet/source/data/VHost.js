
lychee.define('sorbet.data.VHost').requires([
	'sorbet.data.Filesystem'
]).exports(function(lychee, sorbet, global, attachments) {

	var _filesystem = sorbet.data.Filesystem;


	var _id = 0;

	var Class = function(main, id, config) {

		this.id   = id || ('vhost-' + _id++);
		this.main = main;
		this.root = config.root;

		this.fs = new _filesystem(this.root);

		this.__redirects = {};


		for (var alias in config.aliases) {

			var tmp    = config.aliases[alias].split('/');
			var ref    = tmp.pop();
			var folder = tmp.join('/');

			this.fs.add(
				folder,
				ref,
				_fs.TYPE.link,
				alias
			);

		}


		for (var from in config.redirects) {

			var to = config.redirects[from];
			if (typeof to === 'string') {
				this.__redirects[from] = to;
			}

		}

	};


	Class.prototype = {

		getRedirect: function(url) {

			var redirect = null;

			for (var rurl in this.redirects) {

				if (
					   rurl.substr(-1) === '*'
					&& rurl.substr(0, rurl.length - 1) === url.substr(0, rurl.length - 1)
				) {

					var tmp = url.substr(rurl.length - 1, url.length - (rurl.length - 1));

					redirect = this.redirects[rurl].replace('*', tmp);

				} else if (rurl === url) {

					redirect = this.redirects[rurl];

				}

			}


			return redirect;

		},

		getProjects: function() {

			var projects = [];

			var files = this.fs.filter(
				this.root,
				'package.json',
				sorbet.data.Filesystem.TYPE.file
			);


			for (var f = 0, fl = files.length; f < fl; f++) {

				var abspackage = files[f];


				var tmp = abspackage.split('/');
				tmp.pop();
				tmp.pop();

				var absroot = tmp.join('/');
				var title   = tmp.pop();

				var relroot    = './' + absroot.substr(this.main.root.length + 1);
				var relpackage = './' + abspackage.substr(this.main.root.length + 1);


				var server = null;

				var server_process = this.main.servers.get(absroot);
				if (server_process !== null) {

					server = {
						host: server_process.host,
						port: server_process.port
					};

				}

				projects.push({
					'title':   title,
					'root':    [ absroot,    relroot    ],
					'package': [ abspackage, relpackage ],
					'server':  server,
					'init': [
						this.fs.isFile(absroot + '/init.js'),
						this.fs.isFile(absroot + '/init-server.js')
					]
				});

			}


			return projects;

		}

	};


	return Class;

});

