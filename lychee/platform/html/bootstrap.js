
(function(lychee, global) {

	/*
	 * HELPERS
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



	/*
	 * FONT IMPLEMENTATION
	 */

	var Font = function(url) {

		// Hint: default charset from 32 to 126

		this.url     = url;
		this.onload  = null;
		this.texture = null;

		this.baseline   = 0;
		this.charset    = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
		this.spacing    = 0;
		this.kerning    = 0;
		this.lineheight = 0;

		this.__buffer = {};

	};


	Font.prototype = {

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

	var _texture_id = 0;

	var Texture = function(url) {

		this.id      = _texture_id++;
		this.url     = url;
		this.onload  = null;
		this.texture = null;

		this.buffer = null;
		this.width  = 0;
		this.height = 0;

	};


	Texture.prototype = {

		load: function() {

			var that = this;

			var img = new Image();
			img.onload = function() {

				that.buffer = this;
				that.width  = this.width;
				that.height = this.height;

				if (that.onload instanceof Function) {
					that.onload();
				}

			};
			img.src = this.url;

		}

	};


	global.Font    = Font;
	global.Texture = Texture;


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

})(this.lychee, this);

