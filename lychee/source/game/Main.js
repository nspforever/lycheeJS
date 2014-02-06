
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
			sound:    false
		},

		loop: {
			render: 60,
			update: 60
		},

		renderer: {
			width:      1024,
			height:     768,
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

		load: function() {

			_load_client.call(this, this.settings.server || null);

		},

		reshape: function(orientation, rotation, width, height) {

			var renderer = this.renderer;
			if (renderer !== null) {

				var env = renderer.getEnvironment();

				if (
					orientation !== null
					&& rotation !== null
					&& typeof width === 'number'
					&& typeof height === 'number'
				) {
					env.screen.width  = width;
					env.screen.height = height;
				}


				var settings = this.settings;
				var rs       = this.settings.renderer;
				var rd       = this.defaults.renderer;


				var viewport = this.viewport;
				if (
					   viewport !== null
					&& viewport.fullscreen === true
				) {
					rs.width  = env.screen.width;
					rs.height = env.screen.height;
				} else {
					rs.width  = rd.width;
					rs.height = rd.height;
				}


				renderer.reset(
					rs.width,
					rs.height,
					true
				);

			}


			for (var id in this.__states) {

				var state = this.__states[id];

				state.reshape(orientation, rotation, width, height);

			}

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
				var rs = settings.renderer;
				this.renderer = new lychee.Renderer(rs.id);
				this.renderer.reset(rs.width, rs.height);
				this.renderer.setBackground(rs.background);
			} else {
				// reshape() functionality is not influenced
				settings.renderer = {};
			}


			this.viewport = new lychee.Viewport();
			this.viewport.bind('reshape', this.reshape, this);
			this.viewport.bind('hide',    this.stop,    this);
			this.viewport.bind('show',    this.start,   this);


			if (settings.viewport !== null) {
				var vs = settings.viewport;
				this.viewport.setFullscreen(vs.fullscreen);
			}

		},

		start: function() {
			this.loop.start();
		},

		stop: function() {
			this.loop.stop();
		},

		resetState: function(leavedata, enterdata) {

			leavedata = leavedata instanceof Object ? leavedata : null;
			enterdata = enterdata instanceof Object ? enterdata : null;


			var state = this.getState();
			if (state !== null) {

				state.leave(leavedata);
				state.reset();
				state.enter(enterdata);

			}

		},

		resetStates: function() {

			var current = this.getState();
			if (current !== null) {
				this.resetState();
			}


			for (var id in this.__states) {

				var state = this.__states[id];
				if (state === current) continue;

				state.reset();

			}

		},

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

		isState: function(id) {

			id = typeof id === 'string' ? id : null;

			if (id !== null) {
				return this.__state === this.__states[id];
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

		removeState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (
				   id !== null
				&& this.__states[id] !== undefined
			) {

				delete this.__states[id];

				return true;

			}


			return false;

		},

		changeState: function(id, data) {

			data = data || null;


			var oldState = this.__state;
			var newState = this.__states[id] || null;
			if (newState === null) {
				return false;
			}


			if (oldState !== null) {
				oldState.leave && oldState.leave();
			}

			if (newState !== null) {
				newState.enter && newState.enter(data);
			}

			this.__state = newState;


			return true;

		},

		render: function(t, dt) {

			if (this.__state !== null) {
				this.__state.render && this.__state.render(t, dt);
			}

		},

		update: function(t, dt) {

			if (this.__state !== null) {
				this.__state.update && this.__state.update(t, dt);
			}

		}

	};


	return Class;

});

