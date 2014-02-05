
(function(lychee, global) {

	/*
	 * FEATURE DETECTION
	 */

	var _codecs = {};

	(function() {

		var mime = {
			'ogg':  [ 'application/ogg', 'audio/ogg', 'audio/ogg; codecs=theora, vorbis' ],
			'mp3':  [ 'audio/mpeg' ]

// TODO: Evaluate if other formats are necessary
/*
			'aac':  [ 'audio/aac', 'audio/aacp' ],
			'caf':  [ 'audio/x-caf', 'audio/x-aiff; codecs="IMA-ADPCM, ADPCM"' ],

			'webm': [ 'audio/webm', 'audio/webm; codecs=vorbis' ]
			'3gp':  [ 'audio/3gpp', 'audio/3gpp2'],
			'amr':  [ 'audio/amr' ],
			'm4a':  [ 'audio/mp4; codecs=mp4a' ],
			'mp4':  [ 'audio/mp4' ],
			'wav':  [ 'audio/wave', 'audio/wav', 'audio/wav; codecs="1"', 'audio/x-wav', 'audio/x-pn-wav' ],
*/
		};


		if (global.Audio) {

			var audio = new Audio();

			for (var ext in mime) {

				var variants = mime[ext];
				for (var v = 0, vl = variants.length; v < vl; v++) {

					if (audio.canPlayType(variants[v])) {
						_codecs[ext] = ext;
						break;
					}

				}

			}

		}

	})();



	/*
	 * FONT IMPLEMENTATION
	 */

	var _parse_font = function(data) {

		if (
			   typeof data.kerning === 'number'
			&& typeof data.spacing === 'number'
			&& data.kerning > data.spacing
		) {
			data.kerning = data.spacing;
		}


		if (data.texture !== undefined) {
			this.texture = new Texture(data.texture);
			this.texture.load();
		}


		this.baseline   = typeof data.baseline === 'number'    ? data.baseline   : this.baseline;
		this.charset    = typeof data.charset === 'string'     ? data.charset    : this.charset;
		this.spacing    = typeof data.spacing === 'number'     ? data.spacing    : this.spacing;
		this.kerning    = typeof data.kerning === 'number'     ? data.kerning    : this.kerning;
		this.lineheight = typeof data.lineheight === 'number'  ? data.lineheight : this.lineheight;


		if (data.map instanceof Array) {

			var offset = this.spacing;

			for (var c = 0, cl = this.charset.length; c < cl; c++) {

				var chr = {
					id:     this.charset[c],
					width:  data.map[c] + this.spacing * 2,
					height: this.lineheight,
					real:   data.map[c],
					x:      offset - this.spacing,
					y:      0
				};

				offset += chr.width;


				this.__buffer[chr.id] = chr;

			}

		}


		if (this.onload instanceof Function) {
			this.onload();
		}

	};



	var _font_cache = {};


	var _clone_font = function(origin, clone) {

		clone.texture    = origin.texture;

		clone.baseline   = origin.baseline;
		clone.charset    = origin.charset;
		clone.spacing    = origin.spacing;
		clone.kerning    = origin.kerning;
		clone.lineheight = origin.lineheight;

		clone.__buffer   = origin.__buffer;

	};


	var Font = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url        = url;
		this.onload     = null;
		this.texture    = null;

		this.baseline   = 0;
		this.charset    = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
		this.spacing    = 0;
		this.kerning    = 0;
		this.lineheight = 0;

		this.__buffer   = {};


		var url = this.url;

		if (_font_cache[url] !== undefined) {
			_clone_font(_font_cache[url], this);
		} else {
			_font_cache[url] = this;
		}

	};


	Font.prototype = {

		serialize: function() {

			return {
				'constructor': 'Font',
				'arguments':   [ this.url ]
			};

		},

		get: function(character) {

			character = typeof character === 'string' ? character : null;

			if (character !== null) {
				return this.__buffer[character] || null;
			}


			return null;

		},

		load: function() {

			var that = this;

			var url = this.url;
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=utf8');
			xhr.onreadystatechange = function() {

				if (xhr.readyState === 4) {

					var data = null;
					try {
						data = JSON.parse(xhr.responseText);
					} catch(e) {
					}

					if (data !== null) {
						_parse_font.call(that, data);
					} else {

						if (lychee.debug === true) {
							console.error('bootstrap.js: Font at ' + url + ' is invalid.');
						}

						if (that.onload instanceof Function) {
							that.onload();
						}

					}

				}

			};

			xhr.send(null);

		}

	};



	/*
	 * MUSIC IMPLEMENTATION
	 */

	var _music_cache = {};


	var _clone_music = function(origin, clone) {

		clone.buffer = new Audio(origin.buffer.src);
		clone.buffer.autobuffer = true;
		clone.buffer.preload    = true;
		clone.buffer.load();

		clone.buffer.addEventListener('ended', function() {
			clone.play();
		}, true);

	};


	var Music = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url       = url;
		this.onload    = null;
		this.buffer    = null;
		this.volume    = 1.0;
		this.isIdle    = true;
		this.isLooping = false;


		var url = this.url;

		if (_music_cache[url] !== undefined) {
			_clone_music(_music_cache[url], this);
		} else {
			_music_cache[url] = this;
		}

	};


	Music.prototype = {

		serialize: function() {

			return {
				'constructor': 'Music',
				'arguments':   [ this.url ]
			};

		},

		load: function() {

			var that = this;

			var url = this.url;
			var ext = _codecs['ogg'] || _codecs['mp3'] || null;
			if (ext !== null) {

				this.buffer = new Audio(url + '.' + ext);
				this.buffer.autobuffer = true;
				this.buffer.preload    = true;
				this.buffer.load();


				this.buffer.addEventListener('ended', function() {
					that.play();
				}, false);


				this.buffer.addEventListener('canplaythrough', function() {

					if (that.onload instanceof Function) {
						that.onload();
						that.onload = null;
					}

				}, true);

			}


			setTimeout(function() {

				if (that.onload instanceof Function) {
					that.onload();
					that.onload = null;
				}

			}, 500);

		},

		update: function() {

			if (this.buffer.currentTime >= this.buffer.duration) {
				this.stop();
				this.play();
			}

		},

		clone: function() {
			return new Music(this.url);
		},

		play: function() {

			if (this.buffer !== null) {

				try {
					this.buffer.currentTime = 0;
				} catch(e) {
				}

				this.buffer.play();
				this.isIdle = false;

			}

		},

		pause: function() {

			if (this.buffer !== null) {
				this.buffer.pause();
				this.isIdle = true;
			}

		},

		resume: function() {

			if (this.buffer !== null) {
				this.buffer.play();
				this.isIdle = false;
			}

		},

		stop: function() {

			if (this.buffer !== null) {

				this.buffer.pause();
				this.isIdle = true;

				try {
					this.buffer.currentTime = 0;
				} catch(e) {
				}

			}

		},

		setVolume: function(volume) {

			volume = typeof volume === 'number' ? volume : null;


			if (
				   volume !== null
				&& this.buffer !== null
			) {

				volume = Math.min(Math.max(0, volume), 1);

				this.buffer.volume = volume;
				this.volume        = volume;

				return true;

			}


			return false;

		}

	};



	/*
	 * SOUND IMPLEMENTATION
	 */

	var _sound_cache = {};


	var _clone_sound = function(origin, clone) {

		clone.buffer = new Audio(origin.buffer.src);
		clone.buffer.autobuffer = true;
		clone.buffer.preload    = true;
		clone.buffer.load();

		clone.buffer.addEventListener('ended', function() {
			clone.stop();
		}, true);

	};


	var Sound = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url    = url;
		this.onload = null;
		this.buffer = null;
		this.volume = 1.0;
		this.isIdle = true;


		var url = this.url;

		if (_sound_cache[url] !== undefined) {
			_clone_sound(_sound_cache[url], this);
		} else {
			_sound_cache[url] = this;
		}

	};


	Sound.prototype = {

		serialize: function() {

			return {
				'constructor': 'Sound',
				'arguments':   [ this.url ]
			};

		},

		load: function() {

			var that = this;

			var url = this.url;
			var ext = _codecs['ogg'] || _codecs['mp3'] || null;
			if (ext !== null) {

				this.buffer = new Audio(url + '.' + ext);
				this.buffer.autobuffer = true;
				this.buffer.preload    = true;
				this.buffer.load();


				this.buffer.addEventListener('ended', function() {
					that.stop();
				}, true);


				this.buffer.addEventListener('canplaythrough', function() {

					if (that.onload instanceof Function) {
						that.onload();
						that.onload = null;
					}

				}, true);

			}


			setTimeout(function() {

				if (that.onload instanceof Function) {
					that.onload();
					that.onload = null;
				}

			}, 500);

		},

		clone: function() {
			return new Sound(this.url);
		},

		play: function() {

			if (this.buffer !== null) {

				try {
					this.buffer.currentTime = 0;
				} catch(e) {
				}

				this.buffer.play();
				this.isIdle = false;

			}

		},

		pause: function() {

			if (this.buffer !== null) {
				this.buffer.pause();
				this.isIdle = true;
			}

		},

		resume: function() {

			if (this.buffer !== null) {
				this.buffer.play();
				this.isIdle = false;
			}

		},

		stop: function() {

			if (this.buffer !== null) {

				this.buffer.pause();
				this.isIdle = true;

				try {
					this.buffer.currentTime = 0;
				} catch(e) {
				}

			}

		},

		setVolume: function(volume) {

			volume = typeof volume === 'number' ? volume : null;


			if (
				   volume !== null
				&& this.buffer !== null
			) {

				volume = Math.min(Math.max(0, volume), 1);

				this.buffer.volume = volume;
				this.volume        = volume;

				return true;

			}


			return false;

		}

	};



	/*
	 * TEXTURE IMPLEMENTATION
	 */

	var _texture_id    = 0;
	var _texture_cache = {};


	var _clone_texture = function(origin, clone) {

		clone.id     = origin.id;

		clone.buffer = origin.buffer;
		clone.width  = origin.width;
		clone.height = origin.height;

	};


	var Texture = function(url) {

		url = typeof url === 'string' ? url : null;


		this.id     = _texture_id++;
		this.url    = url;
		this.onload = null;
		this.buffer = null;
		this.width  = 0;
		this.height = 0;


		var url = this.url;

		if (_texture_cache[url] !== undefined) {
			_clone_texture(_texture_cache[url], this);
		} else {
			_texture_cache[url] = this;
		}

	};


	Texture.prototype = {

		serialize: function() {

			return {
				'constructor': 'Texture',
				'arguments':   [ this.url ]
			};

		},

		load: function() {

			if (this.buffer !== null) return;


			var that = this;

			var img = new Image();
			img.onload = function() {

				that.buffer = this;
				that.width  = this.width;
				that.height = this.height;


				var url = that.url;
				var is_embedded = url.substr(0, 10) === 'data:image';
				if (is_embedded === false) {

					var tmp = url.split('.');
					var ext = tmp[tmp.length - 1];

					if (ext !== 'png') {

						if (lychee.debug === true) {
							console.error('bootstrap.js: Texture at ' + that.url + ' is invalid. It is NOT a PNG file.');
						}

					}

				}


				var is_power_of_two = (this.width & (this.width - 1)) === 0 && (this.height & (this.height - 1)) === 0;
				if (is_power_of_two === false && is_embedded === false) {

					if (lychee.debug === true) {
						console.warn('bootstrap.js: Texture at ' + that.url + ' is NOT power-of-two. Mipmaps cannot be generated.');
					}

				}


				if (that.onload instanceof Function) {
					that.onload();
				}

			};
			img.src = this.url;

		}

	};



	/*
	 * PRELOADER IMPLEMENTATION
	 */

	lychee.Preloader.prototype._load = function(url, type, _cache) {

		var that = this;

		// 1. JavaScript
		if (type === 'js') {

			this.__pending[url] = true;

			var script = document.createElement('script');
			script.async = true;
			script.onload = function() {
				that.__pending[url] = false;
				_cache[url] = '';
				that._progress(url, _cache);
			};
			script.src = url;

			document.body.appendChild(script);


		// 2. JSON
		} else if (type === 'json') {

			this.__pending[url] = true;

			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=utf8');
			xhr.onreadystatechange = function() {

				if (xhr.readyState === 4) {

					var data = null;
					try {
						data = JSON.parse(xhr.responseText);
					} catch(e) {
						console.warn('bootstrap.js: JSON file at ' + url + ' is invalid.');
					}


					that.__pending[url] = false;
					_cache[url] = data;
					that._progress(url, _cache);

				}

			};

			xhr.send(null);


		// 3. Textures
		} else if (type === 'png') {

			this.__pending[url] = true;

			var texture = new Texture(url);
			texture.onload = function() {
				that.__pending[url] = false;
				_cache[url] = this;
				that._progress(url, _cache);
			};

			texture.load();


		// 4. Fonts
		} else if (type === 'fnt') {

			this.__pending[url] = true;

			var font = new Font(url);
			font.onload = function() {
				that.__pending[url] = false;
				_cache[url] = this;
				that._progress(url, _cache);
			};

			font.load();


		// 5. Music
		} else if (type === 'msc') {

			this.__pending[url] = true;

			var music = new Music(url);
			music.onload = function() {
				that.__pending[url] = false;
				_cache[url] = this;
				that._progress(url, _cache);
			};

			music.load();

		// 6. Sounds
		} else if (type === 'snd') {

			this.__pending[url] = true;

			var sound = new Sound(url);
			sound.onload = function() {
				that.__pending[url] = false;
				_cache[url] = this;
				that._progress(url, _cache);
			};

			sound.load();

		// 7. CSS (won't affect JavaScript anyhow)
		} else if (type === 'css') {

			this.__pending[url] = false;
			_cache[url] = '';

			var link  = document.createElement('link');
			link.rel  = 'stylesheet';
			link.href = url;

			document.head.appendChild(link);


		// 8. Unknown File Types (will be loaded as text)
		} else {

			this.__pending[url] = true;

			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.onreadystatechange = function() {

				if (xhr.readyState === 4) {

					if (xhr.status === 200 || xhr.status === 304) {

						var data = xhr.responseText || xhr.responseXML || null;

						that.__pending[url] = false;
						_cache[url] = data;
						that._progress(url, _cache);

					} else {

						that.__pending[url] = false;
						_cache[url] = null;

					}

				}

			};

			xhr.send(null);

		}

	};



	/*
	 * EXPORTS
	 */

	global.Font    = Font;
	global.Music   = Music;
	global.Sound   = Sound;
	global.Texture = Texture;

})(this.lychee, this);

