
lychee.define('sorbet.module.Welcome').requires([
	'sorbet.data.Template'
]).exports(function(lychee, game, global, attachments) {

	var _template = new sorbet.data.Template(attachments['html']);



	/*
	 * HELPERS
	 */

	var _get_projects = function(folder, data) {

		folder = typeof folder === 'string' ? folder : null;
		data   = data !== undefined         ? data   : null;


		var fs     = this.fs;
		var root   = this.root;
		var output = [];

		var files = fs.filter(
			root + folder,
			'index.html',
			sorbet.data.Filesystem.TYPE.file
		);


		for (var f = 0, fl = files.length; f < fl; f++) {

			var url = files[f].substr(root.length);
			var tmp = url.split('/');

			output.push({
				url:   url,
				title: tmp[tmp.length - 2]
			});

		}


		return output;

	};


	var _get_servers = function(main, data) {

		var servers = main.servers.values();
		var output  = [];


		for (var s = 0, sl = servers.length; s < sl; s++) {

			var server = servers[s];

			var tmp   = server.id.split('/');
			var port  = server.port;
			var title = tmp[tmp.length - 1];


			output.push({
				title: title,
				url:   'ws://' + data.host + ':' + port,
				type:  'ws',
				host:  null,
				port:  port
			});

		}


		output.push({
			title: 'sorbet',
			url:   'http://' + data.host + ':' + data.port,
			type:  'http',
			host:  data.host,
			port:  data.port
		});


		output.sort(function(a,b) {
			return a.port > b.port;
		});


		return output;

	};

	var _get_vhosts = function(main, data) {

		var vhosts = main.vhosts.ids();
		var output = [];


		for (var v = 0, vl = vhosts.length; v < vl; v++) {

			var hostname = vhosts[v];
			var vhost    = main.vhosts.get(hostname);


			var root = vhost.root.substr(main.root.length) || '/';


			output.push({
				title: hostname,
				url:   'http://' + hostname + ':' + data.port,
				root:  root
			});

		}


		return output;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.main = main;
		this.type = 'public';

	};


	Class.prototype = {

		process: function(host, response, data) {

			var content = '';
			var main    = this.main;
			var version = sorbet.Main.VERSION;


			try {

				content = _template.render({
					internal_projects: _get_projects.call(host, '/game',     data),
					external_projects: _get_projects.call(host, '/external', data),
					servers:           _get_servers(main, data),
					vhosts:            _get_vhosts(main, data),
					version:           version
				});

			} catch(e) {

				content = '';


				var _error = this.main.modules.get('error');
				if (_error !== null) {

					_error.process(host, response, {
						status:   500,
						host:     data.host || null,
						url:      data.url,
						resolved: null
					});

					return false;

				}

			}


			response.status                 = 200;
			response.header['Content-Type'] = 'text/html';
			response.content                = content;


			return true;

		}

	};


	return Class;

});

