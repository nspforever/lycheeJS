
lychee.define('sorbet.module.File').exports(function(lychee, sorbet, global, attachments) {

	var Class = function(main) {

		this.main = main;
		this.type = 'private';

	};


	Class.MIME = {

		'default': { encoding: 'binary', type: 'application/octet-stream'      },
		'txt':     { encoding: 'utf8',   type: 'text/plain'                    },

		// Media: Images
		'ico':     { encoding: 'binary', type: 'image/x-icon'                  },
		'jpg':     { encoding: 'binary', type: 'image/jpeg'                    },
		'png':     { encoding: 'binary', type: 'image/png'                     },
		'svg':     { encoding: 'utf8',   type: 'image/svg+xml'                 },

		// Media: Audio
		'mp3':     { encoding: 'binary', type: 'audio/mp3'                     },
		'ogg':     { encoding: 'binary', type: 'application/ogg'               },

		// Media: Video
		'webm':    { encoding: 'binary', type: 'video/webm'                    },

		// Source: Shaders
		'fs':      { encoding: 'utf8',   type: 'x-shader/x-fragment'           },
		'vs':      { encoding: 'utf8',   type: 'x-shader/x-vertex'             },

		// Source: Web
		'html':    { encoding: 'utf8',   type: 'text/html'                     },
		'css':     { encoding: 'utf8',   type: 'text/css'                      },
		'js':      { encoding: 'utf8',   type: 'application/javascript'        },
		'json':    { encoding: 'utf8',   type: 'application/json'              },

		'eot':     { encoding: 'utf8',   type: 'application/vnd.ms-fontobject' },
		'fnt':     { encoding: 'utf8',   type: 'application/json'              },
		'ttf':     { encoding: 'utf8',   type: 'application/x-font-truetype'   },
		'woff':    { encoding: 'utf8',   type: 'application/font-woff'         },

		// Blob: Translations
		'mo':      { encoding: 'utf8',   type: 'text/x-gettext-catalog'        },
		'po':      { encoding: 'utf8',   type: 'text/x-gettext-translation'    },
		'pot':     { encoding: 'utf8',   type: 'text/x-pot'                    },

		// Stuff
		'tar':     { encoding: 'binary', type: 'application/x-tar'             },
		'gz':      { encoding: 'binary', type: 'application/x-gzip'            },
		'tar.gz':  { encoding: 'binary', type: 'application/x-tgz'             },
		'zip':     { encoding: 'binary', type: 'application/zip'               }

	};


	Class.prototype = {

		process: function(host, response, data) {

			var _error = this.main.modules.get('error');

			var resolved = data.resolved;
			var tmp1     = resolved.split('/');
			var tmp2     = tmp1[tmp1.length - 1].split('.');
			var ext      = tmp2[tmp2.length - 1];


			var mime = Class.MIME['default'];
			if (Class.MIME[ext] !== undefined) {

				mime = Class.MIME[ext];

			} else {

				if (lychee.debug === true) {
					console.error('sorbet.module.File: Unknown MIME type for "' + resolved + '"');
				}

			}


			var expires = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days

			response.async                   = true;
			response.status                  = 200;
			response.header['Cache-Control'] = 'no-transform';
			response.header['Content-Type']  = mime.type;
			response.header['Expires']       = new Date(expires).toUTCString();
			response.header['Vary']          = 'Accept-Encoding';
			response.content                 = '';

			if (mime.type.substr(0, 4) === 'text') {
				response.header['Content-Type'] = mime.type + '; charset=utf-8';
			}


			host.fs.read(resolved, function(buffer, modtime) {

				response.header['Last-Modified'] = modtime;


				if (buffer === null) {

					_error.process(host, response, {
						status: 500,
						host:   data.host,
						url:    data.url
					});

				} else {

					var info = host.fs.info(resolved);
					if (info !== null) {
						response.header['ETag'] = '"' + info.ino + '-' + info.size + '-' + Date.parse(info.mtime) + '"';
					}


					response.content = buffer;

					response.ready();

				}

			}, this);

		}

	};


	return Class;

});

