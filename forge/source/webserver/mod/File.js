
lychee.define('game.webserver.mod.File').requires([
	'game.webserver.Template'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(webserver) {

		this.__webserver = webserver;

	};


	Class.MIME = {

		'default': { encoding: 'binary', type: 'application/octet-stream' },
		'txt':     { encoding: 'utf8',   type: 'text/plain' },

		// Images
		'ico':     { encoding: 'binary', type: 'image/x-icon' },
		'jpg':     { encoding: 'binary', type: 'image/jpeg' },
		'png':     { encoding: 'binary', type: 'image/png' },
		'svg':     { encoding: 'utf8',   type: 'image/svg+xml' },

		// Audio + Video
		'mp3':     { encoding: 'binary', type: 'audio/mp3' },
		'ogg':     { encoding: 'binary', type: 'application/ogg' },
		'webm':    { encoding: 'binary', type: 'video/webm' },

		// Web: Source
		'html':    { encoding: 'utf8',   type: 'text/html' },
		'css':     { encoding: 'utf8',   type: 'text/css' },
		'js':      { encoding: 'utf8',   type: 'application/javascript' },
		'json':    { encoding: 'utf8',   type: 'application/json' },

		// Web: Fonts
		'eot':     { encoding: 'utf8',   type: 'application/vnd.ms-fontobject' },
		'fnt':     { encoding: 'utf8',   type: 'application/json' },
		'ttf':     { encoding: 'utf8',   type: 'application/x-font-truetype' },
		'woff':    { encoding: 'utf8',   type: 'application/font-woff' },

		// Web: Translations
		'mo':      { encoding: 'utf8',   type: 'text/x-gettext-catalog' },
		'po':      { encoding: 'utf8',   type: 'text/x-gettext-translation' },
		'pot':     { encoding: 'utf8',   type: 'text/x-pot' },


		// Web: Stuff

		'tar':     { encoding: 'binary', type: 'application/x-tar' },
		'gz':      { encoding: 'binary', type: 'application/x-gzip' },
		'tar.gz':  { encoding: 'binary', type: 'application/x-tgz' },
		'zip':     { encoding: 'binary', type: 'application/zip' }

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		execute: function(host, url, callback) {

			var tmp1 = url.split('/');
			var tmp2 = tmp1[tmp1.length - 1].split('.');


			var mime = Class.MIME['default'];

			var extension = tmp2[tmp2.length - 1];
			if (Class.MIME[extension] !== undefined) {
				mime = Class.MIME[extension];
			} else {

				if (lychee.debug === true) {
					console.error('game.webserver.mod.File: Unknown MIME type for ' + url);
				}

			}



			var response = {
				status: 200,
				header: {
					'Cache-Control': 'no-transform',
					'Content-Type':  mime.type,
					'Vary':          'Accept-Encoding'
				},
				body: ''
			};


			if (mime.type.substr(0,4 ) === 'text') {
				response.header['Content-Type'] = mime.type + '; charset=utf-8';
			}


			var errormod = this.__webserver.getMod('error');

			host.fs.read(url, function(data, modtime) {

				var expires = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days

				response.header['Expires']       = new Date(expires).toUTCString();
				response.header['Last-Modified'] = modtime;


				if (data === null) {

					if (errormod !== null) {
						errormod.execute(500, host, url, callback);
					}

				} else {

					var info = host.fs.info(url);
					if (info !== null) {
						response.header['ETag'] = '"' + info.ino + '-' + info.size + '-' + Date.parse(info.mtime) + '"';
					}


					response.body = data;
					callback(response);

				}

			}, this);

		}

	};


	return Class;

});

