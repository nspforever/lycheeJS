
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
		bases:  {
			'lychee': '/lychee/source'
		}
	};

	var _environment = _default;



	/*
	 * HELPERS
	 */

	var _resolve = function(identifier, scope) {

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
	lychee.type    = 'source';
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

		var environment = {
			assets: {},
			tree:   {},
			unique: {},
			tags:   {},
			bases:  {
				'lychee': '/lychee/source'
			}
		};


		for (var id in _default.tree) {

			if (id.substr(0, 6) === 'lychee') {
				environment.tree[id] = _default.tree[id];
			}

		}


		for (var uid in _default.unique) {

			if (uid.substr(0, 6) === 'lychee') {
				environment.unique[uid] = _default.unique[uid];
			}

		}


		return environment;

	};


	lychee.createSandbox = function() {

		var sandbox = {
			lychee: {}
		};


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

		if (object === null) {

			_environment = _default;

			return true;

		} else if (object instanceof Object) {

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
				object.bases = { 'lychee': '/lychee/source' };
			}


			_environment = object;

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

		data = data instanceof Object ? data : null;


		if (data !== null) {

			if (
				typeof data.constructor === 'string'
				&& data.arguments instanceof Array
			) {

				var construct = _resolve(data.constructor, global);
				if (typeof construct === 'function') {

					var bindargs = [].splice.call(data.arguments, 0);
					bindargs.reverse();
					bindargs.push(construct);
					bindargs.reverse();


					for (var b = 0, bl = bindargs.length; b < bl; b++) {

						var value = bindargs[b];
						if (
							   typeof value === 'string'
							&& value.substr(0, 6) === '#this.'
						) {

							var resolved = _resolve(value.substr(6), _environment);
							if (resolved !== null) {
								bindargs[b] = resolved;
							}

						}

					}


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

				} else {

					if (lychee.debug === true) {
						console.warn('lychee.deserialize: Require ' + data.constructor + ' to deserialize it.');
					}

				}

			}

		}


		return null;

	};


	lychee.enumof = function(template, value) {

		if (
			   template instanceof Object
			&& typeof value === 'number'
		) {

			var valid = false;

			for (var val in template) {

				if (value === template[val]) {
					valid = true;
					break;
				}

			}


			return valid;

		}


		return false;

	};

	lychee.interfaceof = function(template, instance) {

		// 1. Interface validation on Template
		if (
			   template instanceof Function
			&& template.prototype instanceof Object
			&& instance instanceof Function
			&& instance.prototype instanceof Object
		) {

			var valid = true;

			for (var method in template.prototype) {

				if (typeof template.prototype[method] !== typeof instance.prototype[method]) {
					valid = false;
					break;
				}

			}


			return valid;


		// 2. Interface validation on Instance
		} else if (
			   template instanceof Function
			&& template.prototype instanceof Object
			&& instance instanceof Object
		) {

			var valid = true;

			for (var method in template.prototype) {

				if (typeof template.prototype[method] !== typeof instance[method]) {
					valid = false;
					break;
				}

			}


			return valid;

		}


		return false;

	};


	if (typeof lychee.build !== 'function') {

		lychee.build = function(callback, scope) {
			console.error("lychee.build: Require lychee.Builder to build the dependency tree.");
		};

	}


	var _throw_warning = function(message) {

		if (lychee.debug === true) {
			console.warn('lychee.DefinitionBlock: Use lychee.define(\'' + this._space + '.' + this._id + '\').' + message + ' instead.');
		}

	};

	var _to_uid = function(definitionblock) {

		var uid = this._space + '.' + this._name;

		var tags = [];
		for (var id in this._tags) {
			tags.push(id + '=' + this._tags[id]);
		}


		if (tags.length > 0) {
			uid += ';' + tags.join(',');
		}


		return uid;

	};


	lychee.DefinitionBlock = function(space, name) {

		// allows new lychee.DefinitionBlock('Renderer') without a namespace
		space = typeof name === 'string' ? space : null;
		name  = typeof name === 'string' ? name  : space;


		this._space    = space;
		this._name     = name;

		this._attaches = {};
		this._tags     = {};
		this._requires = [];
		this._includes = [];
		this._exports  = null;
		this._supports = null;


		return this;

	};


	lychee.DefinitionBlock.prototype = {

		serialize: function() {

			var str = 'lychee.define(' + JSON.stringify(this._space + '.' + this._name) + ')';

			if (Object.keys(this._attaches).length > 0) {

				str += '.attaches({';

				for (var id in this._attaches) {

					str += '\n';

					var attachment = this._attaches[id];
					if (attachment instanceof Font) {
						str += '\t"' + id + '": new Font("' + attachment.url + '"),';
					} else if (attachment instanceof Music) {
						str += '\t"' + id + '": new Music("' + attachment.url + '"),';
					} else if (attachment instanceof Sound) {
						str += '\t"' + id + '": new Sound("' + attachment.url + '"),';
					} else if (attachment instanceof Texture) {
						str += '\t"' + id + '": new Texture("' + attachment.url + '"),';
					} else {
						str += '\t"' + id + '": ' + JSON.stringify(attachment, null, '\t') + ',';
					}

				}

				str = str.substr(str, str.length - 1);

				str += '\n';
				str += '})';

			}

			if (Object.keys(this._tags).length > 0) {
				str += '.tags(' + JSON.stringify(this._tags, null, '\t') + ')';
			}

			if (this._supports !== null) {
				str += '.supports(' + this._supports.toString() + ')'
			}

			if (this._requires.length > 0) {
				str += '.requires(' + JSON.stringify(this._requires, null, '\t') + ')';
			}

			if (this._includes.length > 0) {
				str += '.includes(' + JSON.stringify(this._includes, null, '\t') + ')';
			}

			if (this._exports !== null) {
				str += '.exports(' + this._exports.toString() + ');';
			}


			return str;

		},

		attaches: function(attachments) {

			if (attachments instanceof Object === false) {
				_throw_warning.call(this, 'attach({ name: new Texture(url) || new Font(url) || new Music(url) || new Sound(url) })');
				return this;
			}


			for (var name in attachments) {

				if (attachments.hasOwnProperty(name)) {

					var value = attachments[name];
					this._attaches[name] = value;

				}

			}


			return this;

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


			var id = this._space + '.' + this._name;
			if (_environment.tree[id] == null) {

				if (lychee.type === 'build') {

					_environment.tree[id] = this;

				} else {

					if (
						   this._supports === null
						|| this._supports.call(global, lychee, global) === true
					) {

						_environment.tree[id] = this;

					}

				}

			}


			var uid = _to_uid.call(this);
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

