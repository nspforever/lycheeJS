
(function(lychee, global) {

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
							console.error('Texture at ' + that.url + ' is invalid. It is NOT a PNG file.');
						}

					}

				}


				var is_power_of_two = (this.width & (this.width - 1)) === 0 && (this.height & (this.height - 1)) === 0;
				if (is_power_of_two === false && is_embedded === false) {

					if (lychee.debug === true) {
						console.warn('Texture at ' + that.url + ' is NOT power-of-two. Mipmaps cannot be generated.');
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
						console.warn('JSON file at ' + url + ' is invalid.');
					}


					that.__pending[url] = false;
					_cache[url] = data;
					that._progress(url, _cache);

				}

			};

			xhr.send(null);


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


		// 5. CSS (won't affect JavaScript anyhow)
		} else if (type === 'css') {

			this.__pending[url] = false;
			_cache[url] = '';

			var link  = document.createElement('link');
			link.rel  = 'stylesheet';
			link.href = url;

			document.head.appendChild(link);


		// 6. Unknown File Types (will be loaded as text)
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
	global.Texture = Texture;

})(this.lychee, this);

