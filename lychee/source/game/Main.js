
lychee.define('lychee.game.Main').requires([
	'lychee.Input',
	'lychee.Renderer',
	'lychee.Viewport',
	'lychee.game.Jukebox',
	'lychee.game.Loop',
	'lychee.net.Client'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _toString = Object.prototype.toString;
	var _extend_recursive = function(obj) {

		for (var a = 1, al = arguments.length; a < al; a++) {

			var obj2 = arguments[a];
			if (obj2) {

				for (var prop in obj2) {

					if (_toString.call(obj2[prop]) === '[object Object]') {
						obj[prop] = {};
						_extend_recursive(obj[prop], obj2[prop]);
					} else {
						obj[prop] = obj2[prop];
					}

				}

			}

		}


		return obj;

	};

	var _load_client = function(url) {

		url = typeof url === 'string' ? url : '/sorbet/module/Server';


		var preloader = new lychee.Preloader();

		preloader.bind('ready', function(assets, mappings) {

			var settings = assets[Object.keys(assets)[0]];
			if (settings !== null) {
				this.settings.client = lychee.extend({}, settings);
			}


			preloader.unbind('ready');
			preloader.unbind('error');

			this.init();

		}, this);

		preloader.bind('error', function(assets, mappings) {

			preloader.unbind('ready');
			preloader.unbind('error');

			this.init();

		}, this);

		preloader.load(url, null, 'json');

	};



	/*
	 * DEFAULT SETTINGS
	 * and SERIALIZATION CACHE
	 */

	var _defaults = {

		input: {
			delay:       0,
			key:         false,
			keymodifier: false,
			touch:       true,
			swipe:       false
		},

		jukebox: {
			channels: 8,
			music:    true,
			sound:    true
		},

		loop: {
			render: 40,
			update: 40
		},

		renderer: {
			width:      null,
			height:     null,
			id:         'game',
			background: '#222222'
		},

		viewport: {
			fullscreen: false
		},

		client: null,
		server: '/sorbet/module/Server'

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings) {

		this.settings = _extend_recursive({}, _defaults, settings);
		this.defaults = _extend_recursive({}, this.settings);

		this.client   = null;
		this.input    = null;
		this.jukebox  = null;
		this.loop     = null;
		this.renderer = null;
		this.viewport = null;

		this.__states = {};
		this.__state  = null;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			for (var id in blob.states) {

				var stateblob = blob.states[id];

				for (var a = 0, al = stateblob.arguments.length; a < al; a++) {
					if (stateblob.arguments[a] === '#lychee.game.Main') {
						stateblob.arguments[a] = this;
					}
				}

				this.setState(id, lychee.deserialize(stateblob));

			}

		},

		serialize: function() {

			var settings = _extend_recursive({}, this.settings);
			var blob     = {};

			blob.states = {};

			for (var id in this.__states) {
				blob.states[id] = this.__states[id].serialize();
			}


			return {
				'constructor': 'lychee.game.Main',
				'arguments':   [ settings ],
				'blob':        blob
			};

		},



		/*
		 * LOOP INTEGRATION
		 */

		render: function(t, dt) {

			if (this.__state !== null) {
				this.__state.render && this.__state.render(t, dt);
			}

		},

		update: function(t, dt) {

			if (this.__state !== null) {
				this.__state.update && this.__state.update(t, dt);
			}

		},



		/*
		 * VIEWPORT INTEGRATION
		 */

		show: function() {

			var loop = this.loop;
			if (loop !== null) {
				loop.resume();
			}

			var state = this.getState();
			if (state !== null) {
				state.show();
			}

		},

		hide: function() {

			var loop = this.loop;
			if (loop !== null) {
				loop.pause();
			}

			var state = this.getState();
			if (state !== null) {
				state.hide();
			}

		},

		reshape: function(orientation, rotation) {

			var renderer = this.renderer;
			if (renderer !== null) {

				var settings = this.settings;
				if (settings.renderer !== null) {
					renderer.setWidth(settings.renderer.width);
					renderer.setHeight(settings.renderer.height);
				}

			}


			for (var id in this.__states) {

				var state = this.__states[id];

				state.reshape(
					orientation,
					rotation
				);

			}

		},



		/*
		 * INITIALIZATION
		 */

		load: function() {

			_load_client.call(this, this.settings.server || null);

		},

		init: function() {

			lychee.Preloader.prototype._progress(null, null);


			var settings = this.settings;

			if (settings.client !== null) {

				this.client = new lychee.net.Client(settings.client);

				if (
					   settings.client.port != null
					&& settings.client.host != null
				) {

					this.client.listen(settings.client.port, settings.client.host);

				}

			}

			if (settings.input !== null) {
				this.input = new lychee.Input(settings.input);
			}

			if (settings.jukebox !== null) {
				this.jukebox = new lychee.game.Jukebox(settings.jukebox);
			}

			if (settings.loop !== null) {
				this.loop = new lychee.game.Loop(settings.loop);
				this.loop.bind('render', this.render, this);
				this.loop.bind('update', this.update, this);
			}

			if (settings.renderer !== null) {
				this.renderer = new lychee.Renderer(settings.renderer);
			}

			if (settings.viewport !== null) {

				this.viewport = new lychee.Viewport();
				this.viewport.bind('reshape', this.reshape, this);
				this.viewport.bind('hide',    this.hide,    this);
				this.viewport.bind('show',    this.show,    this);

				this.viewport.setFullscreen(settings.viewport.fullscreen);

			}

		},



		/*
		 * STATE MANAGEMENT
		 */

		setState: function(id, state) {

			id = typeof id === 'string' ? id : null;


			if (lychee.interfaceof(lychee.game.State, state) === true) {

				if (id !== null) {

					this.__states[id] = state;

					return true;

				}

			}


			return false;

		},

		getState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {
				return this.__states[id] || null;
			}


			return this.__state || null;

		},

		isState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {
				return this.__state === this.__states[id];
			}


			return false;

		},

		removeState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (
				   id !== null
				&& this.__states[id] !== undefined
			) {

				delete this.__states[id];

				if (this.__state === this.__states[id]) {
					this.changeState(null);
				}

				return true;

			}


			return false;

		},

		changeState: function(id, data) {

			id   = typeof id === 'string' ? id   : null;
			data = data instanceof Object ? data : null;


			var oldstate = this.__state;
			var newstate = this.__states[id] || null;

			if (newstate !== null) {

				if (oldstate !== null) {
					oldstate.leave();
				}

				if (newstate !== null) {
					newstate.enter(data);
				}

				this.__state = newstate;

			} else {

				if (oldstate !== null) {
					oldstate.leave();
				}

				this.__state = null;

			}


			return true;

		}

	};


	return Class;

});

