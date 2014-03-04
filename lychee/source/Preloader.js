
(function(lychee, global) {

	var _instances = [];

	/*
	 * HELPERS
	 */

	var _globalIntervalId = null;
	var _globalInterval   = function() {

		var cache = lychee.getEnvironment().assets;

		var timedOutInstances = 0;

		for (var i = 0, il = _instances.length; i < il; i++) {

			var instance = _instances[i];
			var isReady  = true;

			for (var url in instance.__pending) {

				if (
					   instance.__pending[url] === true
					|| cache[url] === undefined
				) {
					isReady = false;
				}

			}


			var timedOut = false;
			if (instance.__clock !== null) {
				timedOut = Date.now() >= instance.__clock + instance.timeout;
			} else {
				// lychee.Preloader instance without called load()
				timedOut = true;
			}


			if (isReady === true || timedOut === true) {

				var errors = {};
				var ready  = {};
				var map    = {};

				for (var url in instance.__pending) {

					if (instance.__fired[url] === undefined) {

						if (instance.__pending[url] === false) {
							ready[url] = cache[url] || null;
						} else {
							errors[url] = null;
						}

						map[url] = instance.__map[url] || null;
						instance.__fired[url] = true;

					}

				}


				if (Object.keys(errors).length > 0) {
					_trigger_instance.call(instance, 'error', [ errors, map ]);
				}


				if (Object.keys(ready).length > 0) {
					_trigger_instance.call(instance, 'ready', [ ready, map ]);
				}


				if (timedOut === true) {
					timedOutInstances++;
				}

			}

		}


		if (timedOutInstances === _instances.length) {

			if (lychee.debug === true) {
				console.log('lychee.Preloader: Switching to Idle Mode');
			}

			for (var i = 0, il = _instances.length; i < il; i++) {
				_instances[i].__clock = null;
			}

			global.clearInterval(_globalIntervalId);
			_globalIntervalId = null;

		}

	};

	var _trigger_instance = function(type, data) {

		type = typeof type === 'string' ? type : null;
		data = data instanceof Array    ? data : null;


		if (this.___events[type] !== undefined) {

			var args  = [];
			var entry = this.___events[type];

			if (data !== null) {
				args.push.apply(args, data);
			}


			entry.callback.apply(entry.scope, args);


			return true;

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	lychee.Preloader = function(data) {

		var settings = lychee.extend({}, data);


		this.timeout   = 3000;

		this.__fired   = {}; // cached fired events per request
		this.__map     = {}; // associated data per request
		this.__pending = {}; // pending requests
		this.__clock   = null;
		this.___events = {};


		this.setTimeout(settings.timeout);

		delete settings.timeout;


		_instances.push(this);

		settings = null;

	};


	lychee.Preloader.prototype = {

		/*
		 * EVENT API
		 *
		 * simplified API of lychee.event.Emitter
		 * due to no-dependency reasons
		 *
		 */

		bind: function(type, callback, scope) {

			type     = typeof type === 'string'     ? type     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (type === null || callback === null) {
				return false;
			}


			this.___events[type] = {
				callback: callback,
				scope:    scope
			};


			return true;

		},

		unbind: function(type) {

			type = typeof type === 'string' ? type : null;


			var found = false;

			if (type !== null) {

				if (this.___events[type] !== undefined) {
					delete this.___events[type];
					found = true;
				}

			} else {

				for (var type in this.___events) {
					delete this.___events[type];
					found = true;
				}

			}


			return found;

		},



		/*
		 * PUBLIC API
		 */

		destroy: function() {

			var found = false;

			for (var i = 0, il = _instances.length; i < il; i++) {

				if (_instances[i] === this) {
					_instances.splice(i, 1);
					found = true;
					il--;
					i--;
				}

			}

			this.unbind();


			return found;

		},

		load: function(urls, map, extension) {

			var cache = lychee.getEnvironment().assets;

			urls      = urls instanceof Array         ? urls      : (typeof urls === 'string' ? [ urls ] : null);
			map       = map !== undefined             ? map       : null;
			extension = typeof extension === 'string' ? extension : null;


			if (urls === null) {
				return false;
			}


			this.__clock = Date.now();


			// 1. Load the assets via platform-specific APIs
			for (var u = 0, l = urls.length; u < l; u++) {

				var url = urls[u];
				var tmp = url.split(/\./);


				if (this.__pending[url] === undefined) {

					if (map !== null) {
						this.__map[url] = map;
					}


					// 1.1 Check if another lychee.Preloader
					// instance already loaded the requested
					// URL to the shared cache.

					if (cache[url] != null) {

						this.__pending[url] = false;

					} else {

						if (extension !== null) {
							this._load(url, extension, cache);
						} else {
							this._load(url, tmp[tmp.length - 1], cache);
						}

					}

				}

			}


			// 2. Start the global interval
			if (_globalIntervalId === null) {
				_globalIntervalId = global.setInterval(function() {
					_globalInterval();
				}, 100);
			}

		},

		get: function(url) {

			var cache = lychee.getEnvironment().assets;

			if (cache[url] !== undefined) {
				return cache[url];
			}


			return null;

		},

		setTimeout: function(timeout) {

			timeout = typeof timeout === 'number' ? timeout : null;


			if (timeout !== null) {

				this.timeout = timeout;

				return true;

			}


			return false;

		},



		/*
		 * PLATFORM-SPECIFIC Implementation
		 */

		_load: function(url, type, _cache) {
			console.error("lychee.Preloader: You need to include the platform-specific bootstrap.js to load other files.");
		},

		_progress: function(url, _cache) {

		}

	};

})(lychee, typeof global !== 'undefined' ? global : this);

