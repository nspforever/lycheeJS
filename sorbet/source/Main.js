
lychee.define('sorbet.Main').requires([
	'sorbet.module.Blacklist',
	'sorbet.module.Error',
	'sorbet.module.File',
	'sorbet.module.Project',
	'sorbet.module.Redirect',
	'sorbet.module.Server',
	'sorbet.module.Welcome',
	'sorbet.data.Filesystem',
	'sorbet.data.Profile',
	'sorbet.data.Map',
	'sorbet.data.VHost'
]).exports(function(lychee, sorbet, global, attachments) {

	var http = require('http');
	var zlib = require('zlib');



	var _database   = sorbet.data.Profile;
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

	var _parse_parameters = function(url) {

		var parameters = null;

		if (url.indexOf('?') !== -1) {

			parameters = {};

			var tmp = url.substr(url.indexOf('?') + 1).split('&');
			for (var t = 0, tl = tmp.length; t < tl; t++) {

				var tmp2 = tmp[t].split('=');
				parameters[tmp2[0]] = tmp2[1];

			}

		}


		return parameters;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(root, profile, settings) {

		root = typeof root === 'string' ? root : '/var/www';


		this.db      = new _database(profile);
		this.fs      = new _filesystem(root);
		this.root    = root;
		this.servers = new _map();

		this.vhosts  = new _map();
		this.modules = new _map();


		if (settings instanceof Array) {

			for (var s = 0, sl = settings.length; s < sl; s++) {

				var blob   = settings[s];
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

		}


		this.modules.set('blacklist', new _module['Blacklist'](this));
		this.modules.set('error',     new _module['Error'](this));
		this.modules.set('file',      new _module['File'](this));
		this.modules.set('redirect',  new _module['Redirect'](this));
		this.modules.set('welcome',   new _module['Welcome'](this));


		var that = this;
		setTimeout(function() { that.modules.set('server',  new _module['Server'](that));  }, 1000);
		setTimeout(function() { that.modules.set('project', new _module['Project'](that)); }, 1000);

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

				this.servers.set(null, server);

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


			var _blacklist = this.modules.get('blacklist');
			var _error     = this.modules.get('error');
			var _file      = this.modules.get('file');
			var _redirect  = this.modules.get('redirect');
			var _welcome   = this.modules.get('welcome');


			var tmp = ('' + request.headers.host).split(':');

			var remote  = request.connection.remoteAddress;
			var referer = request.headers.referer || null;
			var rawhost = tmp[0] !== undefined ? tmp[0] : '';
			var rawport = parseInt(tmp[1] !== undefined ? tmp[1] : '80', 10);
			var host    = this.vhosts.get(rawhost);
			var url     = request.url;



			/*
			 * 0. Blacklist of known Intruders
			 */

			var result = _blacklist.check(host, response, {
				host:      rawhost,
				port:      rawport,
				referer:   referer,
				remote:    remote,
				useragent: request.headers['user-agent'],
				url:       url
			});

			if (result === true) {

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


					} else if (url.substr(0, 15) === '/sorbet/module/') {

						var moduleid   = url.split('/')[3] || null;
						var action     = null;
						var parameters = _parse_parameters(url);

						if (
							   moduleid !== null
							&& parameters !== null
						) {

							url    = url.substr(0, url.indexOf('?'));
							action = url.substr(url.indexOf(moduleid) + moduleid.length + 1);

						}


						if (moduleid !== null) {

							var module = this.modules.get(moduleid.toLowerCase());
							if (
								   module !== null
								&& module.type === 'public'
							) {

								if (lychee.debug === true) {
									console.log('sorbet.Main: Processing Module call: "' + moduleid + ', ' + url + ', ' + JSON.stringify(parameters) + '"');
								}

								module.process(host, response, {
									action:     action,
									parameters: parameters,
									referer:    referer,
									host:       rawhost,
									port:       rawport,
									url:        url
								});

							}

						}

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

				// 2.1a Sorbet Asset Integration
				if (url.substr(0, 13) === '/sorbet/asset') {

					host = { fs: this.fs };


					var resolved = host.fs.resolve(this.root + url);
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

					_blacklist.log({
						host:      rawhost,
						port:      rawport,
						referer:   referer,
						remote:    remote,
						useragent: request.headers['user-agent'],
						url:       url
					});

					_error.process(null, response, {
						status:   404,
						host:     rawhost,
						url:      url,
						resolved: null
					});

				}

			}


			return response;

		},

		terminate: function() {

			var servers = this.servers;

			for (var s = 0, sl = servers.length; s < sl; s++) {

				var server = servers[s];

				if (lychee.debug === true) {
					console.log('sorbet.Main: Terminating ' + server.id + ' (' + server.pid + ')');
				}

				server.exit(0);

			}

		}

	};


	return Class;

});

