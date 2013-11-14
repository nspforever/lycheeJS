
if (typeof global !== 'undefined') {
	global.lychee = {};
} else {
	this.lychee = {};
}


(function(lychee, global) {

	var _default = {
		assets: {},
		tree:   {},
		unique: {},
		tags:   {},
		bases:  { 'lychee': './lychee' }
	};

	var _environment = _default;



	/*
	 * HELPERS
	 */

	var _resolve_constructor = function(identifier, scope) {

		var pointer = scope;

		var ns = identifier.split('.');
		for (var n = 0, l = ns.length; n < l; n++) {

			var name = ns[n];

			if (pointer[name] !== undefined) {
				pointer = pointer[name];
			} else {
				pointer = null;
				break;
			}

		}


		return pointer;

	};



	/*
	 * IMPLEMENTATION
	 */

	lychee.debug   = false;
	lychee.VERSION = 0.8;


	lychee.define = function(name) {

		var namespace = null,
			classname = null;

		if (name.match(/\./)) {
			var tmp = name.split('.');
			classname = tmp[tmp.length - 1];
			tmp.pop();
			namespace = tmp.join('.');
		} else {
			classname = name;
			namespace = 'lychee';
		}


		return new lychee.DefinitionBlock(namespace, classname);

	};


	lychee.extendsafe = function(target) {

		for (var a = 1, al = arguments.length; a < al; a++) {

			var object = arguments[a];
			if (object) {

				for (var prop in object) {

					var tvalue = target[prop];
					var ovalue = object[prop];
					if (
						   tvalue instanceof Array
						&& ovalue instanceof Array
					) {

						lychee.extendsafe(target[prop], object[prop]);

					} else if (
						   tvalue instanceof Object
						&& ovalue instanceof Object
					) {

						lychee.extendsafe(target[prop], object[prop]);

					} else if (
						typeof tvalue === typeof ovalue
					) {

						target[prop] = object[prop];

					}

				}

			}

		}


		return target;

	};


	lychee.extend = function(target) {

		for (var a = 1, al = arguments.length; a < al; a++) {

			var object = arguments[a];
			if (object) {

				for (var prop in object) {
					target[prop] = object[prop];
				}

			}

		}


		return target;

	};


	lychee.rebase = function(settings) {

		settings = settings instanceof Object ? settings : null;


		if (settings !== null) {

			for (var namespace in settings) {

				if (settings.hasOwnProperty(namespace)) {
					_environment.bases[namespace] = settings[namespace];
				}

			}

		}


		return lychee;

	};


	lychee.tag = function(settings) {

		settings = settings instanceof Object ? settings : null;


		if (settings !== null) {

			for (var tag in settings) {

				if (settings.hasOwnProperty(tag)) {

					var values = null;

					if (settings[tag] instanceof Array) {
						values = settings[tag];
					} else if (typeof settings[tag] === 'string') {
						values = [ settings[tag] ];
					}

					if (values !== null) {
						_environment.tags[tag] = values;
					}

				}

			}

		}


		return lychee;

	};


	lychee.createEnvironment = function() {

		var sandboxenv = {
			assets: {},
			tree:   {},
			unique: {},
			tags:   {},
			bases:  { 'lychee': './lychee' }
		};


		for (var id in _default.tree) {

			if (id.substr(0, 6) === 'lychee') {
				sandboxenv.tree[id] = _default.tree[id];
			}

		}


		for (var uid in _default.unique) {

			if (uid.substr(0, 6) === 'lychee') {
				_sandboxenv.unique[uid] = _default.unique[uid];
			}

		}


		return sandboxenv;

	};


	lychee.createSandbox = function() {

		var sandbox = {};

		sandbox.lychee = {};


		for (var id in lychee) {

			if (
				   id.match(/debug|define|extend|generate|rebase|tag|build|createEnvironment|createGlobal|getEnvironment|setEnvironment/)
				|| id === 'DefinitionBlock'
				|| id === 'VERSION'
				|| id === 'Builder'
				|| id === 'Preloader'
			) {

				sandbox.lychee[id] = lychee[id];

			}

		}


		sandbox.setTimeout = function(callback, timeout) {
			setTimeout(callback, timeout);
		};

		sandbox.setInterval = function(callback, interval) {
			setInterval(callback, interval);
		};


		return sandbox;

	};


	lychee.getEnvironment = function() {
		return _environment;
	};

	lychee.setEnvironment = function(object) {

		if (
			   object !== null
			&& object instanceof Object
		) {

			if (object.assets === undefined) {
				object.assets = {};
			}

			if (object.tree === undefined) {
				object.tree = {};
			}

			if (object.tags === undefined) {
				object.tags = {};
			}

			if (object.bases === undefined) {
				object.bases = { 'lychee': './lychee' };
			}


			_environment = object;

			return true;

		} else {

			_environment = _default;

			return true;

		}


		return false;

	};


	lychee.serialize = function(object) {

		object = object !== undefined ? object : null;


		if (object !== null) {

			if (typeof object.serialize === 'function') {
				return object.serialize();
			} else {
				return JSON.parse(JSON.stringify(object));
			}

		}


		return null;

	};


	lychee.deserialize = function(data) {

		if (data instanceof Object) {

			if (
				typeof data.constructor === 'string'
				&& data.arguments instanceof Array
			) {

				var construct = _resolve_constructor(data.constructor, global);
				if (typeof construct === 'function') {

					var bindargs = [].splice.call(data.arguments, 0);
					bindargs.reverse();
					bindargs.push(construct);
					bindargs.reverse();


					var instance = new (
						construct.bind.apply(
							construct,
							bindargs
						)
					)();


					var blob = data.blob || null;
					if (
						   blob !== null
						&& typeof instance.deserialize === 'function'
					) {

						instance.deserialize(blob);

					}


					return instance;

				}

			}

		}


		if (data === undefined) {
			data = null;
		}


		return data;

	};


	if (typeof lychee.build !== 'function') {

		lychee.build = function(callback, scope) {
			throw "lychee.build: You need to include the lychee.Builder to build the dependency tree.";
		};

	}


	var _throw_warning = function(message) {

		if (lychee.debug === true) {
			console.warn('lychee.DefinitionBlock: Use lychee.define(\'' + this._space + '.' + this._id + '\').' + message + ' instead.');
		}

	};


	lychee.DefinitionBlock = function(space, name) {

		// allows new lychee.DefinitionBlock('Renderer') without a namespace
		space = typeof name === 'string' ? space : null;
		name  = typeof name === 'string' ? name  : space;


		this._space    = space;
		this._name     = name;
		this._tags     = {};
		this._requires = [];
		this._includes = [];
		this._exports  = null;
		this._supports = null;


		return this;

	};


	lychee.DefinitionBlock.prototype = {

		toUniqueString: function() {

			var uid = this.toString();

			var tags = [];
			for (var id in this._tags) {
				tags.push(id + '=' + this._tags[id]);
			}


			if (tags.length > 0) {
				uid += ';' + tags.join(',');
			}


			return uid;

		},

		toString: function() {
			return this._space + '.' + this._name;
		},

		tags: function(tags) {

			if (tags instanceof Object === false) {
				_throw_warning.call(this, 'tags({ tag: \'value\' })');
				return this;
			}


			for (var name in tags) {

				if (tags.hasOwnProperty(name)) {

					var value = tags[name];
					this._tags[name] = value;

				}

			}


			return this;

		},

		supports: function(supports) {

			if (supports instanceof Function === false) {
				_throw_warning.call(this, 'supports(function() {})');
				return this;
			}


			this._supports = supports;


			return this;

		},

		requires: function(requires) {

			if (requires instanceof Array === false) {
				_throw_warning.call(this, 'requires([ \'array\', \'of\', \'requirements\' ])');
				return this;
			}


			for (var r = 0, l = requires.length; r < l; r++) {

				var id;

				if (requires[r].match(/\./)) {
					id = requires[r];
				} else if (this._space !== null) {
					id = this._space + '.' + requires[r];
				} else {
					id = requires[r];
				}

				this._requires.push(id);

			}


			return this;

		},

		includes: function(includes) {

			if (includes instanceof Array === false) {
				_throw_warning.call(this, 'includes([ \'array\', \'of\', \'includes\' ])');
				return this;
			}


			for (var i = 0, l = includes.length; i < l; i++) {

				var id;

				if (includes[i].match(/\./)) {
					id = includes[i];
				} else if (this._space !== null) {
					id = this._space + '.' + includes[i];
				} else {
					id = includes[i];
				}

				this._includes.push(id);

			}


			return this;

		},

		exports: function(exports) {

			if (exports instanceof Function === false) {
				_throw_warning.call(this, 'exports(function(lychee, ' + (this._space !== 'lychee' ? (this._space + ', ') : '') + 'global, attachments) { })');
				return this;
			}


			this._exports = exports;


			var id = this.toString();
			if (_environment.tree[id] == null) {

				if (this._supports === null || this._supports.call(global, lychee, global) === true) {
					_environment.tree[id] = this;
				}

			}


			var uid = this.toUniqueString();
			if (_environment.unique[uid] == null) {
				_environment.unique[uid] = this;
			}

		}

	};

})(lychee, typeof global !== 'undefined' ? global : this);



(function(global) {

	if (typeof console === 'undefined') {
		global.console = {};
	}


	if (console.log === undefined) {
		console.log = function() {}; // stub!
	}

	if (console.error === undefined) {

		console.error = function() {

			var args = [].splice.call(arguments, 0);

			args.reverse();
			args.push('(E)\t');
			args.reverse();

			console.log.apply(console, args);

		};

	}

	if (console.warn === undefined) {

		console.warn = function() {

			var args = [].splice.call(arguments, 0);

			args.reverse();
			args.push('(W)\t');
			args.reverse();

			console.log.apply(console, args);

		};

	}

	if (console.group === undefined) {

		console.group = function(title) {
			console.log('~ ~ ~ ' + title + ' ~ ~ ~');
		};

	}

	if (console.groupEnd === undefined) {

		console.groupEnd = function() {
			console.log('~ ~ ~ ~ ~ ~');
		};

	}

})(typeof global !== 'undefined' ? global : this);

