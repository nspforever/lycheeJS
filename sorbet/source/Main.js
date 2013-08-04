
lychee.define('sorbet.Main').requires([
	'sorbet.module.Error',
	'sorbet.module.File',
	'sorbet.module.Filter',
	'sorbet.module.Redirect',
	'sorbet.module.Server',
	'sorbet.module.Welcome',
	'sorbet.data.Filesystem',
	'sorbet.data.Map',
	'sorbet.data.VHost'
]).exports(function(lychee, sorbet, global, attachments) {

	var http = require('http');
	var zlib = require('zlib');


	var _filesystem = sorbet.data.Filesystem;
	var _map        = sorbet.data.Map;
	var _module     = sorbet.module;
	var _vhost      = sorbet.data.VHost;

	/*
	 * HELPERS
	 */

	var _response_handler = function(request, response, data) {

		var accept_encoding = request.headers['accept-encoding'] || "";
		if (accept_encoding.match(/\bgzip\b/)) {

			zlib.gzip(data.content, function(err, buffer) {

				data.header['Content-Encoding'] = 'gzip';
				data.header['Content-Length']   = buffer.length;

				response.writeHead(data.status, data.header);
				response.write(buffer);
				response.end();

			});

		} else {

			data.header['Content-Length'] = data.content.length;

			response.writeHead(data.status, data.header);
			response.write(data.content);
			response.end();

		}

	};

	var _request_handler = function(rawrequest, rawresponse) {

		var response = this.process(rawrequest);
		if (response.async === true) {

			response.ready = function() {
				_response_handler(rawrequest, rawresponse, response);
			};

		} else {

			_response_handler(rawrequest, rawresponse, response);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(root, settings) {

		root = typeof root === 'string' ? root : '/var/www';


		this.fs = new _filesystem();
		this.fs.watch(root);

		this.root    = root;
		this.ports   = [];
		this.servers = [];

		this.vhosts  = new _map();
		this.modules = new _map();


		for (var s = 0, sl = settings.length; s < sl; s++) {

			var blob = settings[s];

			var name   = blob.hosts[0] || null;
			var config = {};

			config.root      = blob.config.root.replace('%root%', this.root);
			config.redirects = blob.config.redirects || {};
			config.aliases   = blob.config.aliases   || {};


			if (name !== null) {

				var vhost = new _vhost(name, config);

				this.vhosts.set(name, vhost);

				for (var h = 1, hl = blob.hosts.length; h < hl; h++) {
					var alias = blob.hosts[h];
					this.vhosts.alias(name, alias);
				}

			}

		}


		this.modules.set('error',    new _module['Error'](this));
		this.modules.set('file',     new _module['File'](this));
		this.modules.set('filter',   new _module['Filter'](this));
		this.modules.set('redirect', new _module['Redirect'](this));
		this.modules.set('welcome',  new _module['Welcome'](this));


		var that = this;
		setTimeout(function() {
			that.modules.set('server', new _module['Server'](that));
		}, 1000);

	};


	Class.VERSION = 'lycheeJS ' + lychee.VERSION + ' Sorbet (running on NodeJS ' + process.version + ')';


	Class.prototype = {

		listen: function(port) {

			port = typeof port === 'number' ? port : 8080;


			var that   = this;
			var server = new http.Server();

			server.on('request', function(request, response) {
				_request_handler.call(that, request, response);
			});


			try {

				server.listen(port);

				this.ports.push(port);
				this.servers.push(server);

				return true;

			} catch(e) {

				server.close();

				return false;

			}

		},

		process: function(request) {

			var response = {
				async:   false,
				status:  0,
				header:  {},
				content: null
			};


			var _error    = this.modules.get('error');
			var _file     = this.modules.get('file');
			var _filter   = this.modules.get('filter');
			var _redirect = this.modules.get('redirect');
			var _welcome  = this.modules.get('welcome');


			var tmp = ('' + request.headers.host).split(':');

			var rawhost = tmp[0] !== undefined ? tmp[0] : '';
			var rawport = tmp[1] !== undefined ? tmp[1] : '80';
			var host    = this.vhosts.get(rawhost);
			var url     = request.url;



			/*
			 * 0. Filter and Blacklist of known Intruders
			 */

			if (_filter.process(host, response, request) === true) {

				_error.process(host, response, {
					status:   403,
					host:     rawhost,
					url:      url,
					resolved: resolved
				});

			}



			/*
			 * 1. Valid VHost
			 */

			if (host !== null) {

				var fs       = null;
				var resolved = null;


				// 1.1. VHost Redirects
				var redirecturl = host.getRedirect(url);
				if (redirecturl !== null) {

					_redirect.process(host, response, {
						url: redirecturl
					});

					return response;

				}


				// 1.2a Sorbet Integration
				if (
					  (url.substr(0,  1) === '/' && host.root === this.root)
					|| url.substr(0, 12) === '/favicon.ico'
					|| url.substr(0,  7) === '/lychee'
					|| url.substr(0,  7) === '/sorbet'
				) {

					if (url === '/') {

						_welcome.process(host, response, {
							host: rawhost,
							port: rawport,
							url:  url
						});

						return response;

					} else {

						fs       = this.fs;
						resolved = fs.resolve(this.root + url);

					}


				// 1.2b VHost Integration
				} else {

					fs       = host.fs;
					resolved = fs.resolve(host.root + url);

				}



				// 1.3a Valid Filesystem Request
				if (
					   fs !== null
					&& resolved !== null
				) {

					// 1.3.1. Redirects for directory URLs
					if (
						   fs.isDirectory(resolved) === true
						&& fs.isFile(resolved + '/index.html') === true
					) {

						_redirect.process(host, response, {
							url: resolved + '/index.html'
						});


					// 1.3.2. File Serving
					} else if (fs.isFile(resolved) === true) {

						_file.process(host, response, {
							url:      url,
							resolved: resolved
						});


					// 1.3.3. File Not Found
					} else {

						_error.process(host, response, {
							status:   404,
							host:     rawhost,
							url:      url,
							resolved: resolved
						});

					}


				// 1.3b Invalid Filesystem Request
				} else {

					_error.process(host, response, {
						status:   404,
						host:     rawhost,
						url:      url,
						resolved: resolved
					});

					if (fs !== null) {
						fs.refresh();
					}

				}



			/*
			 * 2. Invalid Host, Exploit Prevention
			 */

			} else {

				// 2.1a Sorbet Integration
				if (url.substr(0, 13) === '/sorbet/asset') {

					var resolved = this.fs.resolve(this.root + url);
					if (resolved !== null) {

						_file.process(host, response, {
							url:      url,
							resolved: resolved
						});

					} else {

						_error.process(host, response, {
							status:   404,
							host:     rawhost,
							url:      url,
							resolved: null
						});

					}


				// 2.1b Logging of Attacks
				} else {

					if (lychee.debug === true) {

						console.error('sorbet.Main: Illegal Request for "'   + rawhost + ' , ' + url            + '"');
						console.error('sorbet.Main: Remote Address is "'     + request.connection.remoteAddress + '"');
						console.error('sorbet.Main: User Agent is "'         + request.headers['user-agent']    + '"');

					}

					error.execute(404, null, url, callback);

				}

			}



			return response;

		}

	};


	return Class;

});

