
(function(lychee, global) {

	var fs = require('fs');

	var _environment = null;



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


		this.charset    = typeof data.charset === 'string' ? data.charset : this.charset;

		// ASCII Renderer integration
		this.baseline   = 0;
		this.kerning    = 0;
		this.spacing    = 0;
		this.lineheight = 1;


		if (data.map instanceof Array) {

			for (var c = 0, cl = this.charset.length; c < cl; c++) {

				var id = this.charset[c];

				var chr = {
					width:      1,
					height:     this.lineheight,
					realwidth:  1,
					realheight: this.lineheight,
					x:          0,
					y:          0
				};


				this.__buffer[id] = chr;

			}

		}


		this.measure('');


		if (this.onload instanceof Function) {
			this.onload();
		}

	};

	var _measure_font_text = function(text) {

		var width = 0;

		for (var t = 0, tl = text.length; t < tl; t++) {

			var chr = this.measure(text[t]);
			if (chr !== null) {
				width += chr.realwidth + this.kerning;
			}

		}


		return {
			width:      width,
			height:     this.lineheight,
			realwidth:  width,
			realheight: this.lineheight,
			x:          0,
			y:          0
		};

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
		this.lineheight = 1;

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

		measure: function(text) {

			text = typeof text === 'string' ? text : null;


			if (text !== null) {

				var data = this.__buffer[text] || null;
				if (data === null && text.length > 1) {
					data = this.__buffer[text] = _measure_font_text.call(this, text);
				}

				return data;

			}


			return this.__buffer[''];

		},

		load: function() {

			var that = this;
			var url  = this.url;

			fs.readFile(url, 'utf8', function(err, raw) {

				var data = null;

				if (!err) {

					try {
						data = JSON.parse(raw);
					} catch(e) {
					}

					if (data !== null) {
						_parse_font.call(that, data);
					}

				}

				if (data === null) {

					if (lychee.debug === true) {
						console.error('bootstrap.js: Font at ' + url + ' is invalid.');
					}

				}

				if (that.onload instanceof Function) {
					that.onload();
				}

			});

		}

	};



	/*
	 * MUSIC IMPLEMENTATION
	 */

	var _music_cache = {};


	var _clone_music = function(origin, clone) {

	};


	var Music = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url       = url;
		this.onload    = null;
		this.buffer    = null;
		this.volume    = 0.0;
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

			if (this.onload instanceof Function) {
				this.onload();
			}

		},

		clone: function() {
			return new Music(this.url);
		},

		play: function() {
			this.isIdle = false;
		},

		pause: function() {
			this.isIdle = true;
		},

		resume: function() {
			this.isIdle = false;
		},

		stop: function() {
			this.isIdle = true;
		},

		setVolume: function(volume) {

			volume = typeof volume === 'number' ? volume : null;


			return false;

		}

	};



	/*
	 * SOUND IMPLEMENTATION
	 */

	var _sound_cache = {};


	var _clone_sound = function(origin, clone) {

	};


	var Sound = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url    = url;
		this.onload = null;
		this.buffer = null;
		this.volume = 0.0;
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

			if (this.onload instanceof Function) {
				this.onload();
			}

		},

		clone: function() {
			return new Sound(this.url);
		},

		play: function() {
			this.isIdle = false;
		},

		pause: function() {
			this.isIdle = true;
		},

		resume: function() {
			this.isIdle = false;
		},

		stop: function() {
			this.isIdle = true;
		},

		setVolume: function(volume) {

			volume = typeof volume === 'number' ? volume : null;


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


		this.id      = _texture_id++;
		this.url     = url;
		this.onload  = null;

		this.buffer  = null;
		this.width   = 0;
		this.height  = 0;


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
			var url  = this.url;

			fs.readFile(this.url, 'binary', function(err, raw) {

				var data = null;

				if (!err) {

					that.buffer = raw;
//					that.buffer = new Buffer(raw, 'binary').toString('base64');
					that.width  = 0;
					that.height = 0;

				}


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

			});

		}

	};



	/*
	 * PRELOADER IMPLEMENTATION
	 */

	lychee.Preloader.prototype._load = function(url, type, _cache) {

		var that = this;


		// 1. JavaScript
		if (type === 'js') {

			this.__pending[url] = false;
			_cache[url] = '';

			if (_environment !== null) {
				require(_environment + "/" + url);
			} else {
				require(url);
			}


		// 2. JSON
		} else if (type === 'json') {

			this.__pending[url] = true;

			fs.readFile(url, 'utf8', function(err, raw) {

				that.__pending[url] = false;

				if (err) {
					_cache[url] = false;
				} else {

					var data = null;
					try {
						data = JSON.parse(raw);
					} catch(e) {
						console.warn('JSON file at ' + url + ' is invalid.');
					}

					_cache[url] = data;

				}

				that._progress(url, _cache);

			});


		// 3. Textures
		} else if (type.match(/png/)) {

			this.__pending[url] = true;

			var texture = new Texture(url);
			texture.onload = function() {
				that.__pending[url] = false;
				_cache[url] = this;
				that._progress(url, _cache);
			};

			texture.load();

		// 4. Fonts
		} else if (type.match(/fnt/)) {

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

		// 7. CSS (won't affect NodeJS anyhow)
		} else if (type === 'css') {

			this.__pending[url] = false;
			_cache[url] = '';


		// 8. Unknown File Types (will be loaded as text)
		} else {

			this.__pending[url] = true;

			fs.readFile(url, 'utf8', function(err, data) {

				that.__pending[url] = false;

				if (err) {
					_cache[url] = null;
				} else {
					_cache[url] = data;
				}

			});

		}

	};



	/*
	 * REQUIRED POLYFILLS
	 */


	var _keypress = function(stream) {

		if (_keypress.isEmitting(stream) === true) {
			return;
		} else {
			stream._emitKeypress = true;
		}


		function _onData(data) {
			if (stream.listeners('keypress').length > 0) {
				_keypress.emitKeypress(stream, data);
			}
		};

		function _onNewListener(event) {
			if (event === 'keypress') {
				stream.on('data', _onData);
				stream.removeListener('newListener', _onNewListener);
			}
		};


		stream.on('newListener', _onNewListener);

	};


	_keypress.METAKEYCODE = /^(?:\x1b)([a-zA-Z0-9])$/;
	_keypress.FUNCTIONKEYCODE = /^(?:\x1b+)(O|N|\[|\[\[)(?:(\d+)(?:;(\d+))?([~^$])|(?:1;)?(\d+)?([a-zA-Z]))/;


	_keypress.isEmitting = function(stream) {

		var found = stream._emitKeypress || false;
		if (found === false) {

			stream.listeners('data').forEach(function(listener) {
				if (listener.name === 'onData' && /emitKey/.test(listener.toString())) {
					found = true;
					stream._emitKeypress = true;
				}
			});

		}

		if (found === false) {
			stream.listeners('newListener').forEach(function(listener) {
				if (listener.name === 'onNewListener' && /keypress/.test(listener.toString())) {
					found = true;
					stream._emitKeypress = true;
				}
			});
		}


		return found;

	};

	_keypress.emitKeypress = function(stream, str) {

		var ch;
		var parts;


		if (Buffer.isBuffer(str)) {

			if (str[0] > 127 && str[1] === undefined) {
				str[0] -= 128;
				str = '\x1b' + str.toString(stream.encoding || 'utf-8');
			} else {
				str = str.toString(stream.encoding || 'utf-8');
			}

		}


		var key = {
			name: undefined,
			sequence: str,
			ctrl: false,
			meta: false,
			shift: false
		};


		// Return
		if (str === '\r' || str === '\n') {
			key.name = 'return';

		// Tab
		} else if (str === '\t') {
			key.name = 'tab';

		// Backspace or Ctrl + H
		} else if (str === '\b' || str === '\x7f' || str === '\x1b\b' || str === '\x1b\x7f') {

			key.name = 'backspace';
			key.meta = (str.charAt(0) === '\x1b');

		// Escape
		} else if (str === '\x1b' || str === '\x1b\x1b') {

			key.name = 'escape';
			key.meta = (str.length === 2);

		// Space
		} else if (str === ' ' || str === '\x1b ') {

			key.name = 'space';
			key.meta = (str.length === 2);

		// Ctrl + Letter
		} else if (str <= '\x1a') {

			key.name = String.fromCharCode(str.charCodeAt(0) + 'a'.charCodeAt(0) - 1);
			key.ctrl = true;

		// Letter
		} else if (str.length === 1 && str >= 'a' && str <= 'z') {

			key.name = str;

		// Shift + Letter
		} else if (str.length === 1 && str >= 'A' && str <= 'Z') {

			// was: key.name = str.toLowerCase();
			key.name = str;
			key.shift = true;

		// Meta + Letter
		} else if (parts = _keypress.METAKEYCODE.exec(str)) {

			key.name = parts[1].toLowerCase();
			key.meta = true;
			key.shift = /^[A-Z]$/.test(parts[1]);

		// Function Key (ANSI ESCAPE SEQUENCE)
		} else if (parts = _keypress.FUNCTIONKEYCODE.exec(str)) {

			var code = (parts[1] || '') + (parts[2] || '') + (parts[4] || '') + (parts[6] || '');
			var mod  = (parts[3] || parts[5] || 1) - 1;

			key.ctrl = !!(mod & 4);
			key.meta = !!(mod & 10);
			key.shift = !!(mod & 1);


			// Parse the key itself
			switch (code) {

				/* xterm/gnome ESC O letter */
				case 'OP': key.name = 'f1'; break;
				case 'OQ': key.name = 'f2'; break;
				case 'OR': key.name = 'f3'; break;
				case 'OS': key.name = 'f4'; break;

				/* xterm/rxvt ESC [ number ~ */
				case '[11~': key.name = 'f1'; break;
				case '[12~': key.name = 'f2'; break;
				case '[13~': key.name = 'f3'; break;
				case '[14~': key.name = 'f4'; break;

				/* from Cygwin and used in libuv */
				case '[[A': key.name = 'f1'; break;
				case '[[B': key.name = 'f2'; break;
				case '[[C': key.name = 'f3'; break;
				case '[[D': key.name = 'f4'; break;
				case '[[E': key.name = 'f5'; break;

				/* common */
				case '[15~': key.name = 'f5'; break;
				case '[17~': key.name = 'f6'; break;
				case '[18~': key.name = 'f7'; break;
				case '[19~': key.name = 'f8'; break;
				case '[20~': key.name = 'f9'; break;
				case '[21~': key.name = 'f10'; break;
				case '[23~': key.name = 'f11'; break;
				case '[24~': key.name = 'f12'; break;

				/* xterm ESC [ letter */
				case '[A': key.name = 'up'; break;
				case '[B': key.name = 'down'; break;
				case '[C': key.name = 'right'; break;
				case '[D': key.name = 'left'; break;
				case '[E': key.name = 'clear'; break;
				case '[F': key.name = 'end'; break;
				case '[H': key.name = 'home'; break;

				/* xterm/gnome ESC O letter */
				case 'OA': key.name = 'up'; break;
				case 'OB': key.name = 'down'; break;
				case 'OC': key.name = 'right'; break;
				case 'OD': key.name = 'left'; break;
				case 'OE': key.name = 'clear'; break;
				case 'OF': key.name = 'end'; break;
				case 'OH': key.name = 'home'; break;

				/* xterm/rxvt ESC [ number ~ */
				case '[1~': key.name = 'home'; break;
				case '[2~': key.name = 'insert'; break;
				case '[3~': key.name = 'delete'; break;
				case '[4~': key.name = 'end'; break;
				case '[5~': key.name = 'pageup'; break;
				case '[6~': key.name = 'pagedown'; break;

				/* putty */
				case '[[5~': key.name = 'pageup'; break;
				case '[[6~': key.name = 'pagedown'; break;

				/* rxvt */
				case '[7~': key.name = 'home'; break;
				case '[8~': key.name = 'end'; break;

				/* rxvt keys with modifiers */
				case '[a': key.name = 'up'; key.shift = true; break;
				case '[b': key.name = 'down'; key.shift = true; break;
				case '[c': key.name = 'right'; key.shift = true; break;
				case '[d': key.name = 'left'; key.shift = true; break;
				case '[e': key.name = 'clear'; key.shift = true; break;

				case '[2$': key.name = 'insert'; key.shift = true; break;
				case '[3$': key.name = 'delete'; key.shift = true; break;
				case '[5$': key.name = 'pageup'; key.shift = true; break;
				case '[6$': key.name = 'pagedown'; key.shift = true; break;
				case '[7$': key.name = 'home'; key.shift = true; break;
				case '[8$': key.name = 'end'; key.shift = true; break;

				case 'Oa': key.name = 'up'; key.ctrl = true; break;
				case 'Ob': key.name = 'down'; key.ctrl = true; break;
				case 'Oc': key.name = 'right'; key.ctrl = true; break;
				case 'Od': key.name = 'left'; key.ctrl = true; break;
				case 'Oe': key.name = 'clear'; key.ctrl = true; break;

				case '[2^': key.name = 'insert'; key.ctrl = true; break;
				case '[3^': key.name = 'delete'; key.ctrl = true; break;
				case '[5^': key.name = 'pageup'; key.ctrl = true; break;
				case '[6^': key.name = 'pagedown'; key.ctrl = true; break;
				case '[7^': key.name = 'home'; key.ctrl = true; break;
				case '[8^': key.name = 'end'; key.ctrl = true; break;

				/* misc. */
				case '[Z': key.name = 'tab'; key.shift = true; break;
				default: key.name = undefined; break;

			}

		// Copy and Paste action was done
		} else if (str.length > 1 && str[0] !== '\x1b') {

			Array.prototype.forEach.call(str, function(character) {
				_keypress.emitKeypress(stream, character);
			});

			return;

		}


		if (str.length === 1) {
			ch = str;
		}


		if (key.name !== undefined || ch) {
			stream.emit('keypress', ch, key);
		}

	};



	/*
	 * EXPORTS
	 */

	global.Font    = Font;
	global.Music   = Music;
	global.Sound   = Sound;
	global.Texture = Texture;



	module.exports = function(env) {

		if (typeof env === 'string') {
			_environment = env;
		}

		_keypress(process.stdin);

	};

})(lychee, global);

