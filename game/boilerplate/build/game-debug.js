
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

		toString: function() {

			var str = 'lychee.define(' + JSON.stringify(this._space + '.' + this._name) + ')';

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

		toUIDString: function() {

			var uid = this._space + '.' + this._name;

			var tags = [];
			for (var id in this._tags) {
				tags.push(id + '=' + this._tags[id]);
			}


			if (tags.length > 0) {
				uid += ';' + tags.join(',');
			}


			return uid;

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


			var uid = this.toUIDString();
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


(function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _requires_load = function(reference) {

		// Namespace Include Reference
		if (reference.indexOf('*') > 0) {

			var path = reference.substr(0, reference.indexOf('*') - 1);
			if (this.__loading.classes[path] !== undefined) {
				return false;
			}

		} else {

			var path = reference;
			if (this.__loading.classes[path] !== undefined) {
				return false;
			}

		}


		return true;

	};

	var _load_asset = function(assets, mappings) {

		var refresh = false;
		for (var url in assets) {

			var content = assets[url];
			var mapping = mappings[url];
			var uid     = mapping.packageId + '.' + mapping.classId;

			if (
				mapping !== null
			) {

				// 1. Parse Package Configuration
				if (mapping.packageId !== null && mapping.classId === null) {

					this.__packages[mapping.packageId] = content;
					this.__loading.packages[mapping.packageId] = false;
					refresh = true;

				} else if (mapping.packageId !== null && mapping.classId !== null) {

					mapping._loading--;


					if (
						url.substr(-2) === 'js'
						&& this.__classes[uid] === undefined
					) {

						if (this.__classes[uid] == null) {

							var definitionblock = this.__tree[uid];
							if (definitionblock !== undefined) {

								if (lychee.debug === true) {
									console.log('> using ' + mapping.url);
								}

								this.__classes[uid] = definitionblock;


								if (mapping.attachments.length > 0) {
									this.__attachments[uid] = mapping.attachments;
								}

								if (mapping._loading !== 0) {
									this.__preloader.load(mapping.attachments, mapping);
								}

							} else if (mapping.alternatives !== undefined) {

								var candidate = mapping.alternatives[0];

								candidate.namespaceId = mapping.namespaceId;
								candidate.refererId   = mapping.refererId;

								candidate._loading = candidate.attachments.length + 1;

								if (mapping.alternatives.length > 1) {
									candidate.alternatives = mapping.alternatives.splice(1, mapping.alternatives.length - 1);
								}


								this.__candidates[uid]      = candidate;
								this.__loading.classes[uid] = true;
								this.__preloader.load(candidate.url, candidate);

							} else {

								if (lychee.debug === true) {
									console.warn('> loading ' + uid + ' failed. Either corrupt definition block at ' + url + ' or no alternatives available. (refered by ' + mapping.refererId + ')');
								}


								// This will silently ignore the mistake and still "try" to build successfully.
								this.__loading.classes[uid] = false;
								this.__classes[uid] = null;
								this.__tree[uid] = null;

							}

						}

					}


					if (mapping._loading === 0) {

						this.__loading.classes[uid] = false;
						refresh = true;

					}


					if (mapping.namespaceId !== null) {

						var map = this.__namespaces[mapping.packageId + '.' + mapping.namespaceId];
						map._loading--;


						if (map.loading === 0) {
							this.__loading.classes[mapping.packageId + '.' + mapping.namespaceId] = false;
						}

					}

				}

			}

		}


		if (refresh === true) {
			_refresh_dependencies.call(this);
		}

	};

	var _unload_asset = function(assets, mappings) {

		for (var url in mappings) {

			var mapping = mappings[url];
			if (mapping.packageId !== null && mapping.classId === null) {

				this.__packages[mapping.packageId] = null;
				this.__loading.packages[mapping.packageId] = false;

			} else if (mapping.packageId !== null && mapping.classId !== null) {

				if (lychee.debug === true) {
					console.error('Package Tree index is corrupt, couldn\'t load ' + url + ' (refered by ' + mapping.packageId + '.' + mapping.classId + ')');
				}


				this.__classes[mapping.packageId + '.' + mapping.classId] = null;

				if (mapping.multiple !== true) {

					this.__loading.classes[mapping.packageId + '.' + mapping.classId] = false;

					console.error('No Alternatives available for ' + url);

				}

			}

		}


		_refresh_dependencies.call(this);

	};

	var _load_definitionblock = function(packageId, classId, refererId) {

		packageId = typeof packageId === 'string' ? packageId : null;
		classId   = typeof classId === 'string'   ? classId   : null;
		refererId = typeof refererId === 'string' ? refererId : null;


		// 1. Load Package Configuration
		if (packageId !== null && classId === null) {

			if (this.__packages[packageId] === undefined) {

				var url = (this.__bases[packageId] || '') + '/package.json';

				if (lychee.debug === true) {
					console.log('> loading ' + packageId + ': ' + url);
				}

				this.__loading.packages[packageId] = true;

				this.__preloader.load(url, {
					packageId: packageId,
					classId: classId
				});

				return;

			}

		// 2. Load Class
		} else if (packageId !== null && classId !== null) {

			// Wait for next _refresh_dependencies() if package config wasn't loaded yet
			if (this.__packages[packageId] == null) return;


			if (this.__classes[packageId + '.' + classId] === undefined) {

				var candidates = _get_candidates.call(this, packageId, classId);
				if (candidates !== null) {

					if (lychee.debug === true) {

						var urls = [];
						for (var c = 0, l = candidates.length; c < l; c++) {
							urls.push(candidates[c].url);
						}

						console.log('> loading ' + packageId + '.' + classId, urls.join(', '));

					}


					var namespaceId = null;
					if (classId.indexOf('*') > 0) {

						namespaceId = classId.substr(0, classId.indexOf('*') - 1);

						var overallRequired = 0;
						for (var c = 0, l = candidates.length; c < l; c++) {
							overallRequired += candidates[c].attachments.length + 1;
						}


						this.__loading.classes[packageId + '.' + namespaceId] = true;

						this.__namespaces[packageId + '.' + namespaceId] = {
							loading: overallRequired
						};

					}


					if (candidates.length > 0) {

						var candidate = candidates[0];

						candidate.namespaceId  = namespaceId;
						candidate.refererId    = refererId;
						candidate._loading     = candidate.attachments.length + 1;

						if (candidates.length > 1) {
							candidate.alternatives = candidates.splice(1, candidates.length - 1);
						}


						this.__candidates[candidate.packageId + '.' + candidate.classId] = candidate;
						this.__loading.classes[candidate.packageId + '.' + candidate.classId] = true;
						this.__preloader.load(candidate.url, candidate);

						return;

					}

				}

			}

		}


		if (lychee.debug === true) {
			console.warn('> loading ' + packageId + '.' + classId + ' failed. (required by ' + refererId + ')');
		}

	};

	var _sort_tree = function(reference, list, visited) {

		visited = visited || {};


		if (visited[reference] !== true) {

			visited[reference] = true;

			if (reference.indexOf('*') > 0) {

				var namespace = reference.substr(0, reference.length - 2);
				for (var id in this) {

					if (id.substr(0, namespace.length) === namespace) {
						_sort_tree.call(this, id, list, visited);
					}

				}


			} else {

				var node = this[reference];
				if (node === null) return;

				for (var r = 0, rl = node._requires.length; r < rl; r++) {
					_sort_tree.call(this, node._requires[r], list, visited);
				}

				for (var i = 0, il = node._includes.length; i < il; i++) {
					_sort_tree.call(this, node._includes[i], list, visited);
				}

				list.push(reference);

			}

		}

	};

	var _get_candidates = function(packageId, classId) {

		var id   = '';
		var base = this.__bases[packageId];
		var path = classId.split('.').join('/');


		var config = this.__packages[packageId] || null;
		if (config === null && this.__loading.packages[packageId] === true) {
			return null;
		}


		var candidates = [];

		if (config !== null) {

			var tree     = config.source;
			var all      = _get_identifiers(tree, '');
			var filtered = {};


			// 1. Tags have highest priority
			for (var tag in this.__tags) {

				var values = this.__tags[tag];

				for (var v = 0, l = values.length; v < l; v++) {

					var value = values[v];

					if (config.tags[tag] && config.tags[tag][value]) {

						id = null;


						var folder = config.tags[tag][value];

						for (var a = 0, al = all.length; a < al; a++) {

							if (all[a].substr(0, folder.length) === folder) {

								// 1.1. Namespace Includes
								// e.g. /tag/value/namespace/*
								if (path.indexOf('*') > 0) {

									var namespace = path.substr(0, path.indexOf('*') - 1);
									if (all[a].substr(folder.length + 1, namespace.length) === namespace) {

										id = namespace + '.' + all[a].substr(folder.length + namespace.length + 2).split('/').join('.');

										if (filtered[id] === undefined) {
											filtered[id] = [ all[a] ];
										} else {
											filtered[id].push(all[a]);
										}

									}

								// 1.2. Simple Includes
								// e.g. /tag/value/Class
								} else if (all[a].substr(folder.length + 1, path.length) === path) {

									id = classId;

									if (filtered[id] === undefined) {
										filtered[id] = [ all[a] ];
									} else {
										filtered[id].push(all[a]);
									}

								}

							}

						}

					}

				}


				// 2. No Tag-based search

				for (var a = 0, al = all.length; a < al; a++) {

					// 2.1. Namespace Includes
					// e.g. /namespace/*
					if (path.indexOf('*') > 0) {

						var namespace = path.substr(0, path.indexOf('*') - 1);
						if (all[a].substr(0, namespace.length) === namespace) {

							id = all[a].split('/').join('.');

							if (filtered[id] === undefined) {
								filtered[id] = [ all[a] ];
							} else {
								filtered[id].push(all[a]);
							}

						}


					// 2.2 Simple Includes
					// e.g. /lychee/Class
					} else if (all[a] === path) {

						id = classId;

						if (filtered[id] === undefined) {
							filtered[id] = [ all[a] ];
						} else {
							filtered[id].push(all[a]);
						}

						break;

					}

				}

			}


			// TODO: Refactor candidates stuff, doesn't work for namespaces due to nodes[n] having no id.

			if (Object.keys(filtered).length > 0) {

				for (id in filtered) {

					var nodes = filtered[id];
					var multiple = nodes.length > 1;
					for (var n = 0, nl = nodes.length; n < nl; n++) {

						var candidate = {
							packageId:   packageId,
							classId:     id,
							url:         this.__bases[packageId] + '/' + nodes[n] + '.js',
							multiple:    multiple,
							attachments: []
						};

						var extensions = _get_node(tree, nodes[n], '/');
						for (var e = 0, el = extensions.length; e < el; e++) {

							var ext = extensions[e];
							if (ext !== 'js') {
								candidate.attachments.push(this.__bases[packageId] + '/' + nodes[n] + '.' + ext);
							}
						}


						candidates.push(candidate);

					}

				}

			}

		} else {

			candidates.push({
				packageId:   packageId,
				classId:     classId,
				url:         this.__bases[packageId] + '/' + path + '.js',
				multiple:    false,
				attachments: []
			});

		}


		if (candidates.length > 0) {
			return candidates;
		} else {
			return null;
		}

	};

	var _get_namespace = function(namespace, scope) {

		var pointer = scope;

		var ns = namespace.split('.');
		for (var n = 0, l = ns.length; n < l; n++) {

			var name = ns[n];

			if (pointer[name] === undefined) {
				pointer[name] = {};
			}

			pointer = pointer[name];

		}


		return pointer;

	};

	var _get_node = function(tree, path, seperator) {

		var node = tree;
		var tmp = path.split(seperator);

		var t = 0;
		while (t < tmp.length) {
			node = node[tmp[t++]];
		}


		return node;

	};

	var _get_identifiers = function(tree, prefix, ids) {

		prefix = typeof prefix === 'string' ? prefix : '';


		var returnTree = false;

		if (Object.prototype.toString.call(ids) !== '[object Array]') {
			ids = [];
			returnTree = true;
		}


		for (var id in tree) {

			var node = tree[id];
			var type = Object.prototype.toString.call(node);
			var subprefix = prefix.length ? prefix + '/' + id : id;

			switch(type) {

				// 1. Valid Class Definition
				case '[object Array]':
					ids.push(subprefix);
				break;

				case '[object Object]':
					_get_identifiers(node, subprefix, ids);
				break;

			}

		}



		if (returnTree === true) {
			return ids;
		}

	};

	var _export_definitionblock = function(definitionblock) {

		var id        = definitionblock._space + '.' + definitionblock._name;
		var libspace  = definitionblock._space.split('.')[0];
		var classname = definitionblock._name;
		var namespace = _get_namespace(definitionblock._space, this.__scope);


		// 1. Collect required Attachments
		var attachmentsmap = null;
		var attachments    = this.__attachments[id] || null;
		if (attachments !== null) {

			attachmentsmap = {};

			for (var a = 0, al = attachments.length; a < al; a++) {

				var url = attachments[a];
				var tmp = url.split('/');
				var id = tmp[tmp.length - 1].substr(classname.length + 1);

				attachmentsmap[id] = this.__preloader.get(url);

			}

		}


		// 2. Export the Class, Module or Callback
		var data = null;
		if (definitionblock._exports !== null) {

			if (libspace === 'lychee') {

				data = definitionblock._exports.call(
					definitionblock._exports,
					this.__scope.lychee,
					this.__scope,
					attachmentsmap
				);

			} else {

				data = definitionblock._exports.call(
					definitionblock._exports,
					this.__scope.lychee,
					this.__scope[libspace],
					this.__scope,
					attachmentsmap
				);

			}

		}


		// 3. Extend the Class, Module or Callback
		var includes = definitionblock._includes;
		if (includes.length > 0 && data != null) {

			// 3.1 Collect its own and already
			// inherited methods
			var proto = {};
			for (var prop in data.prototype) {
				proto[prop] = data.prototype[prop];
			}


			// 3.2 Define the Class, Module or Callback
			// inside the namespace
			Object.defineProperty(namespace, classname, {
				value:        data,
				writable:     false,
				enumerable:   true,
				configurable: false
			});


			// 3.3 Create a new prototype
			namespace[classname].prototype = {};


			// 3.4 Generate the arguments for
			// the lychee.extend() call.
			var args = [
				namespace[classname].prototype
			];

			for (var i = 0, l = includes.length; i < l; i++) {

				var id = includes[i];

				var incLyDefBlock = _get_node(this.__scope, id, '.');
				if (!incLyDefBlock || !incLyDefBlock.prototype) {

					if (lychee.debug === true) {
						console.warn('Inclusion of ' + id + ' failed. You either forgot to return it inside lychee.exports() or created an invalid definition block.');
					}

				} else {
					args.push(_get_node(this.__scope, id, '.').prototype);
				}

			}


			// 3.5 Extend AND seal the prototype
			args.push(proto);
			lychee.extend.apply(lychee, args);

			Object.seal(namespace[classname].prototype);


		} else if (data != null) {

			Object.defineProperty(namespace, classname, {
				value:        data,
				writable:     false,
				enumerable:   true,
				configurable: false
			});


			if (Object.prototype.toString.call(data) === '[object Object]') {
				Object.seal(namespace[classname]);
			}

		}

	};

	var _refresh_dependencies = function() {

		var allDependenciesLoaded = true;


		// 1. Walk the Tree and load dependencies
		for (var id in this.__tree) {

			if (this.__tree[id] === null) continue;

			var node   = this.__tree[id];
			var nodeId = node._space + '.' + node._name;
			var entry  = null;


			for (var r = 0, l = node._requires.length; r < l; r++) {

				entry = node._requires[r];

				if (_requires_load.call(this, entry) === true) {

					allDependenciesLoaded = false;

					var packageId = entry.split('.')[0];
					var classId   = [].concat(entry.split('.').splice(1)).join('.');

					_load_definitionblock.call(this, packageId, classId, nodeId);

				}

			}


			for (var i = 0, l = node._includes.length; i < l; i++) {

				entry = node._includes[i];

				if (_requires_load.call(this, entry) === true) {

					allDependenciesLoaded = false;

					var packageId = entry.split('.')[0];
					var classId   = [].concat(entry.split('.').splice(1)).join('.');

					_load_definitionblock.call(this, packageId, classId, nodeId);

				}

			}

		}


		// 2. Check the loading tree and find out if something hasn't been parsed yet
		for (var id in this.__loading.classes) {

			if (
				   this.__namespaces[id] === undefined
				&& this.__tree[id] === undefined
			) {
				allDependenciesLoaded = false;
			}

		}


		// 3. Check candidates and their required attachments
		for (var id in this.__candidates) {

			var candidate = this.__candidates[id];
			if (
				typeof candidate._loading === 'number'
				&& candidate._loading > 0
			) {
				allDependenciesLoaded = false
			}

		}


		// 2. If all dependencies are loaded, sort the dependency tree
		if (allDependenciesLoaded === true) {

			var order = [];

			_sort_tree.call(this.__tree, this.__candidate, order);


			this.duration = Date.now() - this.clock;
			if (lychee.debug === true) {
				console.log('LOAD TIME: Finished in ' + this.duration + 'ms');
				console.log(order);
				console.groupEnd();
			}


			if (lychee.type === 'build') {

				// TODO: Asset integration

			} else if (lychee.type === 'source') {

				for (var o = 0, ol = order.length; o < ol; o++) {
					_export_definitionblock.call(this, this.__tree[order[o]]);
				}

			}


			this.duration = Date.now() - this.clock;
			if (lychee.debug === true) {
				console.log('COMPILE TIME: Finished in ' + this.duration + 'ms');
			}


			if (lychee.type === 'build') {

				this.__callback.call(
					this.__scope,
					this.__scope.lychee,
					this.__scope,
					order
				);

			} else {

				this.__callback.call(
					this.__scope,
					this.__scope.lychee,
					this.__scope,
					order
				);

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	lychee.Builder = function() {

		this.clock = 0;

		this.__attachments = {};
		this.__candidates  = {};
		this.__classes     = {};
		this.__namespaces  = {};
		this.__packages    = {};

		// will be set in build()
		this.__candidate     = null;
		this.__tree          = null;
		this.__bases         = null;
		this.__tags          = null;

		this.__callback = null;
		this.__scope    = null;

		this.__loading = {
			packages: {},
			classes:  {}
		};



		// This stuff here can't timeout on slow internet connections!
		this.__preloader = new lychee.Preloader({
			timeout: 10000
		});

		this.__preloader.bind('ready', _load_asset,   this);
		this.__preloader.bind('error', _unload_asset, this);

	};


	lychee.Builder.prototype = {

		build: function(env, callback, scope) {

			callback = callback instanceof Function ? callback : function() {};
			scope    = scope !== undefined          ? scope    : global;


			if (lychee.debug === true) {
				console.group('lychee.Builder');
			}


			this.clock = Date.now();

 			this.__tree  = env.tree instanceof Object  ? env.tree  : {};
			this.__bases = env.bases instanceof Object ? env.bases : {};
			this.__tags  = env.tags instanceof Object  ? env.tags  : {};


			var candidates = Object.keys(this.__tree);
			if (candidates.length === 1) {
				this.__candidate = candidates[0];
			} else {

				for (var c = 0, cl = candidates.length; c < cl; c++) {

					var candidate = candidates[c];
					if (candidate.match(/Main/)) {
						this.__candidate = candidate;
						break;
					}

				}

			}


			if (this.__candidate === null) {
				console.warn('Could not determine build candidate automatically. (Expecting either 1 candidate or *.Main being loaded already.)');
				return;
			}


			if (lychee.debug === true) {
				console.log('Preloading Dependencies for ' + this.__candidate);
			}


			this.__callback = callback;
			this.__scope    = scope;


			for (var id in env.bases) {
				_load_definitionblock.call(this, id, null);
			}

		}

	};


	if (typeof Object.seal === 'function') {
		Object.seal(lychee.Builder.prototype);
	}


	lychee.build = function(callback, scope, environment) {

		environment = environment instanceof Object ? environment : lychee.getEnvironment();


		var builder = new lychee.Builder();


		var result = builder.build(environment, callback, scope);
		if (result === true) {
			return true;
		}


		return false;

	};

})(lychee, typeof global !== 'undefined' ? global : this);


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
	 * BUFFER IMPLEMENTATION
	 */

	var Buffer = function(length) {

		this.length = length;

	};

	Buffer.byteLength = function() {
	};

	Buffer.prototype = {

		copy: function() {
		},

		toString: function() {
		}

	};



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

				var id = this.charset[c];

				var chr = {
					width:      data.map[c] + this.spacing * 2,
					height:     this.lineheight,
					realwidth:  data.map[c],
					realheight: this.lineheight,
					x:          offset - this.spacing,
					y:          0
				};

				offset += chr.width;


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


		// TODO: Embedded Font ligatures will set x and y value based on settings.map

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

			var url = this.url;
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=utf8');
			xhr.onload = function() {

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
					that.isIdle = true;
					that.play();
				}, true);

			}

			if (this.onload instanceof Function) {
				this.onload();
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

				if (this.buffer.currentTime === 0) {
					this.buffer.play();
					this.isIdle = false;
				}

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

	global.Buffer  = Buffer;
	global.Font    = Font;
	global.Music   = Music;
	global.Sound   = Sound;
	global.Texture = Texture;

})(this.lychee, this);


lychee.define("lychee.data.BitON").exports(function (lychee, global) {

	/*
	 * HELPERS
	 */

	var CHAR_TABLE = new Array(256);
	for (var c = 0; c < 256; c++) {
		CHAR_TABLE[c] = String.fromCharCode(c);
	}


	var MASK_TABLE = new Array(9);
	var POW_TABLE  = new Array(9);
	var RPOW_TABLE = new Array(9);
	for (var m = 0; m < 9; m++) {
		POW_TABLE[m]  = Math.pow(2, m) - 1;
		MASK_TABLE[m] = ~(POW_TABLE[m] ^ 0xff);
		RPOW_TABLE[m] = Math.pow(10, m);
	}


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



	var _stream = function(buffer, mode) {

		this.__buffer    = typeof buffer === 'string' ? buffer : '';
		this.__mode      = typeof mode === 'number' ? mode : null;

		this.__pointer   = 0;
		this.__value     = 0;
		this.__remaining = 8;
		this.__index     = 0;

		if (this.__mode === _stream.MODE.read) {
			this.__value = this.__buffer.charCodeAt(this.__index);
		}

	};

	_stream.MODE = {
		read:  0,
		write: 1
	};

	_stream.prototype = {

		buffer: function() {
			return this.__buffer;
		},

		pointer: function() {
			return this.__pointer;
		},

		length: function() {
			return this.__buffer.length * 8;
		},

		read: function(bits) {

			var overflow = bits - this.__remaining;
			var captured = this.__remaining < bits ? this.__remaining : bits;
			var shift    = this.__remaining - captured;


			var buffer = (this.__value & MASK_TABLE[this.__remaining]) >> shift;


			this.__pointer   += captured;
			this.__remaining -= captured;


			if (this.__remaining === 0) {

				this.__value      = this.__buffer.charCodeAt(++this.__index);
				this.__remaining  = 8;

				if (overflow > 0) {
					buffer = buffer << overflow | ((this.__value & MASK_TABLE[this.__remaining]) >> (8 - overflow));
					this.__remaining -= overflow;
				}

			}


			return buffer;

		},

		readRAW: function(bytes) {

			if (this.__remaining !== 8) {

				this.__index++;
				this.__value     = 0;
				this.__remaining = 8;

			}


			var buffer = '';

			if (this.__remaining === 8) {

				buffer        += this.__buffer.substr(this.__index, bytes);
				this.__index  += bytes;
				this.__value   = this.__buffer.charCodeAt(this.__index);

			}


			return buffer;

		},

		write: function(buffer, bits) {

			var overflow = bits - this.__remaining;
			var captured = this.__remaining < bits ? this.__remaining : bits;
			var shift    = this.__remaining - captured;


			if (overflow > 0) {
				this.__value += buffer >> overflow << shift;
			} else {
				this.__value += buffer << shift;
			}


			this.__pointer   += captured;
			this.__remaining -= captured;


			if (this.__remaining === 0) {

				this.__buffer    += CHAR_TABLE[this.__value];
				this.__remaining  = 8;
				this.__value      = 0;

				if (overflow > 0) {
					this.__value     += (buffer & POW_TABLE[overflow]) << (8 - overflow);
					this.__remaining -= overflow;
				}

			}

		},

		writeRAW: function(buffer) {

			if (this.__remaining !== 8) {

				this.__buffer   += CHAR_TABLE[this.__value];
				this.__value     = 0;
				this.__remaining = 8;

			}

			if (this.__remaining === 8) {

				this.__buffer  += buffer;
				this.__pointer += buffer.length * 8;

			}

		},

		close: function() {

			if (this.__mode === _stream.MODE.write) {

				if (this.__value > 0) {
					this.__buffer += CHAR_TABLE[this.__value];
					this.__value   = 0;
				}


				// 0: Boolean or Null or EOS
				this.write(0, 3);
				// 00: EOS
				this.write(0, 2);

			}

		}

	};



	/*
	 * ENCODER and DECODER
	 */

	var _encode = function(stream, data) {

		// 0: Boolean or Null or EOS
		if (typeof data === 'boolean' || data === null) {

			stream.write(0, 3);

			if (data === null) {
				stream.write(1, 2);
			} else if (data === false) {
				stream.write(2, 2);
			} else if (data === true) {
				stream.write(3, 2);
			}


		// 1: Integer, 2: Float
		} else if (typeof data === 'number') {

			var type = 1;
			if (
				   data < 268435456
				&& data !== (data | 0)
			) {
				type = 2;
			}


			stream.write(type, 3);


			// Negative value
			var sign = 0;
			if (data < 0) {
				data = -data;
				sign = 1;
			}


			// Float only: Calculate the integer value and remember the shift
			var shift = 0;

			if (type === 2) {

				var step = 10;
				var m    = data;
				var tmp  = 0;


				// Calculate the exponent and shift
				do {

					m     = data * step;
					step *= 10;
					tmp   = m | 0;
					shift++;

				} while (
					m - tmp > 1 / step
					&& shift < 8
				);


				step = tmp / 10;

				// Recorrect shift if we are > 0.5
				// and shift is too high
				if (step === (step | 0)) {
					tmp = step;
					shift--;
				}

				data = tmp;

			}



			if (data < 2) {

				stream.write(0, 4);
				stream.write(data, 1);

			} else if (data < 16) {

				stream.write(1, 4);
				stream.write(data, 4);

			} else if (data < 256) {

				stream.write(2, 4);
				stream.write(data, 8);

			} else if (data < 4096) {

				stream.write(3, 4);
				stream.write(data >>  8 & 0xff, 4);
				stream.write(data       & 0xff, 8);

			} else if (data < 65536) {

				stream.write(4, 4);
				stream.write(data >>  8 & 0xff, 8);
				stream.write(data       & 0xff, 8);

			} else if (data < 1048576) {

				stream.write(5, 4);
				stream.write(data >> 16 & 0xff, 4);
				stream.write(data >>  8 & 0xff, 8);
				stream.write(data       & 0xff, 8);

			} else if (data < 16777216) {

				stream.write(6, 4);
				stream.write(data >> 16 & 0xff, 8);
				stream.write(data >>  8 & 0xff, 8);
				stream.write(data       & 0xff, 8);

			} else if (data < 268435456) {

				stream.write(7, 4);
				stream.write(data >> 24 & 0xff, 8);
				stream.write(data >> 16 & 0xff, 8);
				stream.write(data >>  8 & 0xff, 8);
				stream.write(data       & 0xff, 8);

			} else {

				stream.write(8, 4);

				_encode(stream, data.toString());

			}



			stream.write(sign, 1);


			// Float only: Remember the shift for precision
			if (type === 2) {
				stream.write(shift, 4);
			}


		// 3: String
		} else if (typeof data === 'string') {

			stream.write(3, 3);


			var l = data.length;

			// Write Size Field
			if (l > 65535) {

				stream.write(31, 5);

				stream.write(l >> 24 & 0xff, 8);
				stream.write(l >> 16 & 0xff, 8);
				stream.write(l >>  8 & 0xff, 8);
				stream.write(l       & 0xff, 8);

			} else if (l > 255) {

				stream.write(30, 5);

				stream.write(l >>  8 & 0xff, 8);
				stream.write(l       & 0xff, 8);

			} else if (l > 28) {

				stream.write(29, 5);

				stream.write(l, 8);

			} else {

				stream.write(l, 5);

			}


			stream.writeRAW(data);


		// 4: Start of Array
		} else if (data instanceof Array) {

			stream.write(4, 3);


			for (var d = 0, dl = data.length; d < dl; d++) {
				stream.write(0, 3);
				_encode(stream, data[d]);
			}

			// Write EOO marker
			stream.write(7, 3);


		// 5: Start of Object
		} else if (
			data instanceof Object
			&& typeof data.serialize !== 'function'
		) {

			stream.write(5, 3);

			for (var prop in data) {

				if (data.hasOwnProperty(prop)) {
					stream.write(0, 3);
					_encode(stream, prop);
					_encode(stream, data[prop]);
				}

			}

			// Write EOO marker
			stream.write(7, 3);


		// 6: Custom High-Level Implementation
		} else if (typeof data.serialize === 'function') {

			stream.write(6, 3);

			var blob = lychee.serialize(data);

			_encode(stream, blob);

			// Write EOO marker
			stream.write(7, 3);

		}

	};


	var _decode = function(stream) {

		var value = undefined;
		var tmp   = 0;

		if (stream.pointer() < stream.length()) {

			var type = stream.read(3);


			// 0: Boolean or Null (or EOS)
			if (type === 0) {

				tmp = stream.read(2);

				if (tmp === 1) {
					value = null;
				} else if (tmp === 2) {
					value = false;
				} else if (tmp === 3) {
					value = true;
				}


			// 1: Integer, 2: Float
			} else if (type === 1 || type === 2) {

				var tmp = stream.read(4);
				if (tmp === 0) {

					value = stream.read(1);

				} else if (tmp === 1) {

					value = stream.read(4);

				} else if (tmp === 2) {

					value = stream.read(8);

				} else if (tmp === 3) {

					value = (stream.read(4) <<  8)
						  +  stream.read(8);

				} else if (tmp === 4) {

					value = (stream.read(8) <<  8)
						  +  stream.read(8);

				} else if (tmp === 5) {

					value = (stream.read(4) << 16)
						  + (stream.read(8) <<  8)
						  +  stream.read(8);

				} else if (tmp === 6) {

					value = (stream.read(8) << 16)
						  + (stream.read(8) <<  8)
						  +  stream.read(8);

				} else if (tmp === 7) {

					value = (stream.read(8) << 24)
						  + (stream.read(8) << 16)
						  + (stream.read(8) <<  8)
						  +  stream.read(8);

				} else if (tmp === 8) {

					var str = _decode(stream);

					value = parseInt(str, 10);

				}


				// Negative value
				var sign = stream.read(1);
				if (sign === 1) {
					value = -1 * value;
				}


				// Float only: Shift it back by the precision
				if (type === 2) {
					var shift = stream.read(4);
					value /= RPOW_TABLE[shift];
				}


			// 3: String
			} else if (type === 3) {

				var size = stream.read(5);

				if (size === 31) {

					size = (stream.read(8) << 24)
					     + (stream.read(8) << 16)
					     + (stream.read(8) <<  8)
					     +  stream.read(8);

				} else if (size === 30) {

					size = (stream.read(8) <<  8)
					     +  stream.read(8);

				} else if (size === 29) {

					size = stream.read(8);

				}


				value = stream.readRAW(size);


			// 4: Array
			} else if (type === 4) {

				value = [];


				var errors = 0;

				while (errors === 0) {

					var check = stream.read(3);
					if (check === 0) {

						var subvalue = _decode(stream);
						value.push(subvalue);

					} else if (check === 7) {
						break;
					} else {
						errors++;
					}

				}


			// 5: Object
			} else if (type === 5) {

				value = {};

				var errors = 0;

				while (errors === 0) {

					var check = stream.read(3);
					if (check === 0) {

						var prop     = _decode(stream);
						var subvalue = _decode(stream);

						value[prop] = subvalue;

					} else if (check === 7) {
						break;
					} else {
						errors++;
					}

				}

			// 6: Custom High-Level Implementation
			} else if (type === 6) {

				var blob = _decode(stream);

				value = lychee.deserialize(blob);


				var check = stream.read(3);
				if (check !== 7) {
					value = undefined;
				}

			}

		}


		return value;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {};


	Module.encode = function(data) {

		var stream = new _stream('', _stream.MODE.write);

		_encode(stream, data);

		stream.close();

		return stream.buffer();

	};


	Module.decode = function(data) {

		var stream = new _stream(data, _stream.MODE.read);

		var value = _decode(stream);
		if (value === undefined) {
			return null;
		} else {
			return value;
		}

	};


	return Module;

});
lychee.define("lychee.event.Emitter").exports(function (lychee, global) {

	/*
	 * HELPERS
	 */

	var _unbind = function(type, callback, scope) {

		if (this.___events[type] !== undefined) {

			var found = false;

			for (var e = 0, el = this.___events[type].length; e < el; e++) {

				var entry = this.___events[type][e];

				if (
					(callback === null || entry.callback === callback)
					&& (scope === null || entry.scope === scope)
				) {

					found = true;

					this.___events[type].splice(e, 1);
					el--;

				}

			}


			return found;

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function() {

		this.___events = {};

	};


	Class.prototype = {

		bind: function(type, callback, scope, once) {

			type     = typeof type === 'string'     ? type     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;
			once     = once === true;


			if (type === null || callback === null) {
				return false;
			}


			var passAction = false;
			var passSelf   = false;

			if (type.charAt(0) === '@') {
				type = type.substr(1, type.length - 1);
				passAction = true;
			} else if (type.charAt(0) === '#') {
				type = type.substr(1, type.length - 1);
				passSelf = true;
			}


			if (this.___events[type] === undefined) {
				this.___events[type] = [];
			}


			this.___events[type].push({
				passAction: passAction,
				passSelf:   passSelf,
				callback:   callback,
				scope:      scope,
				once:       once
			});


			return true;

		},

		trigger: function(type, data) {

			type = typeof type === 'string' ? type : null;
			data = data instanceof Array    ? data : null;


			if (this.___events[type] !== undefined) {

				var value = undefined;

				for (var e = 0, el = this.___events[type].length; e < el; e++) {

					var args  = [];
					var entry = this.___events[type][e];

					if (entry.passAction === true) {

						args.push(type);
						args.push(this);

					} else if (entry.passSelf === true) {

						args.push(this);

					}


					if (data !== null) {
						args.push.apply(args, data);
					}


					var result = entry.callback.apply(entry.scope, args);
					if (result !== undefined) {
						value = result;
					}


					if (entry.once === true) {

						if (this.unbind(type, entry.callback, entry.scope) === true) {
							el--;
							e--;
						}

					}

				}


				if (value !== undefined) {
					return value;
				} else {
					return true;
				}

			}


			return false;

		},

		unbind: function(type, callback, scope) {

			type     = typeof type === 'string'     ? type     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : null;


			var found = false;

			if (type !== null) {

				found = _unbind.call(this, type, callback, scope);

			} else {

				for (var type in this.___events) {

					var result = _unbind.call(this, type, callback, scope);
					if (result === true) {
						found = true;
					}

				}

			}


			return found;

		}

	};


	return Class;

});
lychee.define("lychee.net.Service").includes([
	"lychee.event.Emitter"
]).exports(function (lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _services = {};

	var _validate_tunnel = function(tunnel, type) {

		if (type === null) return false;


		if (type === Class.TYPE.client) {
			return lychee.interfaceof(lychee.net.Client, tunnel);
		} else if (type === Class.TYPE.remote) {
			return lychee.interfaceof(lychee.net.Remote, tunnel);
		}


		return false;

	};

	var _plug_broadcast = function() {

		var id = this.id;
		if (id !== null) {

			var cache = _services[id] || null;
			if (cache === null) {
				cache = _services[id] = [];
			}


			var found = false;

			for (var c = 0, cl = cache.length; c < cl; c++) {

				if (cache[c] === this) {
					found = true;
					break;
				}

			}


			if (found === false) {
				cache.push(this);
			}

		}

	};

	var _unplug_broadcast = function() {

		this.setMulticast([]);


		var id = this.id;
		if (id !== null) {

			var cache = _services[id] || null;
			if (cache !== null) {

				for (var c = 0, cl = cache.length; c < cl; c++) {

					if (cache[c] === this) {
						cache.splice(c, 1);
						break;
					}

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(id, tunnel, type) {

		id     = typeof id === 'string'                   ? id     : null;
		type   = lychee.enumof(Class.TYPE, type) === true ? type   : null;
		tunnel = _validate_tunnel(tunnel, type) === true  ? tunnel : null;


		this.id     = id;
		this.tunnel = tunnel;
		this.type   = type;

		this.__multicast = [];


		if (lychee.debug === true) {

			if (this.id === null) {
				console.error('lychee.net.Service: Invalid (string) id. It has to be kept in sync with the lychee.net.Client and lychee.net.Remote instance.');
			}

			if (this.tunnel === null) {
				console.error('lychee.net.Service: Invalid (lychee.net.Client || lychee.net.Remote) tunnel.');
			}

			if (this.type === null) {
				console.error('lychee.net.Service: Invalid (lychee.net.Service.TYPE) type.');
			}

		}


		lychee.event.Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		if (this.type === Class.TYPE.remote) {

			this.bind('plug',   _plug_broadcast,   this);
			this.bind('unplug', _unplug_broadcast, this);

		}

	};


	Class.TYPE = {
		// 'default': 0, (deactivated)
		'client': 1,
		'remote': 2
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.tunnel instanceof Object) {
				this.tunnel = lychee.deserialize(blob.tunnel);
			}

		},

		serialize: function() {

			var id     = null;
			var tunnel = null;
			var type   = null;

			var blob = {};


			if (this.id !== null)     id = this.id;
			if (this.tunnel !== null) blob.tunnel = this.tunnel.serialize();
			if (this.type !== null)   type = this.type;


			return {
				'constructor': 'lychee.net.Service',
				'arguments':   [ id, tunnel, type ],
				'blob':        blob
			};

		},



		/*
		 * SERVICE API
		 */

		multicast: function(data, service) {

			data    = data instanceof Object    ? data    : null;
			service = service instanceof Object ? service : null;


			if (data === null) {
				return false;
			}


			var type = this.type;
			if (type === Class.TYPE.client) {

				if (service === null) {

					service = {
						id:    this.id,
						event: 'multicast'
					};

				}


				if (this.tunnel !== null) {

					this.tunnel.send({
						data:    data,
						service: service
					}, {
						id:     this.id,
						method: 'multicast'
					});

					return true;

				}

			} else if (type === Class.TYPE.remote) {

				if (data.service !== null) {

					for (var m = 0, ml = this.__multicast.length; m < ml; m++) {

						var tunnel = this.__multicast[m];
						if (tunnel !== this.tunnel) {

							data.data.tid = this.tunnel.id;

							tunnel.send(
								data.data,
								data.service
							);

						}

					}

					return true;

				}

			}


			return false;

		},

		broadcast: function(data, service) {

			data    = data instanceof Object    ? data    : null;
			service = service instanceof Object ? service : null;


			if (
				   data === null
				|| this.id === null
			) {
				return false;
			}


			var type = this.type;
			if (type === Class.TYPE.client) {

				if (service === null) {

					service = {
						id:    this.id,
						event: 'broadcast'
					};

				}


				if (this.tunnel !== null) {

					this.tunnel.send({
						data:    data,
						service: service
					}, {
						id:     this.id,
						method: 'broadcast'
					});

					return true;

				}

			} else if (type === Class.TYPE.remote) {

				if (data.service !== null) {

					var broadcast = _services[this.id] || null;
					if (broadcast !== null) {

						for (var b = 0, bl = broadcast.length; b < bl; b++) {

							var tunnel = broadcast[b].tunnel;
							if (tunnel !== this.tunnel) {

								data.data.tid = this.tunnel.id;

								tunnel.send(
									data.data,
									data.service
								);

							}

						}

						return true;

					}

				}

			}


			return false;

		},

		report: function(message, blob) {

			message = typeof message === 'string' ? message : null;
			blob    = blob instanceof Object      ? blob    : null;


			if (message !== null) {

				if (this.tunnel !== null) {

					this.tunnel.send({
						message: message,
						blob:    blob
					}, {
						id:    this.id,
						event: 'error'
					});

				}

			}

		},

		setMulticast: function(multicast) {

			if (multicast instanceof Array) {

				var valid = true;
				var type  = this.type;

				for (var m = 0, ml = multicast.length; m < ml; m++) {

					if (_validate_tunnel(multicast[m], type) === false) {
						valid = false;
						break;
					}

				}

				this.__multicast = multicast;

				return true;

			}


			return false;

		}

	};


	return Class;

});
lychee.define("game.net.client.Ping").includes([
	"lychee.net.Service"
]).exports(function (lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _on_pong = function(data) {

		data.pongstop = Date.now();

		var pingdelta = data.pingstop - data.pingstart;
		var pongdelta = data.pongstop - data.pongstart;


		this.trigger('statistics', [ pingdelta, pongdelta ]);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client) {

		this.game = client.game;

		lychee.net.Service.call(this, 'ping', client, lychee.net.Service.TYPE.client);


		this.bind('pong', _on_pong, this);

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		ping: function() {

			if (this.tunnel !== null) {

				this.tunnel.send({
					pingstart: Date.now()
				}, {
					id:    this.id,
					event: 'ping'
				});

				return true;

			}


			return false;

		}

	};


	return Class;

});
lychee.define("lychee.net.Client").tags({
	"platform": "html"
}).supports(function (lychee, global) {

	if (
		typeof WebSocket !== 'undefined'
	) {
		return true;
	}


	return false;

}).requires([
	"lychee.net.Service"
]).includes([
	"lychee.event.Emitter"
]).exports(function (lychee, global) {

	/*
	 * HELPERS
	 */

	var _receive_handler = function(blob, isBinary) {

		var data = null;
		try {
			data = this.__decoder(blob);
		} catch(e) {
			// Unsupported data encoding
			return false;
		}


		if (
			data instanceof Object
			&& typeof data._serviceId === 'string'
		) {

			var service = _get_service_by_id.call(this, data._serviceId);
			var event   = data._serviceEvent || null;
			var method  = data._serviceMethod || null;


			if (method !== null) {

				if (method.charAt(0) === '@') {

					if (method === '@plug') {
						_plug_service.call(this,   data._serviceId, service);
					} else if (method === '@unplug') {
						_unplug_service.call(this, data._serviceId, service);
					}

				} else if (
					service !== null
					&& typeof service[method] === 'function'
				) {

					// Remove data frame service header
					delete data._serviceId;
					delete data._serviceMethod;

					service[method](data);

				}

			} else if (event !== null) {

				if (
					service !== null
					&& typeof service.trigger === 'function'
				) {

					// Remove data frame service header
					delete data._serviceId;
					delete data._serviceEvent;

					service.trigger(event, [ data ]);

				}

			}

		} else {

			this.trigger('receive', [ data ]);

		}


		return true;

	};

	var _get_service_by_id = function(id) {

		var service;

		for (var w = 0, wl = this.__services.waiting.length; w < wl; w++) {

			service = this.__services.waiting[w];
			if (service.id === id) {
				return service;
			}

		}

		for (var a = 0, al = this.__services.active.length; a < al; a++) {

			service = this.__services.active[a];
			if (service.id === id) {
				return service;
			}

		}


		return null;

	};

	var _is_service_waiting = function(service) {

		for (var w = 0, wl = this.__services.waiting.length; w < wl; w++) {

			if (this.__services.waiting[w] === service) {
				return true;
			}

		}


		return false;

	};

	var _is_service_active = function(service) {

		for (var a = 0, al = this.__services.active.length; a < al; a++) {

			if (this.__services.active[a] === service) {
				return true;
			}

		}


		return false;

	};

	var _plug_service = function(id, service) {

		id = typeof id === 'string' ? id : null;

		if (
			   id === null
			|| service === null
		) {
			return;
		}


		var found = false;

		for (var w = 0, wl = this.__services.waiting.length; w < wl; w++) {

			if (this.__services.waiting[w] === service) {
				this.__services.waiting.splice(w, 1);
				found = true;
				wl--;
				w--;
			}

		}


		if (found === true) {

			this.__services.active.push(service);

			service.trigger('plug', []);

			if (lychee.debug === true) {
				console.log('lychee.net.Client: Remote plugged in Service (' + id + ')');
			}

		}

	};

	var _unplug_service = function(id, service) {

		id = typeof id === 'string' ? id : null;

		if (
			   id === null
			|| service === null
		) {
			return;
		}


		var found = false;

		for (var a = 0, al = this.__services.active.length; a < al; a++) {

			if (this.__services.active[a] === service) {
				this.__services.active.splice(a, 1);
				found = true;
				al--;
				a--;
			}

		}


		if (found === true) {

			service.trigger('unplug', []);

			if (lychee.debug === true) {
				console.log('lychee.net.Client: Remote unplugged Service (' + id + ')');
			}

		}

	};

	var _cleanup_services = function() {

		var services = this.__services.active;

		for (var s = 0; s < services.length; s++) {
			services[s].trigger('unplug', []);
		}


		this.__services.active  = [];
		this.__services.waiting = [];

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.port = 1337;
		this.host = 'localhost';


		this.__encoder = settings.encoder instanceof Function ? settings.encoder : JSON.stringify;
		this.__decoder = settings.decoder instanceof Function ? settings.decoder : JSON.parse;
		this.__socket  = null;
		this.__services  = {
			waiting: [], // Waiting Services need to be verified from Remote
			active:  []  // Active Services for allowed interaction
		};

		this.__isBinary  = false;
		this.__isRunning = false;


		lychee.event.Emitter.call(this);

		settings = null;

	};


	Class.prototype = {

		listen: function(port, host) {

			if (this.__socket !== null) return false;


			this.port = typeof port === 'number' ? port : this.port;
			this.host = typeof host === 'string' ? host : this.host;


			if (this.__isRunning === true) {
				return false;
			}


			if (lychee.debug === true) {
				console.log('lychee.net.Client: Listening on ' + this.host + ':' + this.port);
			}


			var url = 'ws://' + this.host + ':' + this.port;

			this.__socket = new WebSocket(url);

			if (
				   typeof ArrayBuffer !== 'undefined'
				&& typeof this.__socket.binaryType !== 'undefined'
			) {
				this.__socket.binaryType = 'arraybuffer';
				this.__isBinary = true;
			}


			var that = this;

			this.__socket.onopen = function() {

				that.__isRunning = true;
				that.trigger('connect');

			};

			this.__socket.onmessage = function(event) {

				var blob = null;
				if (
					that.__isBinary === true
					&& event.data instanceof ArrayBuffer
				) {

					var bytes = new Uint8Array(event.data);
					blob = String.fromCharCode.apply(null, bytes);

					_receive_handler.call(that, blob, true);

				} else {

					blob = event.data;

					_receive_handler.call(that, blob, false);

				}

			};


			// WebSocket Close frame is standardized,
			// no deserialization required.

			this.__socket.onclose = function(event) {

				that.__socket    = null;
				that.__isRunning = false;
				_cleanup_services.call(that);

				that.trigger('disconnect', [ event.code, event.reason ]);

			};


			return true;

		},

		send: function(data, service) {

			data    = data instanceof Object    ? data    : null;
			service = service instanceof Object ? service : null;


			if (
				   data === null
				|| this.__isRunning === false
			) {
				return false;
			}


			if (service !== null) {

				if (typeof service.id     === 'string') data._serviceId     = service.id;
				if (typeof service.event  === 'string') data._serviceEvent  = service.event;
				if (typeof service.method === 'string') data._serviceMethod = service.method;

			}


			var blob = this.__encoder(data);
			if (this.__isBinary === true) {

				var bl    = blob.length;
				var bytes = new Uint8Array(bl);

				for (var b = 0; b < bl; b++) {
					bytes[b] = blob.charCodeAt(b);
				}

				blob = bytes.buffer;

			}


			this.__socket.send(blob);


			return true;

		},

		connect: function() {

			if (this.__isRunning === false) {
				return this.listen(this.port, this.host);
			}


			return false;

		},

		disconnect: function() {

			if (this.__isRunning === true) {

				this.__socket.close();

				return true;

			}


			return false;

		},

		plug: function(service) {

			if (lychee.interfaceof(lychee.net.Service, service) === false) {
				return false;
			}


			if (
				   _is_service_waiting.call(this, service) === false
				&& _is_service_active.call(this, service) === false
			) {

				this.__services.waiting.push(service);

				// Please, Remote, plug Service! PING
				this.send({}, {
					id:     service.id,
					method: '@plug'
				});

				return true;

			}


			return false;

		},

		unplug: function(service) {

			if (lychee.interfaceof(lychee.net.Service, service) === false) {
				return false;
			}


			if (
				   _is_service_waiting.call(this, service) === true
				|| _is_service_active.call(this, service) === true
			) {

				// Please, Remote, unplug Service! PING
				this.send({}, {
					id:     service.id,
					method: '@unplug'
				});

				return true;

			}


			return false;

		}

	};


	return Class;

});
lychee.define("game.net.Client").requires([
	"lychee.data.BitON",
	"game.net.client.Ping"
]).includes([
	"lychee.net.Client"
]).exports(function (lychee, game, global, attachments) {

	var _BitON = lychee.data.BitON;
	var _ping  = game.net.client.Ping;


	var Class = function(settings, game) {

		this.loop = game.loop || null; // required for reconnect

		this.services = {};
		this.services.ping = new _ping(this);


		lychee.net.Client.call(this, {
			encoder: _BitON.encode,
			decoder: _BitON.decode
		});


		this.bind('connect', function() {

			this.plug(this.services.ping);


			if (lychee.debug === true) {
				console.log('(Boilerplate) game.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', function(code, reason) {

			if (lychee.debug === true) {
				console.log('(Boilerplate) game.net.Client: Remote disconnected (' + code + ' | ' + reason + ')');
			}

			if (this.loop !== null) {

				this.loop.setTimeout(1000, function() {
					this.connect();
				}, this);

			}

		}, this);


		this.listen(settings.port, settings.host);

	};


	Class.prototype = {

	};


	return Class;

});
lychee.define("lychee.ui.Entity").includes([
	"lychee.event.Emitter"
]).exports(function (lychee, global) {

	/*
	 * HELPERS
	 */

	var _default_state  = 'default';
	var _default_states = { 'default': null, 'active': null };



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.width  = typeof settings.width  === 'number' ? settings.width  : 0;
		this.height = typeof settings.height === 'number' ? settings.height : 0;
		this.depth  = 0;
		this.radius = typeof settings.radius === 'number' ? settings.radius : 0;

		this.collision = 1; // Used for event flow, NOT modifiable
		this.shape     = Class.SHAPE.rectangle;
		this.state     = _default_state;
		this.position  = { x: 0, y: 0 };
		this.visible   = true;

		this.__clock  = null;
		this.__states = _default_states;
		this.__cache  = {
			tween: { x: 0, y: 0 }
		};
		this.__tween  = {
			active:       false,
			type:         Class.TWEEN.linear,
			start:        null,
			duration:     0,
			fromposition: { x: 0, y: 0 },
			toposition:   { x: 0, y: 0 }
		};


		if (settings.states instanceof Object) {

			this.__states = { 'default': null, 'active': null };

			for (var id in settings.states) {

				if (settings.states.hasOwnProperty(id)) {
					this.__states[id] = settings.states[id];
				}

			}

		}


		this.setShape(settings.shape);
		this.setState(settings.state);
		this.setPosition(settings.position);
		this.setTween(settings.tween);
		this.setVisible(settings.visible);


		lychee.event.Emitter.call(this);

		settings = null;

	};


	// Same ENUM values as lychee.game.Entity
	Class.SHAPE = {
		circle:    0,
		rectangle: 2
	};


	Class.TWEEN = {
		linear:        0,
		easein:        1,
		easeout:       2,
		bounceeasein:  3,
		bounceeaseout: 4
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) { },

		serialize: function() {

			var settings = {};


			if (this.width  !== 0) settings.width  = this.width;
			if (this.height !== 0) settings.height = this.height;
			if (this.radius !== 0) settings.radius = this.radius;

			if (this.shape !== Class.SHAPE.rectangle) settings.shape   = this.shape;
			if (this.state !== _default_state)        settings.state   = this.state;
			if (this.__states !== _default_states)    settings.states  = this.__states;
			if (this.visible !== true)                settings.visible = this.visible;


			if (
				   this.position.x !== 0
				|| this.position.y !== 0
			) {

				settings.position = {};

				if (this.position.x !== 0) settings.position.x = this.position.x;
				if (this.position.y !== 0) settings.position.y = this.position.y;

			}


			return {
				'constructor': 'lychee.ui.Entity',
				'arguments':   [ settings ],
				'blob':        null
			};

		},

		sync: function(clock) {

			if (this.__clock === null) {

				if (this.__tween.active === true && this.__tween.start === null) {
					this.__tween.start = clock;
				}

				this.__clock = clock;

			}

		},

		// HINT: Renderer skips if no render() method exists
		// render: function(renderer, offsetX, offsetY) {},

		update: function(clock, delta) {

			// 1. Sync clocks initially
			// (if Entity was created before loop started)
			if (this.__clock === null) {
				this.sync(clock);
			}


			var tween = this.__tween;

			// 2. Tweening
			if (
				   tween.active === true
				&& tween.start !== null
			) {

				var t = (this.__clock - tween.start) / tween.duration;
				if (t <= 1) {

					var type = tween.type;
					var from = tween.fromposition;
					var to   = tween.toposition;

					var dx = to.x - from.x;
					var dy = to.y - from.y;


					var cache = this.__cache.tween;

					if (type === Class.TWEEN.linear) {

						cache.x = from.x + t * dx;
						cache.y = from.y + t * dy;

					} else if (type === Class.TWEEN.easein) {

						var f = 1 * Math.pow(t, 3);

						cache.x = from.x + f * dx;
						cache.y = from.y + f * dy;

					} else if (type === Class.TWEEN.easeout) {

						var f = Math.pow(t - 1, 3) + 1;

						cache.x = from.x + f * dx;
						cache.y = from.y + f * dy;

					} else if (type === Class.TWEEN.bounceeasein) {

						var k = 1 - t;
						var f;

						if ((k /= 1) < ( 1 / 2.75 )) {
							f = 1 * ( 7.5625 * Math.pow(k, 2) );
						} else if (k < ( 2 / 2.75 )) {
							f = 7.5625 * ( k -= ( 1.5 / 2.75 )) * k + .75;
						} else if (k < ( 2.5 / 2.75 )) {
							f = 7.5625 * ( k -= ( 2.25 / 2.75 )) * k + .9375;
						} else {
							f = 7.5625 * ( k -= ( 2.625 / 2.75 )) * k + .984375;
						}

						cache.x = from.x + (1 - f) * dx;
						cache.y = from.y + (1 - f) * dy;

					} else if (type === Class.TWEEN.bounceeaseout) {

						var f;

						if ((t /= 1) < ( 1 / 2.75 )) {
							f = 1 * ( 7.5625 * Math.pow(t, 2) );
						} else if (t < ( 2 / 2.75 )) {
							f = 7.5625 * ( t -= ( 1.5 / 2.75 )) * t + .75;
						} else if (t < ( 2.5 / 2.75 )) {
							f = 7.5625 * ( t -= ( 2.25 / 2.75 )) * t + .9375;
						} else {
							f = 7.5625 * ( t -= ( 2.625 / 2.75 )) * t + .984375;
						}

						cache.x = from.x + f * dx;
						cache.y = from.y + f * dy;

					}


					this.setPosition(cache);

				} else {

					this.setPosition(tween.toposition);
					tween.active = false;

				}

			}


			this.__clock = clock;

		},



		/*
		 * CUSTOM API
		 */

		setShape: function(shape) {

			if (lychee.enumof(Class.SHAPE, shape) === true) {

				this.shape = shape;

				return true;

			}


			return false;

		},

		getStateMap: function() {
			return this.__states[this.state];
		},

		setState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.__states[id] !== undefined) {

				this.state = id;

				return true;

			}


			return false;

		},

		setPosition: function(position) {

			if (position instanceof Object) {

				this.position.x = typeof position.x === 'number' ? position.x : this.position.x;
				this.position.y = typeof position.y === 'number' ? position.y : this.position.y;

				return true;

			}


			return false;

		},

		setTween: function(settings) {

			if (settings instanceof Object) {

				var tween = this.__tween;

				tween.type     = lychee.enumof(Class.TWEEN, settings.type) ? settings.type     : Class.TWEEN.linear;
				tween.duration = typeof settings.duration === 'number'       ? settings.duration : 1000;

				if (settings.position instanceof Object) {
					tween.toposition.x = typeof settings.position.x === 'number' ? settings.position.x : this.position.x;
					tween.toposition.y = typeof settings.position.y === 'number' ? settings.position.y : this.position.y;
				}

				tween.fromposition.x = this.position.x;
				tween.fromposition.y = this.position.y;

				tween.start  = this.__clock;
				tween.active = true;


				return true;

			}


			return false;

		},

		clearTween: function() {
			this.__tween.active = false;
		},

		setVisible: function(visible) {

			if (visible === true || visible === false) {

				this.visible = visible;

				return true;

			}


			return false;

		},

		isAtPosition: function(point) {

			if (
				   point instanceof Object
				&& typeof point.x === 'number'
				&& typeof point.y === 'number'
			) {

				var x = point.x;
				var y = point.y;
				var px = this.position.x;
				var py = this.position.y;

				var shape = this.shape;
				if (shape === Class.SHAPE.circle) {

					var dist = Math.sqrt(
						  (x - px) * (x - px)
						+ (y - py) * (y - py)
					);

					if (dist < this.radius) {
						return true;
					}

				} else if (shape === Class.SHAPE.rectangle) {

					var hw = this.width  / 2;
					var hh = this.height / 2;

					if (
						   x >= px - hw && x <= px + hw
						&& y >= py - hh && y <= py + hh
					) {
						return true;
					}

				}

			}


			return false;

		}

	};


	return Class;

});
lychee.define("lychee.ui.Button").includes([
	"lychee.ui.Entity"
]).exports(function (lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.label = null;
		this.font  = null;

		this.__pulse = {
			active:   false,
			duration: 250,
			start:    null,
			alpha:    0.0
		};


		this.setFont(settings.font);
		this.setLabel(settings.label);

		delete settings.font;
		delete settings.label;


		settings.width  = typeof settings.width === 'number'  ? settings.width  : 128;
		settings.height = typeof settings.height === 'number' ? settings.height : 64;
		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;


		lychee.ui.Entity.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {
			this.setState('default');
		}, this);


		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}

		},

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.Button';

			var settings = data['arguments'][0];
			var blob     = data['blob'] = (data['blob'] || {});


			if (this.label !== null) settings.label = this.label;


			if (this.font !== null) blob.font = this.font.serialize();


			return data;

		},

		update: function(clock, delta) {

			var pulse = this.__pulse;
			if (pulse.active === true) {

				if (pulse.start === null) {
					pulse.start = clock;
				}

				var t = (clock - pulse.start) / pulse.duration;
				if (t <= 1) {
					pulse.alpha = (1 - t) * 0.6;
				} else {
					pulse.alpha  = 0.0;
					pulse.active = false;
				}

			}


			lychee.ui.Entity.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;

			var color  = this.state === 'active' ? '#33b5e5' : '#0099cc';
			var color2 = this.state === 'active' ? '#0099cc' : '#575757';


			var hwidth  = (this.width  - 2) / 2;
			var hheight = (this.height - 2) / 2;



			renderer.drawBox(
				x - hwidth,
				y - hheight,
				x + hwidth,
				y + hheight,
				color2,
				false,
				2
			);


			var pulse = this.__pulse;
			if (pulse.active === true) {

				renderer.setAlpha(pulse.alpha);

				renderer.drawBox(
					x - hwidth,
					y - hheight,
					x + hwidth,
					y + hheight,
					color,
					true
				);

				renderer.setAlpha(1.0);

			}


			var label = this.label;
			var font  = this.font;

			if (label !== null && font !== null) {

				renderer.drawText(
					x,
					y,
					label,
					font,
					true
				);

			}

		},



		/*
		 * CUSTOM API
		 */

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.font = font;

				return true;

			}


			return false;

		},

		setLabel: function(label) {

			label = typeof label === 'string' ? label : null;


			if (label !== null) {

				this.label = label;

				return true;

			}


			return false;

		},

		setState: function(id) {

			var result = lychee.ui.Entity.prototype.setState.call(this, id);
			if (result === true) {

				var pulse = this.__pulse;


				if (id === 'active') {

					pulse.alpha  = 0.6;
					pulse.start  = null;
					pulse.active = true;

				}


				return true;

			}


			return false;

		}

	};


	return Class;

});
lychee.define("game.entity.Button").includes([
	"lychee.ui.Button"
]).exports(function (lychee, game, global, attachments) {

	var Class = function(data, game) {

		var settings = lychee.extend({}, data);


		this.game = game || null;


		settings.width  = 192;
		settings.height = 48;


		lychee.ui.Button.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {

			this.game.loop.setTimeout(500, function() {
				this.changeState('menu');
			}, this.game);

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Button.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Button';

			var settings = data['arguments'][0];


			return data;

		}

	};


	return Class;

});
lychee.define("game.entity.Circle").includes([
	"lychee.ui.Entity"
]).exports(function (lychee, game, global, attachments) {

	var _sound = attachments["snd"];


	var Class = function(data, game) {

		var settings = lychee.extend({}, data);


		this.game = game || null;

		this.color = '#888888';

		this.__pulse = {
			duration: 500,
			color:    '#888888',
			radius:   0,
			start:    null,
			active:   false
		};


		this.setColor(settings.color);

		delete settings.color;


		settings.radius = 48;
		settings.shape  = lychee.ui.Entity.SHAPE.circle;


		lychee.ui.Entity.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {

			this.game.jukebox.play(_sound);


			var color = this.color;
			if (color === '#ff3333') {
				this.setColor('#33ff33', true);
			} else {
				this.setColor('#ff3333', true);
			}

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Circle';


			return data;

		},

		update: function(clock, delta) {

			var pulse = this.__pulse;
			if (pulse.active === true) {

				if (pulse.start === null) {
					pulse.start = clock;
				}

				var t = (clock - pulse.start) / pulse.duration;
				if (t <= 1) {
					pulse.radius = t * this.radius;
				} else {
					this.color = pulse.color;
					pulse.active = false;
				}

			}


			lychee.ui.Entity.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			var position = this.position;
			var radius   = this.radius;

			renderer.drawCircle(
				offsetX + position.x,
				offsetY + position.y,
				radius,
				this.color,
				true
			);


			var pulse = this.__pulse;
			if (pulse.active === true) {

				renderer.drawCircle(
					offsetX + position.x,
					offsetY + position.y,
					pulse.radius,
					pulse.color,
					true
				);

			}

		},



		/*
		 * CUSTOM API
		 */

		setColor: function(color, fade) {

			color = typeof color === 'string' ? color : null;
			fade  = fade === true;


			if (color !== null) {

				if (fade === true) {

					var pulse = this.__pulse;

					pulse.duration = 250;
					pulse.color    = color;
					pulse.radius   = 0;
					pulse.start    = null;
					pulse.active   = true;

				} else {

					this.color = color;

				}


				return true;

			}


			return false;

		}

	};


	return Class;

});
lychee.define("lychee.game.Entity").exports(function (lychee, global) {

	/*
	 * HELPERS
	 */

	var _default_state  = 'default';
	var _default_states = { 'default': null };



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.width  = typeof settings.width  === 'number' ? settings.width  : 0;
		this.height = typeof settings.height === 'number' ? settings.height : 0;
		this.depth  = typeof settings.depth  === 'number' ? settings.depth  : 0;
		this.radius = typeof settings.radius === 'number' ? settings.radius : 0;

		this.collision = Class.COLLISION.none;
		this.shape     = Class.SHAPE.rectangle;
		this.state     = _default_state;
		this.position  = { x: 0, y: 0, z: 0 };
		this.velocity  = { x: 0, y: 0, z: 0 };

		this.__clock   = null;
		this.__states  = _default_states;

		this.__tween   = {
			active:       false,
			type:         Class.TWEEN.linear,
			start:        null,
			duration:     0,
			fromposition: { x: 0, y: 0, z: 0 },
			toposition:   { x: 0, y: 0, z: 0 }
		};


		if (settings.states instanceof Object) {

			this.__states = { 'default': null };

			for (var id in settings.states) {

				if (settings.states.hasOwnProperty(id)) {
					this.__states[id] = settings.states[id];
				}

			}

		}


		// Reuse this cache for performance relevant methods
		this.__cache = {
			tween:    { x: 0, y: 0, z: 0 },
			velocity: { x: 0, y: 0, z: 0 }
		};


		this.setCollision(settings.collision);
		this.setShape(settings.shape);
		this.setState(settings.state);
		this.setPosition(settings.position);
		this.setTween(settings.tween);
		this.setVelocity(settings.velocity);

		settings = null;

	};


	Class.COLLISION = {
		none: 0,
		A:    1,
		B:    2,
		C:    3,
		D:    4
	};


	// Same ENUM values as lychee.ui.Entity
	Class.SHAPE = {
		circle:    0,
		sphere:    1,
		rectangle: 2,
		cuboid:    3,
		polygon:   4
	};


	Class.TWEEN = {
		linear:        0,
		easein:        1,
		easeout:       2,
		bounceeasein:  3,
		bounceeaseout: 4
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var settings = {};


			if (this.width  !== 0) settings.width  = this.width;
			if (this.height !== 0) settings.height = this.height;
			if (this.radius !== 0) settings.radius = this.radius;

			if (this.collision !== Class.COLLISION.none)  settings.collision = this.collision;
			if (this.shape     !== Class.SHAPE.rectangle) settings.shape     = this.shape;
			if (this.state     !== _default_state)        settings.state     = this.state;
			if (this.__states !== _default_states)        settings.states    = this.__states;


			if (
				   this.position.x !== 0
				|| this.position.y !== 0
				|| this.position.z !== 0
			) {

				settings.position = {};

				if (this.position.x !== 0) settings.position.x = this.position.x;
				if (this.position.y !== 0) settings.position.y = this.position.y;
				if (this.position.z !== 0) settings.position.z = this.position.z;

			}


			if (
				   this.velocity.x !== 0
				|| this.velocity.y !== 0
				|| this.velocity.z !== 0
			) {

				settings.velocity = {};

				if (this.velocity.x !== 0) settings.velocity.x = this.velocity.x;
				if (this.velocity.y !== 0) settings.velocity.y = this.velocity.y;
				if (this.velocity.z !== 0) settings.velocity.z = this.velocity.z;

			}


			return {
				'constructor': 'lychee.game.Entity',
				'arguments':   [ settings ]
			};

		},

		// Allows sync(null, true) for reset
		sync: function(clock, force) {

			force = force === true;


			if (force === true) {
				this.__clock = clock;
			}


			if (this.__clock === null) {

				if (this.__tween.active === true && this.__tween.start === null) {
					this.__tween.start = clock;
				}

				this.__clock = clock;

			}

		},

		// HINT: Renderer skips if no render() method exists
		// render: function(renderer, offsetX, offsetY) {},

		update: function(clock, delta) {

			// 1. Sync clocks initially
			// (if Entity was created before loop started)
			if (this.__clock === null) {
				this.sync(clock);
			}


			var t  = 0;
			var dt = delta / 1000;
			var cache;


			var tween = this.__tween;

			// 2. Tweening
			if (
				   tween.active === true
				&& tween.start !== null
			) {

				var t = (this.__clock - tween.start) / tween.duration;
				if (t <= 1) {

					var type = tween.type;
					var from = tween.fromposition;
					var to   = tween.toposition;

					var dx = to.x - from.x;
					var dy = to.y - from.y;
					var dz = to.z - from.z;


					var cache = this.__cache.tween;

					if (type === Class.TWEEN.linear) {

						cache.x = from.x + t * dx;
						cache.y = from.y + t * dy;
						cache.z = from.z + t * dz;

					} else if (type === Class.TWEEN.easein) {

						var f = 1 * Math.pow(t, 3);

						cache.x = from.x + f * dx;
						cache.y = from.y + f * dy;
						cache.z = from.z + f * dz;

					} else if (type === Class.TWEEN.easeout) {

						var f = Math.pow(t - 1, 3) + 1;

						cache.x = from.x + f * dx;
						cache.y = from.y + f * dy;
						cache.z = from.z + f * dz;

					} else if (type === Class.TWEEN.bounceeasein) {

						var k = 1 - t;
						var f;

						if ((k /= 1) < ( 1 / 2.75 )) {
							f = 1 * ( 7.5625 * Math.pow(k, 2) );
						} else if (k < ( 2 / 2.75 )) {
							f = 7.5625 * ( k -= ( 1.5 / 2.75 )) * k + .75;
						} else if (k < ( 2.5 / 2.75 )) {
							f = 7.5625 * ( k -= ( 2.25 / 2.75 )) * k + .9375;
						} else {
							f = 7.5625 * ( k -= ( 2.625 / 2.75 )) * k + .984375;
						}

						cache.x = from.x + (1 - f) * dx;
						cache.y = from.y + (1 - f) * dy;
						cache.z = from.z + (1 - f) * dz;

					} else if (type === Class.TWEEN.bounceeaseout) {

						var f;

						if ((t /= 1) < ( 1 / 2.75 )) {
							f = 1 * ( 7.5625 * Math.pow(t, 2) );
						} else if (t < ( 2 / 2.75 )) {
							f = 7.5625 * ( t -= ( 1.5 / 2.75 )) * t + .75;
						} else if (t < ( 2.5 / 2.75 )) {
							f = 7.5625 * ( t -= ( 2.25 / 2.75 )) * t + .9375;
						} else {
							f = 7.5625 * ( t -= ( 2.625 / 2.75 )) * t + .984375;
						}

						cache.x = from.x + f * dx;
						cache.y = from.y + f * dy;
						cache.z = from.z + f * dz;

					}


					this.setPosition(cache);

				} else {

					this.setPosition(tween.toposition);
					tween.active = false;

				}

			}


			var velocity = this.velocity;

			// 3. Velocity
			if (
				   velocity.x !== 0
				|| velocity.y !== 0
				|| velocity.z !== 0
			) {

				cache = this.__cache.velocity;

				cache.x = this.position.x;
				cache.y = this.position.y;
				cache.z = this.position.z;


				if (velocity.x !== 0) {
					cache.x += velocity.x * dt;
				}

				if (velocity.y !== 0) {
					cache.y += velocity.y * dt;
				}

				if (velocity.z !== 0) {
					cache.z += velocity.z * dt;
				}


				this.setPosition(cache);

			}


			this.__clock = clock;

		},



		/*
		 * CUSTOM API
		 */

		isAtPosition: function(position) {

			if (
				   position instanceof Object
				&& typeof position.x === 'number'
				&& typeof position.y === 'number'
			) {

				var x = position.x;
				var y = position.y;

				var shape = this.shape;
				if (shape === Class.SHAPE.circle) {

					var dist = Math.sqrt(x * x + y * y);
					if (dist < this.radius) {
						return true;
					}

				} else if (shape === Class.SHAPE.rectangle) {

					var maxx = this.width  / 2;
					var maxy = this.height / 2;
					var minx = -1 * maxx;
					var miny = -1 * maxy;

					if (
						   x >= minx && x <= maxx
						&& y >= miny && y <= maxy
					) {
						return true;
					}

				}

			}


			return false;

		},

		collidesWith: function(entity) {

			if (
				   this.collision !== entity.collision
				|| this.collision === Class.COLLISION.none
				|| entity.collision === Class.COLLISION.none
			) {
				return false;
			}


			var shapeA = this.shape;
			var shapeB = entity.shape;
			var posA   = this.position;
			var posB   = entity.position;


			if (
				   shapeA === Class.SHAPE.circle
				&& shapeB === Class.SHAPE.circle
			) {

				var collisionDistance = this.radius + entity.radius;
				var realDistance = Math.sqrt(
					Math.pow(posB.x - posA.x, 2) + Math.pow(posB.y - posA.y, 2)
				);


				if (realDistance <= collisionDistance) {
					return true;
				}

			} else if (
				   shapeA === Class.SHAPE.circle
				&& shapeB === Class.SHAPE.rectangle
			) {

				var radius  = this.radius;
				var hwidth  = entity.width / 2;
				var hheight = entity.height / 2;

				if (
					   (posA.x + radius > posB.x - hwidth)
					&& (posA.x - radius < posB.x + hwidth)
					&& (posA.y + radius > posB.y - hheight)
					&& (posA.y - radius < posB.y + hheight)
				) {
					return true;
				}

			} else if (
				   shapeA === Class.SHAPE.rectangle
				&& shapeB === Class.SHAPE.circle
			) {

				var radius  = entity.radius;
				var hwidth  = this.width / 2;
				var hheight = this.height / 2;

				if (
					   (posB.x + radius > posA.x - hwidth)
					&& (posB.x - radius < posA.x + hwidth)
					&& (posB.y + radius > posA.y - hheight)
					&& (posB.y - radius < posA.y + hheight)
				) {
					return true;
				}

			} else if (
				   shapeA === Class.SHAPE.rectangle
				&& shapeB === Class.SHAPE.rectangle
			) {

				var allwidth  = this.width  + entity.width;
				var allheight = this.height + entity.height;

				var width  = Math.abs(posA.x - posB.x) * 2;
				var height = Math.abs(posA.y - posB.y) * 2;

				if (
					   width  < allwidth
					&& height < allheight
				) {
					return true;
				}

			}


			return false;

		},

		setCollision: function(collision) {

			if (lychee.enumof(Class.COLLISION, collision) === true) {

				this.collision = collision;

				return true;

			}


			return false;

		},

		setShape: function(shape) {

			if (lychee.enumof(Class.SHAPE, shape) === true) {

				this.shape = shape;

				return true;

			}


			return false;

		},

		getStateMap: function() {
			return this.__states[this.state];
		},

		setState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.__states[id] !== undefined) {

				this.state = id;

				return true;

			}


			return false;

		},

		setPosition: function(position) {

			position = position instanceof Object ? position : null;


			if (position !== null) {

				this.position.x = typeof position.x === 'number' ? position.x : this.position.x;
				this.position.y = typeof position.y === 'number' ? position.y : this.position.y;
				this.position.z = typeof position.z === 'number' ? position.z : this.position.z;

				return true;

			}


			return false;

		},

		setTween: function(settings) {

			settings = settings instanceof Object ? settings : null;


			if (settings !== null) {

				var tween = this.__tween;

				tween.type     = lychee.enumof(Class.TWEEN, settings.type) ? settings.type     : Class.TWEEN.linear;
				tween.duration = typeof settings.duration === 'number'     ? settings.duration : 1000;

				if (settings.position instanceof Object) {
					tween.toposition.x = typeof settings.position.x === 'number' ? settings.position.x : this.position.x;
					tween.toposition.y = typeof settings.position.y === 'number' ? settings.position.y : this.position.y;
					tween.toposition.z = typeof settings.position.z === 'number' ? settings.position.z : this.position.z;
				}

				tween.fromposition.x = this.position.x;
				tween.fromposition.y = this.position.y;
				tween.fromposition.z = this.position.z;

				tween.start  = this.__clock;
				tween.active = true;


				return true;

			}


			return false;

		},

		clearTween: function() {
			this.__tween.active = false;
		},

		setVelocity: function(velocity) {

			velocity = velocity instanceof Object ? velocity : null;


			if (velocity !== null) {

				this.velocity.x = typeof velocity.x === 'number' ? velocity.x : this.velocity.x;
				this.velocity.y = typeof velocity.y === 'number' ? velocity.y : this.velocity.y;
				this.velocity.z = typeof velocity.z === 'number' ? velocity.z : this.velocity.z;

				return true;

			}


			return false;

		}

	};


	return Class;

});
lychee.define("lychee.game.Layer").requires([
	"lychee.game.Entity"
]).exports(function (lychee, global) {

	/*
	 * HELPERS
	 */

	var _validate_entity = function(entity) {

		if (
			entity instanceof Object
			&& typeof entity.update === 'function'
			&& typeof entity.render === 'function'
			&& typeof entity.shape === 'number'
		) {

			return true;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.entities = [];
		this.offset   = { x: 0, y: 0 };
		this.position = { x: 0, y: 0 };
		this.visible  = true;

		this.__map = {};


		this.setEntities(settings.entities);
		this.setOffset(settings.offset);
		this.setPosition(settings.position);
		this.setVisible(settings.visible);


		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var entities = [];
			for (var e = 0, el = blob.entities.length; e < el; e++) {
				entities.push(lychee.deserialize(blob.entities[e]));
			}

			var map = {};
			for (var id in blob.map) {

				var index = blob.map[id];
				if (typeof index === 'number') {
					map[id] = index;
				}

			}


			for (var e = 0, el = entities.length; e < el; e++) {

				var id = null;
				for (var mid in map) {

					if (map[mid] === e) {
						id = mid;
					}

				}


				if (id !== null) {
					this.setEntity(id, entities[e]);
				} else {
					this.addEntity(entities[e]);
				}

			}

		},

		serialize: function() {

			var settings = {};
			var blob     = {};


			if (
				   this.offset.x !== 0
				|| this.offset.y !== 0
				|| this.offset.z !== 0
			) {

				settings.offset = {};

				if (this.offset.x !== 0) settings.offset.x = this.offset.x;
				if (this.offset.y !== 0) settings.offset.y = this.offset.y;
				if (this.offset.z !== 0) settings.offset.z = this.offset.z;

			}

			if (this.visible !== true) settings.visible = this.visible;


			var entities = [];

			if (this.entities.length > 0) {

				blob.entities = [];

				for (var e = 0, el = this.entities.length; e < el; e++) {

					var entity = this.entities[e];

					blob.entities.push(lychee.serialize(entity));
					entities.push(entity);

				}

			}


			if (Object.keys(this.__map).length > 0) {

				blob.map = {};

				for (var id in this.__map) {

					var index = entities.indexOf(this.__map[id]);
					if (index !== -1) {
						blob.map[id] = index;
					}

				}

			}


			return {
				'constructor': 'lychee.game.Layer',
				'arguments':   [ settings ],
				'blob':        blob
			};

		},

		update: function(clock, delta) {

			var entities = this.entities;
			for (var e = 0, el = entities.length; e < el; e++) {
				entities[e].update(clock, delta);
			}

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;

			var position = this.position;
			var offset   = this.offset;


			var ox = position.x + offsetX + offset.x;
			var oy = position.y + offsetY + offset.y;


			var entities = this.entities;
			for (var e = 0, el = entities.length; e < el; e++) {

				entities[e].render(
					renderer,
					ox,
					oy
				);

			}


			if (lychee.debug === true) {

				var hwidth   = this.width  / 2;
				var hheight  = this.height / 2;


				renderer.drawBox(
					ox - hwidth,
					oy - hheight,
					ox + hwidth,
					oy + hheight,
					'#ffff00',
					false,
					1
				);

			}

		},



		/*
		 * CUSTOM API
		 */

		reshape: function() {

			var hwidth  = this.width  / 2;
			var hheight = this.height / 2;


			for (var e = 0, el = this.entities.length; e < el; e++) {

				var entity = this.entities[e];
				var boundx = Math.abs(entity.position.x + this.offset.x);
				var boundy = Math.abs(entity.position.y + this.offset.y);

				if (entity.shape === lychee.game.Entity.SHAPE.circle) {
					boundx += entity.radius;
					boundy += entity.radius;
				} else if (entity.shape === lychee.game.Entity.SHAPE.rectangle) {
					boundx += entity.width  / 2;
					boundy += entity.height / 2;
				}

				hwidth  = Math.max(hwidth,  boundx);
				hheight = Math.max(hheight, boundy);

			}


			this.width  = hwidth  * 2;
			this.height = hheight * 2;

		},

		addEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				var found = false;

				for (var e = 0, el = this.entities.length; e < el; e++) {

					if (this.entities[e] === entity) {
						found = true;
						break;
					}

				}


				if (found === false) {

					this.entities.push(entity);
					this.reshape();

					return true;

				}

			}


			return false;

		},

		setEntity: function(id, entity) {

			id     = typeof id === 'string'            ? id     : null;
			entity = _validate_entity(entity) === true ? entity : null;


			if (
				   id !== null
				&& entity !== null
				&& this.__map[id] === undefined
			) {

				this.__map[id] = entity;

				var result = this.addEntity(entity);
				if (result === true) {

					return true;

				} else {

					delete this.__map[id];

				}

			}


			return false;

		},

		getEntity: function(id) {

			id = typeof id === 'string' ? id : null;


			if (
				   id !== null
				&& this.__map[id] !== undefined
			) {

				return this.__map[id];

			}


			return null;

		},

		removeEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				var found = false;

				for (var e = 0, el = this.entities.length; e < el; e++) {

					if (this.entities[e] === entity) {
						this.entities.splice(e, 1);
						found = true;
						el--;
						e--;
					}

				}


				for (var id in this.__map) {

					if (this.__map[id] === entity) {
						delete this.__map[id];
						found = true;
					}

				}


				if (found === true) {
					this.reshape();
				}


				return found;

			}


			return false;

		},

		setEntities: function(entities) {

			var all = true;

			if (entities instanceof Array) {

				for (var e = 0, el = entities.length; e < el; e++) {

					var result = this.addEntity(entities[e]);
					if (result === false) {
						all = false;
					}

				}

			}


			return all;

		},

		setOffset: function(offset) {

			if (offset instanceof Object) {

				this.offset.x = typeof offset.x === 'number' ? offset.x : this.offset.x;
				this.offset.y = typeof offset.y === 'number' ? offset.y : this.offset.y;

				return true;

			}


			return false;

		},

		setPosition: function(position) {

			if (position instanceof Object) {

				this.position.x = typeof position.x === 'number' ? position.x : this.position.x;
				this.position.y = typeof position.y === 'number' ? position.y : this.position.y;

				return true;

			}


			return false;

		},

		setVisible: function(visible) {

			if (visible === true || visible === false) {

				this.visible = visible;

				return true;

			}


			return false;

		}

	};


	return Class;

});
lychee.define("lychee.ui.Layer").includes([
	"lychee.ui.Entity"
]).exports(function (lychee, global) {

	/*
	 * HELPERS
	 */

	var _validate_entity = function(entity) {

		if (
			entity instanceof Object
			&& typeof entity.shape === 'number'
			&& typeof entity.update === 'function'
			&& typeof entity.render === 'function'
			&& typeof entity.isAtPosition === 'function'
		) {

			return true;

		}

	};

	var _process_touch = function(id, position, delta) {

		var triggered = null;
		var args      = [ id, {
			x: position.x - this.offset.x,
			y: position.y - this.offset.y
		}, delta ];


		for (var e = this.entities.length - 1; e >= 0; e--) {

			var entity = this.entities[e];
			if (entity.visible === false) continue;

			if (
				   typeof entity.trigger === 'function'
				&& entity.isAtPosition(args[1]) === true
			) {

				args[1].x -= entity.position.x;
				args[1].y -= entity.position.y;

				var result = entity.trigger('touch', args);
				if (result === true) {
					triggered = entity;
					break;
				} else if (result !== false) {
					triggered = result;
					break;
				}

			}

		}


		return triggered;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.entities = [];
		this.offset   = { x: 0, y: 0 };
		this.visible  = true;

		this.__map    = {};


		this.setEntities(settings.entities);
		this.setOffset(settings.offset);
		this.setVisible(settings.visible);

		delete settings.entities;
		delete settings.offset;
		delete settings.visible;


		settings.shape = lychee.ui.Entity.SHAPE.rectangle;


		lychee.ui.Entity.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', _process_touch, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var entities = [];
			for (var e = 0, el = blob.entities.length; e < el; e++) {
				entities.push(lychee.deserialize(blob.entities[e]));
			}

			var map = {};
			for (var id in blob.map) {

				var index = blob.map[id];
				if (typeof index === 'number') {
					map[id] = index;
				}

			}

			for (var e = 0, el = entities.length; e < el; e++) {

				var id = null;
				for (var mid in map) {

					if (map[mid] === e) {
						id = mid;
					}

				}


				if (id !== null) {
					this.setEntity(id, entities[e]);
				} else {
					this.addEntity(entities[e]);
				}

			}

		},

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.Layer';

			var settings = data['arguments'][0];
			var blob     = data['blob'] = (data['blob'] || {});


			if (
				   this.offset.x !== 0
				|| this.offset.y !== 0
			) {

				settings.offset = {};

				if (this.offset.x !== 0) settings.offset.x = this.offset.x;
				if (this.offset.y !== 0) settings.offset.y = this.offset.y;

			}

			if (this.visible !== true)   settings.visible  = this.visible;


			var entities = [];

			if (this.entities.length > 0) {

				blob.entities = [];

				for (var e = 0, el = this.entities.length; e < el; e++) {

					var entity = this.entities[e];

					blob.entities.push(lychee.serialize(entity));
					entities.push(entity);

				}

			}


			if (Object.keys(this.__map).length > 0) {

				blob.map = {};

				for (var id in this.__map) {

					var index = entities.indexOf(this.__map[id]);
					if (index !== -1) {
						blob.map[id] = index;
					}

				}

			}


			return data;

		},

		update: function(clock, delta) {

			lychee.ui.Entity.prototype.update.call(this, clock, delta);


			var entities = this.entities;
			for (var e = 0, el = entities.length; e < el; e++) {
				entities[e].update(clock, delta);
			}

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var position = this.position;
			var offset   = this.offset;


			var ox = position.x + offsetX + offset.x;
			var oy = position.y + offsetY + offset.y;


			var entities = this.entities;
			for (var e = 0, el = entities.length; e < el; e++) {

				entities[e].render(
					renderer,
					ox,
					oy
				);

			}


			if (lychee.debug === true) {

				ox = position.x + offsetX;
				oy = position.y + offsetY;


				var hwidth   = this.width  / 2;
				var hheight  = this.height / 2;


				renderer.drawBox(
					ox - hwidth,
					oy - hheight,
					ox + hwidth,
					oy + hheight,
					'#ff00ff',
					false,
					1
				);

			}

		},



		/*
		 * CUSTOM API
		 */

		reshape: function() {

			var hwidth  = this.width  / 2;
			var hheight = this.height / 2;


			for (var e = 0, el = this.entities.length; e < el; e++) {

				var entity = this.entities[e];
				if (typeof entity.reshape === 'function') {
					entity.reshape();
				}


				var boundx = Math.abs(entity.position.x + this.offset.x);
				var boundy = Math.abs(entity.position.y + this.offset.y);

				if (entity.shape === lychee.ui.Entity.SHAPE.circle) {
					boundx += entity.radius;
					boundy += entity.radius;
				} else if (entity.shape === lychee.ui.Entity.SHAPE.rectangle) {
					boundx += entity.width  / 2;
					boundy += entity.height / 2;
				}

				hwidth  = Math.max(hwidth,  boundx);
				hheight = Math.max(hheight, boundy);

			}


			this.width  = hwidth  * 2;
			this.height = hheight * 2;

		},

		addEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				var found = false;

				for (var e = 0, el = this.entities.length; e < el; e++) {

					if (this.entities[e] === entity) {
						found = true;
						break;
					}

				}


				if (found === false) {

					this.entities.push(entity);
					this.reshape();

					return true;

				}

			}


			return false;

		},

		setEntity: function(id, entity) {

			id     = typeof id === 'string'            ? id     : null;
			entity = _validate_entity(entity) === true ? entity : null;


			if (
				   id !== null
				&& entity !== null
				&& this.__map[id] === undefined
			) {

				this.__map[id] = entity;

				var result = this.addEntity(entity);
				if (result === true) {

					return true;

				} else {

					delete this.__map[id];

				}

			}


			return false;

		},

		getEntity: function(id) {

			id = typeof id === 'string' ? id : null;


			if (
				   id !== null
				&& this.__map[id] !== undefined
			) {

				return this.__map[id];

			}


			return null;

		},

		removeEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				var found = false;

				for (var e = 0, el = this.entities.length; e < el; e++) {

					if (this.entities[e] === entity) {
						this.entities.splice(e, 1);
						found = true;
						el--;
						e--;
					}

				}


				for (var id in this.__map) {

					if (this.__map[id] === entity) {
						delete this.__map[id];
						found = true;
					}

				}


				if (found === true) {
					this.reshape();
				}


				return found;

			}


			return false;

		},

		setEntities: function(entities) {

			var all = true;

			if (entities instanceof Array) {

				this.entities = [];

				for (var e = 0, el = entities.length; e < el; e++) {

					var result = this.addEntity(entities[e]);
					if (result === false) {
						all = false;
					}

				}

			}


			return all;

		},

		setOffset: function(offset) {

			if (offset instanceof Object) {

				this.offset.x = typeof offset.x === 'number' ? offset.x : this.offset.x;
				this.offset.y = typeof offset.y === 'number' ? offset.y : this.offset.y;

				this.reshape();

				return true;

			}


			return false;

		},

		setVisible: function(visible) {

			if (visible === true || visible === false) {

				this.visible = visible;

				return true;

			}


			return false;

		}

	};


	return Class;

});
lychee.define("lychee.game.State").requires([
	"lychee.game.Layer",
	"lychee.ui.Layer"
]).exports(function (lychee, global) {


	/*
	 * HELPERS
	 */

	var _trace_entity_offset = function(entity, layer, offsetX, offsetY) {

		if (offsetX === undefined || offsetY === undefined) {

			this.x  = 0;
			this.y  = 0;
			offsetX = layer.position.x;
			offsetY = layer.position.y;

		}


		if (layer === entity) {

			this.x = offsetX;
			this.y = offsetY;

			return true;

		} else if (layer.entities !== undefined) {

			var entities = layer.entities;
			for (var e = entities.length - 1; e >= 0; e--) {

				var dx = layer.offset.x + entities[e].position.x;
				var dy = layer.offset.y + entities[e].position.y;


				var result = _trace_entity_offset.call(
					this,
					entity,
					entities[e],
					offsetX + dx,
					offsetY + dy
				);

				if (result === true) {
					return true;
				}

			}

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game) {

		this.game     = game          || null;
		this.client   = game.client   || null;
		this.input    = game.input    || null;
		this.jukebox  = game.jukebox  || null;
		this.loop     = game.loop     || null;
		this.renderer = game.renderer || null;


		this.__layers  = {};
		this.__focus   = null;
		this.__touches = [
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } }
		];

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		deserialize: function(blob) {

			var env = lychee.getEnvironment();

			lychee.setEnvironment(this);

			for (var id in blob.layers) {
				this.setLayer(id, lychee.deserialize(blob.layers[id]));
			}

			lychee.setEnvironment(env);

		},

		serialize: function() {

			var blob = {};


			blob.layers = {};

			for (var id in this.__layers) {
				blob.layers[id] = this.__layers[id].serialize();
			}


			var game = null;
			if (this.game !== null) {
				game = '#lychee.game.Main';
			}


			return {
				'constructor': 'lychee.game.State',
				'arguments':   [ game ],
				'blob':        blob
			};

		},

		reshape: function() {

			var renderer = this.renderer;
			if (renderer !== null) {

				var position = {
					x: 1/2 * renderer.width,
					y: 1/2 * renderer.height
				};

				for (var id in this.__layers) {
					this.__layers[id].setPosition(position);
					this.__layers[id].reshape();
				}

			}

		},

		enter: function() {

			var input = this.input;
			if (input !== null) {
				input.bind('key',   this.processKey,   this);
				input.bind('touch', this.processTouch, this);
				input.bind('swipe', this.processSwipe, this);
			}

		},

		leave: function() {

			var focus = this.__focus;
			if (focus !== null) {
				focus.trigger('blur');
			}


			for (var t = 0, tl = this.__touches.length; t < tl; t++) {

				var touch = this.__touches[t];
				if (touch.entity !== null) {
					touch.entity = null;
					touch.layer  = null;
				}

			}


			this.__focus = null;


			var input = this.input;
			if (input !== null) {
				input.unbind('swipe', this.processSwipe, this);
				input.unbind('touch', this.processTouch, this);
				input.unbind('key',   this.processKey,   this);
			}

		},

		show: function() {

		},

		hide: function() {

		},

		update: function(clock, delta) {

			for (var id in this.__layers) {

				var layer = this.__layers[id];
				if (layer.visible === false) continue;

				layer.update(clock, delta);

			}

		},

		render: function(clock, delta, custom) {

			custom = custom === true;


			var renderer = this.renderer;
			if (renderer !== null) {

				if (custom === false) {
					renderer.clear();
				}


				for (var id in this.__layers) {

					var layer = this.__layers[id];
					if (layer.visible === false) continue;

					layer.render(
						renderer,
						0,
						0
					);

				}


				if (custom === false) {
					renderer.flush();
				}

			}

		},



		/*
		 * LAYER API
		 */

		setLayer: function(id, layer) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				if (
					   lychee.interfaceof(lychee.game.Layer, layer) === true
					|| lychee.interfaceof(lychee.ui.Layer, layer) === true
				) {

					this.__layers[id] = layer;

					return true;

				}

			}


			return false;

		},

		getLayer: function(id) {

			id = typeof id === 'string' ? id : null;


			if (
				   id !== null
				&& this.__layers[id] !== undefined
			) {

				return this.__layers[id];

			}


			return null;

		},

		queryLayer: function(id, query) {

			id    = typeof id === 'string'    ? id    : null;
			query = typeof query === 'string' ? query : null;


			if (
				   id !== null
				&& query !== null
			) {

				var layer = this.getLayer(id);
				if (layer !== null) {

					var entity = layer;
					var ids    = query.split(' > ');

					for (var i = 0, il = ids.length; i < il; i++) {

						entity = entity.getEntity(ids[i]);

						if (entity === null) {
							break;
						}

					}


					return entity;

				}

			}


			return null;

		},

		removeLayer: function(id) {

			id = typeof id === 'string' ? id : null;


			if (
				   id !== null
				&& this.__layers[id] !== undefined
			) {

				delete this.__layers[id];

				return true;

			}


			return false;

		},

		processKey: function(key, name, delta) {

			var focus = this.__focus;
			if (focus !== null) {

				var result = focus.trigger('key', [ key, name, delta ]);
				if (
					   result === true
					&& key === 'return'
					&& focus.state === 'default'
				) {

					this.__focus = null;

				}

			}

		},

		processTouch: function(id, position, delta) {

			var args = [ id, {
				x: 0,
				y: 0
			}, delta ];


			var x = position.x;
			var y = position.y;


			var renderer = this.renderer;
			if (renderer !== null) {

				x -= renderer.offset.x;
				y -= renderer.offset.y;

			}


			var touch_layer  = null;
			var touch_entity = null;

			for (var lid in this.__layers) {

				var layer = this.__layers[lid];
				if (layer.visible === false) continue;

				if (layer instanceof lychee.ui.Layer) {

					args[1].x = x - layer.position.x;
					args[1].y = y - layer.position.y;


					var result = layer.trigger('touch', args);
					if (
						   result !== true
						&& result !== false
						&& result !== null
					) {

						touch_entity = result;
						touch_layer  = layer;

						break;

					}

				}

			}


			var old_focus = this.__focus;
			var new_focus = touch_entity;

			// 1. Reset Touch trace data if no Entity was touched
			if (new_focus === null) {
				this.__touches[id].entity = null;
				this.__touches[id].layer  = null;
			}


			// 2. Change Focus State Interaction
			if (new_focus !== old_focus) {

				if (old_focus !== null) {

					if (old_focus.state !== 'default') {
						old_focus.trigger('blur');
					}

				}

				if (new_focus !== null) {

					if (new_focus.state === 'default') {
						new_focus.trigger('focus');
					}

				}


				this.__focus = new_focus;

			}


			// 3. Prepare UI Swipe event
			if (touch_entity !== null) {

				var touch = this.__touches[id];

				touch.entity   = new_focus;
				touch.layer    = touch_layer;


				// TODO: Fix intelligent reshape() calls for resizing entities on touch events
				this.loop.setTimeout(300, function() {
					this.reshape();
				}, touch.layer);


				_trace_entity_offset.call(
					touch.offset,
					touch.entity,
					touch.layer
				);

			}

		},

		processSwipe: function(id, type, position, delta, swipe) {

			var touch = this.__touches[id];
			if (touch.entity !== null) {

				if (touch.layer.visible === false) return;


				var args = [ id, type, position, delta, swipe ];

				var renderer = this.renderer;
				if (renderer !== null) {

					args[2].x -= renderer.offset.x;
					args[2].y -= renderer.offset.y;

				}


				if (type === 'start') {

					_trace_entity_offset.call(
						touch.offset,
						touch.entity,
						touch.layer
					);


					args[2].x -= touch.offset.x;
					args[2].y -= touch.offset.y;

					var result = touch.entity.trigger('swipe', args);
					if (result === false) {
						touch.entity = null;
						touch.layer  = null;
					}

				} else if (type === 'move') {

					args[2].x -= touch.offset.x;
					args[2].y -= touch.offset.y;

					var result = touch.entity.trigger('swipe', args);
					if (result === false) {
						touch.entity = null;
						touch.layer  = null;
					}

				} else if (type === 'end') {

					args[2].x -= touch.offset.x;
					args[2].y -= touch.offset.y;

					var result = touch.entity.trigger('swipe', args);
					if (result === false) {
						touch.entity = null;
						touch.layer  = null;
					}

				}

			}

		},

		// TODO: Remove legacy API simulateTouch(), not necessary anymore

		simulateTouch: function(id, position, delta) {

			id       = typeof id === 'number'     ? id       : 0;
			position = position instanceof Object ? position : { x: 0, y: 0 };
			delta    = typeof delta === 'number'  ? delta    : 0;


			var renderer = this.renderer;
			if (renderer !== null) {

				position.x += renderer.width  / 2;
				position.y += renderer.height / 2;

				position.x += renderer.offset.x;
				position.y += renderer.offset.y;

			}


			this.processTouch(id, position, delta);

		}

	};


	return Class;

});
lychee.define("game.state.Game").requires([
	"lychee.ui.Button",
	"game.entity.Button",
	"game.entity.Circle"
]).includes([
	"lychee.game.State"
]).exports(function (lychee, game, global, attachments) {

	var _blob  = attachments["json"];
	var _fonts = {
		headline: attachments["headline.fnt"],
		normal:   attachments["normal.fnt"]
	};


	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.intervalId = null;


		this.deserialize(_blob);
		this.reshape();

	};


	Class.prototype = {

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);


			var entity = null;


			var client = this.client;
			if (client !== null) {

				entity = this.queryLayer('ui', 'statistics');


				var service = client.services.ping;
				if (service !== null) {

					service.bind('unplug', function() {
						this.setLabel('Ping: - ms / - ms');
					}, entity);

					service.bind('statistics', function(ping, pong) {
						this.setLabel('Ping: ' + ping + ' ms / ' + pong + ' ms');
					}, entity);

				}

			}

		},

		reshape: function(orientation, rotation) {

			lychee.game.State.prototype.reshape.call(this, orientation, rotation);


			var entity = null;


			var renderer = this.renderer;
			if (renderer !== null) {

				var width  = renderer.width;
				var height = renderer.height;


				entity = this.queryLayer('ui', 'button');
				entity.position.y = 1/2 * height - 42;

			}

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);


			var circle = this.queryLayer('ui', 'circle');
			if (circle !== null) {
				circle.setColor('#888888', true);
			}


			var loop = this.loop;
			if (loop !== null) {

				this.intervalId = loop.setInterval(1000, function() {

					var client = this.client;
					if (client !== null) {

						var service = this.client.services.ping;
						if (service !== null) {
							service.ping();
						}

					}

				}, this);

			}


		},

		leave: function() {

			var loop = this.loop;
			if (loop !== null) {
				loop.removeInterval(this.intervalId);
			}


			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});
lychee.define("lychee.game.Sprite").includes([
	"lychee.game.Entity"
]).exports(function (lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.frame   = 0;
		this.texture = null;

		this.__animation = {
			active:   false,
			start:    null,
			frames:   0,
			duration: 0,
			loop:     false
		};
		this.__map = {};


		this.setAnimation(settings.animation);
		this.setTexture(settings.texture);
		this.setMap(settings.map);

		delete settings.texture;
		delete settings.map;


		lychee.game.Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var texture = lychee.deserialize(blob.texture);
			if (texture !== null) {
				this.setTexture(texture);
			}

		},

		serialize: function() {

			var data = lychee.game.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lyche.game.Sprite';

			var settings = data['arguments'][0];
			var blob     = data['blob'] = (data['blob'] || {});


			if (this.__animation.active === true) {

				settings.animation = {};

				if (this.__animation.duration !== 1000) settings.animation.duration = this.__animation.duration;
				if (this.frame !== 0)                   settings.animation.frame    = this.frame;
				if (this.__animation.frames !== 25)     settings.animation.frames   = this.__animation.frames;
				if (this.__animation.loop !== false)    settings.animation.loop     = true;

			}

			if (Object.keys(this.__map).length > 0) {

				settings.map = {};


				for (var stateId in this.__map) {

					settings.map[stateId] = [];


					var frames = this.__map[stateId];
					for (var f = 0, fl = frames.length; f < fl; f++) {

						var frame  = frames[f];
						var sframe = {};

						if (frame.x !== 0) sframe.x = frame.x;
						if (frame.y !== 0) sframe.y = frame.y;
						if (frame.w !== 0) sframe.w = frame.w;
						if (frame.h !== 0) sframe.h = frame.h;


						settings.map[stateId].push(sframe);

					}

				}

			}


			if (this.texture !== null) blob.texture = this.texture.serialize();


			return data;

		},

		sync: function(clock, force) {

			force = force === true;


			if (force === true) {
				this.__clock = clock;
			}


			if (this.__clock === null) {

				if (this.__animation.active === true && this.__animation.start === null) {
					this.__animation.start = clock;
				}

			}

			lychee.game.Entity.prototype.sync.call(this, clock, force);

		},

		render: function(renderer, offsetX, offsetY) {

			var texture = this.texture;
			if (texture !== null) {

				var position = this.position;

				var map = this.getMap();
				if (map !== null) {

					var x1 = position.x + offsetX - map.w / 2;
					var y1 = position.y + offsetY - map.h / 2;

					renderer.drawSprite(
						x1,
						y1,
						texture,
						map
					);

				} else {

					var hw = (this.width / 2)  || this.radius;
					var hh = (this.height / 2) || this.radius;

					var x1 = position.x + offsetX - hw;
					var y1 = position.y + offsetY - hh;

					renderer.drawSprite(
						x1,
						y1,
						texture
					);

				}

			}

		},

		update: function(clock, delta) {

			lychee.game.Entity.prototype.update.call(this, clock, delta);


			var animation = this.__animation;

			// 1. Animation (Interpolation)
			if (
				animation.active === true
				&& animation.start !== null
			) {

				var t = (this.__clock - animation.start) / animation.duration;

				if (t <= 1) {

					this.frame = Math.max(0, Math.ceil(t * animation.frames) - 1);

				} else {

					if (animation.loop === true) {
						animation.start = this.__clock;
					} else {
						this.frame = animation.frames - 1;
						animation.active = false;
					}

				}

			}

		},



		/*
		 * CUSTOM API
		 */

		setAnimation: function(settings) {

			settings = settings instanceof Object ? settings : null;


			if (settings !== null) {

				var duration = typeof settings.duration === 'number' ? settings.duration : 1000;
				var frame    = typeof settings.frame === 'number'    ? settings.frame    : 0;
				var frames   = typeof settings.frames === 'number'   ? settings.frames   : 25;
				var loop     = settings.loop === true;


				var animation = this.__animation;

				animation.start    = this.__clock;
				animation.active   = true;
				animation.duration = duration;
				animation.frames   = frames;
				animation.loop     = loop;

				this.frame = frame;

				return true;

			}


			return false;

		},

		clearAnimation: function() {

			this.__animation.active = false;
			this.frame = 0;

		},

		setState: function(id) {

			var result = lychee.game.Entity.prototype.setState.call(this, id);
			if (result === true) {

				var map = this.__map[this.state] || null;
				if (map !== null) {

					if (map instanceof Array) {

						var statemap = this.getStateMap();
						if (statemap !== null && statemap instanceof Object) {

							this.clearAnimation();

							if (statemap.animation === true) {

								this.setAnimation({
									duration: statemap.duration || 1000,
									frame:    0,
									frames:   map.length,
									loop:     statemap.loop === true
								});

							}

						}


						map = map[0];

					}


					if (map.width !== undefined && typeof map.width === 'number') {
						this.width = map.width;
					}

					if (map.height !== undefined && typeof map.height === 'number') {
						this.height = map.height;
					}

					if (map.radius !== undefined && typeof map.radius === 'number') {
						this.radius = map.radius;
					}

				}

			}


			return result;

		},

		setTexture: function(texture) {

			if (
				   texture instanceof Texture
				|| texture === null
			) {

				this.texture = texture;

				return true;

			}


			return false;

		},

		getMap: function() {

			var state = this.state;
			var frame = this.frame;

			if (
				   this.__map[state] instanceof Array
				&& this.__map[state][frame] != null
			) {

				return this.__map[state][frame];

			}


			return null;

		},

		setMap: function(map) {

			map = map instanceof Object ? map : null;


			var valid = false;

			if (map !== null) {

				for (var stateId in map) {

					var frames = map[stateId];
					if (frames instanceof Array) {

						this.__map[stateId] = [];


						for (var f = 0, fl = frames.length; f < fl; f++) {

							var frame = frames[f];
							if (frame instanceof Object) {

								frame.x = typeof frame.x === 'number' ? frame.x : 0;
								frame.y = typeof frame.y === 'number' ? frame.y : 0;
								frame.w = typeof frame.w === 'number' ? frame.w : 0;
								frame.h = typeof frame.h === 'number' ? frame.h : 0;


								this.__map[stateId].push(frame);

							}

						}


						valid = true;

					}

				}

			}


			return valid;

		}

	};


	return Class;

});
lychee.define("game.entity.lycheeJS").includes([
	"lychee.game.Sprite"
]).exports(function (lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = {
		width:  256,
		height: 48
	};


	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		settings.texture = _texture;

		settings.width     = _config.width;
		settings.height    = _config.height;


		lychee.game.Sprite.call(this, settings);

	};


	Class.prototype = {

		serialize: function() {

			var data = lychee.game.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.lycheeJS';


			return data;

		}

	};


	return Class;

});
lychee.define("lychee.ui.Label").includes([
	"lychee.ui.Entity"
]).exports(function (lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.label = null;
		this.font  = null;


		this.setFont(settings.font);
		this.setLabel(settings.label);

		delete settings.font;
		delete settings.label;


		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;
		settings.width  = this.width;
		settings.height = this.height;


		lychee.ui.Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}

		},

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.Label';

			var settings = data['arguments'][0];
			var blob     = data['blob'] = (data['blob'] || {});


			if (this.label !== null) settings.label = this.label;


			if (this.font !== null) blob.font = this.font.serialize();


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;


			var label = this.label;
			var font  = this.font;

			if (label !== null && font !== null) {

				renderer.drawText(
					x,
					y,
					label,
					font,
					true
				);

			}

		},



		/*
		 * CUSTOM API
		 */

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.font = font;

				// refresh the layout
				if (this.label !== null) {
					this.setLabel(this.label);
				}

				return true;

			}


			return false;

		},

		setLabel: function(label) {

			label = typeof label === 'string' ? label : null;


			if (label !== null) {

				var font = this.font;
				if (font !== null) {

					var dim = font.measure(label);

					this.width  = dim.realwidth;
					this.height = dim.realheight;

				}

				this.label = label;

				return true;

			}


			return false;

		}

	};


	return Class;

});
lychee.define("game.state.Menu").requires([
	"game.entity.lycheeJS",
	"lychee.ui.Layer",
	"lychee.ui.Label"
]).includes([
	"lychee.game.State"
]).exports(function (lychee, game, global, attachments) {

	var _blob  = attachments["json"];
	var _fonts = {
		headline: attachments["headline.fnt"],
		normal:   attachments["normal.fnt"]
	};


	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.deserialize(_blob);
		this.reshape();

	};


	Class.prototype = {

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);


			var root   = this.queryLayer('ui', 'root');
			var entity = null;


			this.queryLayer('ui', 'root > welcome > title').setLabel(this.game.settings.title);

			this.queryLayer('ui', 'root > welcome > newgame').bind('touch', function() {
				this.game.changeState('game');
			}, this);


			this.queryLayer('ui', 'root > welcome > settings').bind('touch', function() {
				this.setPosition({ x: -1/4 * this.width });
			}, root);

			this.queryLayer('ui', 'root > settings > title').bind('touch', function() {
				this.setPosition({ x: 1/4 * this.width });
			}, root);


			entity = this.queryLayer('ui', 'root > settings > fullscreen');
			entity.setLabel('Fullscreen: ' + ((this.game.viewport.fullscreen === true) ? 'On': 'Off'));
			entity.bind('#touch', function(entity) {

				var viewport   = this.game.viewport;
				var fullscreen = !viewport.fullscreen;

				entity.setLabel('Fullscreen: ' + ((fullscreen === true) ? 'On': 'Off'));
				viewport.setFullscreen(fullscreen);

			}, this);

			entity = this.queryLayer('ui', 'root > settings > music');
			entity.setLabel('Music: ' + ((this.game.jukebox.music === true) ? 'On': 'Off'));
			entity.bind('#touch', function(entity) {

				var jukebox = this.game.jukebox;
				var music   = !jukebox.music;

				entity.setLabel('Music: ' + ((music === true) ? 'On': 'Off'));
				jukebox.setMusic(music);

			}, this);

			entity = this.queryLayer('ui', 'root > settings > sound');
			entity.setLabel('Sound: ' + ((this.game.jukebox.sound === true) ? 'On': 'Off'));
			entity.bind('#touch', function(entity) {

				var jukebox = this.game.jukebox;
				var sound   = !jukebox.sound;

				entity.setLabel('Sound: ' + ((sound === true) ? 'On': 'Off'));
				jukebox.setSound(sound);

			}, this);

			entity = this.queryLayer('ui', 'root > settings > debug');
			entity.setLabel('Debug: ' + ((lychee.debug === true) ? 'On': 'Off'));
			entity.bind('#touch', function(entity) {

				var debug = !lychee.debug;

				entity.setLabel('Debug: ' + ((debug === true) ? 'On': 'Off'));
				lychee.debug = debug;

			}, this);

		},

		reshape: function(orientation, rotation) {

			var renderer = this.renderer;
			if (renderer !== null) {

				var entity = null;
				var width  = renderer.width;
				var height = renderer.height;


				var root = this.queryLayer('ui', 'root');

				root.width  = width * 2;
				root.height = height;


				entity = this.queryLayer('background', 'lycheeJS');
				entity.position.y = 1/2 * height - 32;


				entity = this.queryLayer('ui', 'root > welcome');
				entity.width      = width;
				entity.height     = height;
				entity.position.x = -1/2 * width;


				entity = this.queryLayer('ui', 'root > welcome > title');
				entity.position.y = -1/2 * height + 64;


				entity = this.queryLayer('ui', 'root > settings');
				entity.width      = width;
				entity.height     = height;
				entity.position.x = 1/2 * width;


				entity = this.queryLayer('ui', 'root > settings > title');
				entity.position.y = -1/2 * height + 64;


				this.getLayer('ui').reshape();
				root.setPosition({ x: 1/2 * width });

			}


			lychee.game.State.prototype.reshape.call(this, orientation, rotation);

		},

		enter: function(data) {

			lychee.game.State.prototype.enter.call(this);


			var renderer = this.renderer;
			if (renderer !== null) {

				var width = renderer.width;
				var root  = this.queryLayer('ui', 'root');
				if (root !== null) {
					root.setPosition({ x: 1/2 * width });
				}

			}

		}

	};


	return Class;

});
lychee.define("game.DeviceSpecificHacks").exports(function (lychee, game, global, attachments) {

	var Callback = function() {

		var settings = this.settings;

		if (typeof global.navigator !== 'undefined') {

			if (global.navigator.userAgent.match(/iPad/)) {

				settings.viewport.fullscreen = true;
				settings.jukebox.music = false;
				settings.jukebox.sound = true;

			} else if (global.navigator.userAgent.match(/Android/)) {

				settings.viewport.fullscreen = true;

			}

		}

	};

	return Callback;

});
lychee.define("lychee.Input").tags({
	"platform": "html"
}).supports(function (lychee, global) {

	if (typeof global.addEventListener === 'function') {
		return true;
	}


	return false;

}).includes([
	"lychee.event.Emitter"
]).exports(function (lychee, global) {

	/*
	 * EVENTS
	 */

	var _instances = [];

	var _mouseactive = false;
	var _listeners = {

		keydown: function(event) {

			var handled = false;

			for (var i = 0, l = _instances.length; i < l; i++) {
				handled = _process_key.call(_instances[i], event.keyCode, event.ctrlKey, event.altKey, event.shiftKey) || handled;
			}


			if (handled === true) {
				event.preventDefault();
				event.stopPropagation();
			}

		},

		touchstart: function(event) {

			var handled = false;

			for (var i = 0, l = _instances.length; i < l; i++) {

				if (event.touches && event.touches.length) {

					for (var t = 0, tl = event.touches.length; t < tl; t++) {
						handled = _process_touch.call(_instances[i], t, event.touches[t].pageX, event.touches[t].pageY) || handled;
					}

				} else {
					handled = _process_touch.call(_instances[i], 0, event.pageX, event.pageY) || handled;
				}

			}


			// Prevent scrolling and swiping behaviour
			if (handled === true) {
				event.preventDefault();
				event.stopPropagation();
			}

		},

		touchmove: function(event) {

			for (var i = 0, l = _instances.length; i < l; i++) {

				if (event.touches && event.touches.length) {

					for (var t = 0, tl = event.touches.length; t < tl; t++) {
						_process_swipe.call(_instances[i], t, 'move', event.touches[t].pageX, event.touches[t].pageY);
					}

				} else {
					_process_swipe.call(_instances[i], 0, 'move', event.pageX, event.pageY);
				}

			}

		},

		touchend: function(event) {

			for (var i = 0, l = _instances.length; i < l; i++) {

				if (event.touches && event.touches.length) {

					for (var t = 0, tl = event.touches.length; t < tl; t++) {
						_process_swipe.call(_instances[i], t, 'end', event.touches[t].pageX, event.touches[t].pageY);
					}

				} else {
					_process_swipe.call(_instances[i], 0, 'end', event.pageX, event.pageY);
				}

			}

		},

		mousestart: function(event) {

			_mouseactive = true;


			var handled = false;

			for (var i = 0, l = _instances.length; i < l; i++) {
				handled = _process_touch.call(_instances[i], 0, event.pageX, event.pageY) || handled;
			}


			// Prevent drag of canvas as image
			if (handled === true) {
				event.preventDefault();
				event.stopPropagation();
			}

		},

		mousemove: function(event) {

			if (_mouseactive === false) return;


			var handled = false;

			for (var i = 0, l = _instances.length; i < l; i++) {
				handled = _process_swipe.call(_instances[i], 0, 'move', event.pageX, event.pageY) || handled;
			}


			// Prevent selection of canvas as content
			if (handled === true) {
				event.preventDefault();
				event.stopPropagation();
			}

		},

		mouseend: function(event) {

			if (_mouseactive === false) return;

			_mouseactive = false;

			for (var i = 0, l = _instances.length; i < l; i++) {
				_process_swipe.call(_instances[i], 0, 'end', event.pageX, event.pageY);
			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		var keyboard = 'onkeydown' in global;
		if (keyboard === true) {
			global.addEventListener('keydown', _listeners.keydown, true);
		}

		var touch = 'ontouchstart' in global;
		var mouse = 'onmousedown' in global;
		if (touch === true) {
			global.addEventListener('touchstart', _listeners.touchstart, true);
			global.addEventListener('touchmove',  _listeners.touchmove,  true);
			global.addEventListener('touchend',   _listeners.touchend,   true);
		} else if (mouse === true) {
			global.addEventListener('mousedown',  _listeners.mousestart, true);
			global.addEventListener('mousemove',  _listeners.mousemove,  true);
			global.addEventListener('mouseup',    _listeners.mouseend,   true);
			global.addEventListener('mouseout',   _listeners.mouseend,   true);
		}


		if (lychee.debug === true) {

			var methods = [];
			if (keyboard) methods.push('Keyboard');
			if (touch)    methods.push('Touch');
			if (mouse)    methods.push('Mouse');

			if (methods.length === 0) methods.push("NONE");

			console.log('lychee.Input: Supported methods are ' + methods.join(', '));

		}

	})();



	/*
	 * HELPERS
	 */

	var _process_key = function(code, ctrl, alt, shift) {

		if (this.key === false) return false;


		// 1. Validate key event
		if (
			   Class.KEYMAP[code] === undefined
			&& Class.SPECIALMAP[code] === undefined
		) {
			return false;
		}


		ctrl  =  ctrl === true;
		alt   =   alt === true;
		shift = shift === true;


		// 2. Only fire after the enforced delay
		var delta = Date.now() - this.__clock.key;
		if (delta < this.delay) {
			return true;
		}


		// 3. Check for current key being a modifier
		if (
			   this.keymodifier === false
			&& (code === 16   || code === 17   ||  code === 18)
			&& (ctrl === true ||  alt === true || shift === true)
		) {
			return true;
		}


		var key  = null;
		var name = null;

		// 3a. Check for special characters (that can be shifted)
		if (Class.SPECIALMAP[code] !== undefined) {

			var tmp = Class.SPECIALMAP[code];

			key  = shift === true ? tmp[1] : tmp[0];
			name = '';

			if (ctrl  === true) name += 'ctrl-';
			if (alt   === true) name += 'alt-';
			if (shift === true) name += 'shift-';

			name += tmp[0];


		// 3b. Check for normal characters
		} else if (Class.KEYMAP[code] !== undefined) {

			key  = Class.KEYMAP[code];
			name = '';

			if (ctrl  === true && key !== 'ctrl')  name += 'ctrl-';
			if (alt   === true && key !== 'alt')   name += 'alt-';
			if (shift === true && key !== 'shift') name += 'shift-';

			if (
				   shift === true
				&& key !== 'ctrl'
				&& key !== 'alt'
				&& key !== 'shift'
			) {

				var tmp = String.fromCharCode(code);
				if (tmp !== '') {
					key = tmp;
				}

			}

			name += key.toLowerCase();

		}


		var handled = false;

		if (key !== null) {

			// bind('key') and bind('ctrl-a');
			// bind('!')   and bind('shift-1');

			handled = this.trigger('key', [ key, name, delta ]) || handled;
			handled = this.trigger(name,  [ delta ])            || handled;

		}


		this.__clock.key = Date.now();


		return handled;

	};

	var _process_touch = function(id, x, y) {

		if (
			   this.touch === false
			&& this.swipe === true
		) {

			if (this.__swipes[id] === null) {
				_process_swipe.call(this, id, 'start', x, y);
			}

			return true;

		} else if (this.touch === false) {

			return false;

		}


		// 1. Only fire after the enforced delay
		var delta = Date.now() - this.__clock.touch;
		if (delta < this.delay) {
			return true;
		}


		var handled = false;

		handled = this.trigger('touch', [ id, { x: x, y: y }, delta ]) || handled;


		this.__clock.touch = Date.now();


		// 2. Fire Swipe Start, but only for tracked touches
		if (this.__swipes[id] === null) {
			handled = _process_swipe.call(this, id, 'start', x, y) || handled;
		}


		return handled;

	};

	var _process_swipe = function(id, state, x, y) {

		if (this.swipe === false) return false;


		// 1. Only fire after the enforced delay
		var delta = Date.now() - this.__clock.swipe;
		if (delta < this.delay) {
			return true;
		}


		var position = { x: x, y: y };
		var swipe    = { x: 0, y: 0 };

		if (this.__swipes[id] !== null) {

			// FIX for touchend events
			if (state === 'end' && x === 0 && y === 0) {
				position.x = this.__swipes[id].x;
				position.y = this.__swipes[id].y;
			}

			swipe.x = x - this.__swipes[id].x;
			swipe.y = y - this.__swipes[id].y;

		}


		var handled = false;


		if (state === 'start') {

			handled = this.trigger(
				'swipe',
				[ id, 'start', position, delta, swipe ]
			) || handled;

			this.__swipes[id] = {
				x: x, y: y
			};

		} else if (state === 'move') {

			handled = this.trigger(
				'swipe',
				[ id, 'move', position, delta, swipe ]
			) || handled;

		} else if (state === 'end') {

			handled = this.trigger(
				'swipe',
				[ id, 'end', position, delta, swipe ]
			) || handled;

			this.__swipes[id] = null;

		}


		this.__clock.swipe = Date.now();


		return handled;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.delay       = 0;
		this.key         = false;
		this.keymodifier = false;
		this.touch       = false;
		this.swipe       = false;

		this.__clock  = {
			key:   Date.now(),
			touch: Date.now(),
			swipe: Date.now()
		};
		this.__swipes = {
			0: null, 1: null,
			2: null, 3: null,
			4: null, 5: null,
			6: null, 7: null,
			8: null, 9: null
		};


		this.setDelay(settings.delay);
		this.setKey(settings.key);
		this.setKeyModifier(settings.keymodifier);
		this.setTouch(settings.touch);
		this.setSwipe(settings.swipe);


		lychee.event.Emitter.call(this);

		_instances.push(this);

		settings = null;

	};


	Class.KEYMAP = {

		 8:  'backspace',
		 9:  'tab',
		13:  'enter',
		16:  'shift',
		17:  'ctrl',
		18:  'alt',
		19:  'pause',
//		20:  'capslock',

		27:  'escape',
		32:  'space',
		33:  'page-up',
		34:  'page-down',
		35:  'end',
		36:  'home',

		37:  'arrow-left',
		38:  'arrow-up',
		39:  'arrow-right',
		40:  'arrow-down',

		45:  'insert',
		46:  'delete',

		65:  'a',
		66:  'b',
		67:  'c',
		68:  'd',
		69:  'e',
		70:  'f',
		71:  'g',
		72:  'h',
		73:  'i',
		74:  'j',
		75:  'k',
		76:  'l',
		77:  'm',
		78:  'n',
		79:  'o',
		80:  'p',
		81:  'q',
		82:  'r',
		83:  's',
		84:  't',
		85:  'u',
		86:  'v',
		87:  'w',
		88:  'x',
		89:  'y',
		90:  'z',

		96:  '0',
		97:  '1',
		98:  '2',
		99:  '3',
		100: '4',
		101: '5',
		102: '6',
		103: '7',
		104: '8',
		105: '9',
		106: '*',
		107: '+',
		109: '-',
		110: '.',
		111: '/',

		112: 'f1',
		113: 'f2',
		114: 'f3',
		115: 'f4',
		116: 'f5',
		117: 'f6',
		118: 'f7',
		119: 'f8',
		120: 'f9',
		121: 'f10',
		122: 'f11',
		123: 'f12',

//		144: 'numlock',
		145: 'scroll'

	};

	Class.SPECIALMAP = {

		48:  [ '0', ')' ],
		49:  [ '1', '!' ],
		50:  [ '2', '@' ],
		51:  [ '3', '#' ],
		52:  [ '4', '$' ],
		53:  [ '5', '%' ],
		54:  [ '6', '^' ],
		55:  [ '7', '&' ],
		56:  [ '8', '*' ],
		57:  [ '9', '(' ],

		186: [ ';', ':' ],
		187: [ '=', '+' ],
		188: [ ',', '<' ],
		189: [ '-', '_' ],
		190: [ '.', '>' ],
		191: [ '/', '?' ],
		192: [ '`', '~' ],

		219: [ '[',  '{' ],
		220: [ '\\', '|' ],
		221: [ ']',  '}' ],
		222: [ '\'', '"' ]

	};


	Class.prototype = {

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



		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var settings = {};

			if (this.delay !== 0)           settings.delay       = this.delay;
			if (this.key !== false)         settings.key         = this.key;
			if (this.keymodifier !== false) settings.keymodifier = this.keymodifier;
			if (this.touch !== false)       settings.touch       = this.touch;
			if (this.swipe !== false)       settings.swipe       = this.swipe;


			return {
				'constructor': 'lychee.Input',
				'arguments':   [ settings ],
				'blob':        null
			};

		},



		/*
		 * CUSTOM API
		 */

		setDelay: function(delay) {

			delay = typeof delay === 'number' ? delay : null;


			if (delay !== null) {

				this.delay = delay;

				return true;

			}


			return false;

		},

		setKey: function(key) {

			if (key === true || key === false) {

				this.key = key;

				return true;

			}


			return false;

		},

		setKeyModifier: function(keymodifier) {

			if (keymodifier === true || keymodifier === false) {

				this.keymodifier = keymodifier;

				return true;

			}


			return false

		},

		setTouch: function(touch) {

			if (touch === true || touch === false) {

				this.touch = touch;

				return true;

			}


			return false;

		},

		setSwipe: function(swipe) {

			if (swipe === true || swipe === false) {

				this.swipe = swipe;

				return true;

			}


			return false;

		}

	};


	return Class;

});
lychee.define("lychee.Renderer").tags({
	"platform": "html"
}).supports(function (lychee, global) {

	/*
	 * Hint for check against undefined:
	 *
	 * typeof CanvasRenderingContext2D is:
	 * > function in Chrome, Firefox, IE10
	 * > object in Safari, Safari Mobile
	 *
	 */


	if (
		   typeof global.document !== 'undefined'
		&& typeof global.document.createElement === 'function'
		&& typeof global.CanvasRenderingContext2D !== 'undefined'
	) {

		var canvas = global.document.createElement('canvas');
		if (typeof canvas.getContext === 'function') {
			return true;
		}

	}


	return false;

}).exports(function (lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _color_cache = {};

	var _is_color = function(color) {

		if (typeof color === 'string') {

			if (
				   color.match(/(#[AaBbCcDdEeFf0-9]{6})/)
				|| color.match(/(#[AaBbCcDdEeFf0-9]{8})/)
			) {

				return true;

			}

		}


		return false;

	};

	var _hex_to_rgba = function(hex) {

		if (_color_cache[hex] !== undefined) {
			return _color_cache[hex];
		}

		var rgba = [ 0, 0, 0, 255 ];

		if (typeof hex === 'string') {

			if (hex.length === 7) {

				rgba[0] = parseInt(hex[1] + hex[2], 16);
				rgba[1] = parseInt(hex[3] + hex[4], 16);
				rgba[2] = parseInt(hex[5] + hex[6], 16);
				rgba[3] = 255;

			} else if (hex.length === 9) {

 				rgba[0] = parseInt(hex[1] + hex[2], 16);
				rgba[1] = parseInt(hex[3] + hex[4], 16);
				rgba[2] = parseInt(hex[5] + hex[6], 16);
				rgba[3] = parseInt(hex[7] + hex[8], 16);

			}

		}


		var color = 'rgba(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ',' + (rgba[3] / 255) + ')';

		_color_cache[hex] = color;


		return color;

	};



	/*
	 * STRUCTS
	 */

	var _buffer = function(width, height) {

		this.width  = typeof width === 'number'  ? width  : 1;
		this.height = typeof height === 'number' ? height : 1;

		this.__buffer = global.document.createElement('canvas');
		this.__ctx    = this.__buffer.getContext('2d');

		this.__buffer.width  = this.width;
		this.__buffer.height = this.height;

	};

	_buffer.prototype = {

		clear: function() {

			this.__ctx.clearRect(0, 0, this.width, this.height);

		},

		resize: function(width, height) {

			this.__buffer.width  = this.width;
			this.__buffer.height = this.height;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var _id = 0;


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.alpha      = 1.0;
		this.background = '#000000';
		this.id         = 'lychee-Renderer-' + _id++;
		this.width      = null;
		this.height     = null;
		this.offset     = { x: 0, y: 0 };

		this.__canvas           = global.document.createElement('canvas');
		this.__canvas.className = 'lychee-Renderer-canvas';
		this.__ctx              = this.__canvas.getContext('2d');
		global.document.body.appendChild(this.__canvas);


		this.setAlpha(settings.alpha);
		this.setBackground(settings.background);
		this.setId(settings.id);
		this.setWidth(settings.width);
		this.setHeight(settings.height);


		settings = null;

	};



	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var settings = {};


			if (this.alpha !== 1.0)                           settings.alpha      = this.alpha;
			if (this.background !== '#000000')                settings.background = this.background;
			if (this.id.substr(0, 16) !== 'lychee-Renderer-') settings.id         = this.id;
			if (this.width !== null)                          settings.width      = this.width;
			if (this.height !== null)                         settings.height     = this.height;


			return {
				'constructor': 'lychee.Renderer',
				'arguments':   [ settings ],
				'blob':        null
			};

		},



		/*
		 * SETTERS AND GETTERS
		 */

		setAlpha: function(alpha) {

			alpha = typeof alpha === 'number' ? alpha : null;


			if (
				   alpha !== null
				&& alpha >= 0
				&& alpha <= 1
			) {
				this.alpha = alpha;
			}

		},

		setBackground: function(color) {

			color = _is_color(color) === true ? color : null;


			if (color !== null) {
				this.background = color;
				this.__canvas.style.backgroundColor = color;
			}

		},

		setId: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {
				this.id = id;
				this.__canvas.id = id;
			}

		},

		setWidth: function(width) {

			width = typeof width === 'number' ? width : null;


			if (width !== null) {
				this.width = width;
			} else {
				this.width = global.innerWidth;
			}


			this.__canvas.width       = this.width;
			this.__canvas.style.width = this.width + 'px';
			this.offset.x             = this.__canvas.offsetLeft;

		},

		setHeight: function(height) {

			height = typeof height === 'number' ? height : null;


			if (height !== null) {
				this.height = height;
			} else {
				this.height = global.innerHeight;
			}


			this.__canvas.height       = this.height;
			this.__canvas.style.height = this.height + 'px';
			this.offset.y              = this.__canvas.offsetTop;

		},



		/*
		 * BUFFER INTEGRATION
		 */

		clear: function(buffer) {

			buffer = buffer instanceof _buffer ? buffer : null;


			if (buffer !== null) {

				buffer.clear();

			} else {

				var ctx = this.__ctx;

				ctx.fillStyle = this.background;
				ctx.fillRect(0, 0, this.width, this.height);

			}

		},

		flush: function() {

		},

		createBuffer: function(width, height) {
			return new _buffer(width, height);
		},

		setBuffer: function(buffer) {

			buffer = buffer instanceof _buffer ? buffer : null;


			if (buffer !== null) {
				this.__ctx = buffer.__ctx;
			} else {
				this.__ctx = this.__canvas.getContext('2d');
			}

		},



		/*
		 * DRAWING API
		 */

		drawArc: function(x, y, start, end, radius, color, background, lineWidth) {

			color      = _is_color(color) === true ? color : '#000000';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


			var ctx = this.__ctx;
			var pi2 = Math.PI * 2;


			ctx.globalAlpha = this.alpha;
			ctx.beginPath();

			ctx.arc(
				x,
				y,
				radius,
				start * pi2,
				end * pi2
			);

			if (background === false) {
				ctx.lineWidth   = lineWidth;
				ctx.strokeStyle = color;
				ctx.stroke();
			} else {
				ctx.fillStyle   = color;
				ctx.fill();
			}

			ctx.closePath();

		},

		drawBox: function(x1, y1, x2, y2, color, background, lineWidth) {

			color      = _is_color(color) === true ? color : '#000000';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


			var ctx = this.__ctx;


			ctx.globalAlpha = this.alpha;

			if (background === false) {
				ctx.lineWidth   = lineWidth;
				ctx.strokeStyle = color;
				ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
			} else {
				ctx.fillStyle   = color;
				ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
			}

		},

		drawBuffer: function(x1, y1, buffer) {

			buffer = buffer instanceof _buffer ? buffer : null;


			if (buffer !== null) {

				var ctx = this.__ctx;


				ctx.globalAlpha = this.alpha;
				ctx.drawImage(buffer.__buffer, x1, y1);


				if (lychee.debug === true) {

					this.drawBox(
						x1,
						y1,
						x1 + buffer.width,
						y1 + buffer.height,
						'#00ff00',
						false,
						1
					);

				}

			}

		},

		drawCircle: function(x, y, radius, color, background, lineWidth) {

			color      = _is_color(color) === true ? color : '#000000';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


			var ctx = this.__ctx;


			ctx.globalAlpha = this.alpha;
			ctx.beginPath();

			ctx.arc(
				x,
				y,
				radius,
				0,
				Math.PI * 2
			);


			if (background === false) {
				ctx.lineWidth   = lineWidth;
				ctx.strokeStyle = color;
				ctx.stroke();
			} else {
				ctx.fillStyle   = color;
				ctx.fill();
			}

			ctx.closePath();

		},

		drawLight: function(x, y, radius, color, background, lineWidth) {

			color      = _is_color(color) ? _hex_to_rgba(color) : 'rgba(255,255,255,1.0)';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


			var ctx = this.__ctx;


			var gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

			gradient.addColorStop(0, color);
			gradient.addColorStop(1, 'rgba(0,0,0,0)');


			ctx.globalAlpha = this.alpha;
			ctx.beginPath();

			ctx.arc(
				x,
				y,
				radius,
				0,
				Math.PI * 2
			);


			if (background === false) {
				ctx.lineWidth   = lineWidth;
				ctx.strokeStyle = gradient;
				ctx.stroke();
			} else {
				ctx.fillStyle   = gradient;
				ctx.fill();
			}

			ctx.closePath();

		},

		drawLine: function(x1, y1, x2, y2, color, lineWidth) {

			color     = _is_color(color) === true ? color : '#000000';
			lineWidth = typeof lineWidth === 'number' ? lineWidth : 1;


			var ctx = this.__ctx;


			ctx.globalAlpha = this.alpha;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);

			ctx.lineWidth   = lineWidth;
			ctx.strokeStyle = color;
			ctx.stroke();

			ctx.closePath();

		},

		drawTriangle: function(x1, y1, x2, y2, x3, y3, color, background, lineWidth) {

			color      = _is_color(color) === true ? color : '#000000';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


			var ctx = this.__ctx;


			ctx.globalAlpha = this.alpha;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.lineTo(x3, y3);
			ctx.lineTo(x1, y1);

			if (background === false) {
				ctx.lineWidth   = lineWidth;
				ctx.strokeStyle = color;
				ctx.stroke();
			} else {
				ctx.fillStyle   = color;
				ctx.fill();
			}

			ctx.closePath();

		},

		// points, x1, y1, [ ... x(a), y(a) ... ], [ color, background, lineWidth ]
		drawPolygon: function(points, x1, y1) {

			var l = arguments.length;

			if (points > 3) {

				var optargs = l - (points * 2) - 1;


				var color, background, lineWidth;

				if (optargs === 3) {

					color      = arguments[l - 3];
					background = arguments[l - 2];
					lineWidth  = arguments[l - 1];

				} else if (optargs === 2) {

					color      = arguments[l - 2];
					background = arguments[l - 1];

				} else if (optargs === 1) {

					color      = arguments[l - 1];

				}


				color      = _is_color(color) === true ? color : '#000000';
				background = background === true;
				lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


				var ctx = this.__ctx;


				ctx.globalAlpha = this.alpha;
				ctx.beginPath();
				ctx.moveTo(x1, y1);

				for (var p = 1; p < points; p++) {

					ctx.lineTo(
						arguments[1 + p * 2],
						arguments[1 + p * 2 + 1]
					);

				}

				ctx.lineTo(x1, y1);

				if (background === false) {
					ctx.lineWidth   = lineWidth;
					ctx.strokeStyle = color;
					ctx.stroke();
				} else {
					ctx.fillStyle   = color;
					ctx.fill();
				}

				ctx.closePath();

			}

		},

		drawSprite: function(x1, y1, texture, map) {

			texture = texture instanceof Texture ? texture : null;
			map     = map instanceof Object      ? map     : null;


			if (texture !== null) {

				var ctx = this.__ctx;


				ctx.globalAlpha = this.alpha;

				if (map === null) {

					ctx.drawImage(
						texture.buffer,
						x1,
						y1
					);

				} else {

					if (lychee.debug === true) {

						this.drawBox(
							x1,
							y1,
							x1 + map.w,
							y1 + map.h,
							'#ff0000',
							false,
							1
						);

					}

					ctx.drawImage(
						texture.buffer,
						map.x,
						map.y,
						map.w,
						map.h,
						x1,
						y1,
						map.w,
						map.h
					);

				}

			}

		},

		drawText: function(x1, y1, text, font, center) {

			font   = font instanceof Font ? font : null;
			center = center === true;


			if (font !== null) {

				if (center === true) {

					var dim = font.measure(text);

					x1 -= dim.realwidth / 2;
					y1 -= (dim.realheight - font.baseline) / 2;

				}


				y1 -= font.baseline / 2;


				var margin  = 0;
				var texture = font.texture;
				if (texture !== null) {

					var ctx = this.__ctx;


					ctx.globalAlpha = this.alpha;

					for (t = 0, l = text.length; t < l; t++) {

						var chr = font.measure(text[t]);

						if (lychee.debug === true) {

							this.drawBox(
								x1 + margin,
								y1,
								x1 + margin + chr.realwidth,
								y1 + chr.height,
								'#00ff00',
								false,
								1
							);

						}

						ctx.drawImage(
							texture.buffer,
							chr.x,
							chr.y,
							chr.width,
							chr.height,
							x1 + margin - font.spacing,
							y1,
							chr.width,
							chr.height
						);

						margin += chr.realwidth + font.kerning;

					}

				}

			}

		},



		/*
		 * RENDERING API
		 */

		renderEntity: function(entity, offsetX, offsetY) {

			if (typeof entity.render === 'function') {

				entity.render(
					this,
					offsetX || 0,
					offsetY || 0
				);

			}

		}

	};


	return Class;

});
lychee.define("lychee.Viewport").tags({
	"platform": "html"
}).supports(function (lychee, global) {

	if (
		   typeof global.addEventListener === 'function'
		&& typeof global.innerWidth === 'number'
		&& typeof global.innerHeight === 'number'
		&& typeof global.document !== 'undefined'
		&& typeof global.document.getElementsByClassName === 'function'
	) {
		return true;
	}


	return false;

}).includes([
	"lychee.event.Emitter"
]).exports(function (lychee, global) {

	/*
	 * EVENTS
	 */

	var _clock = {
		orientationchange: null,
		resize:            0
	};

	var _focusactive   = true;
	var _reshapeactive = false;
	var _reshapewidth  = global.innerWidth;
	var _reshapeheight = global.innerHeight;

	var _reshape_viewport = function() {

		if (
			_reshapeactive === true
			|| (
				   _reshapewidth === global.innerWidth
				&& _reshapeheight === global.innerHeight
			)
		) {
			 return false;
		}


		_reshapeactive = true;



		/*
		 * ISSUE in Mobile WebKit:
		 *
		 * An issue occurs if width of viewport is higher than
		 * the width of the viewport of future rotation state.
		 *
		 * This bugfix prevents the viewport to scale higher
		 * than 1.0, even if the meta tag is correctly setup.
		 */

		var elements = global.document.getElementsByClassName('lychee-Renderer-canvas');
		for (var e = 0, el = elements.length; e < el; e++) {

			var element = elements[e];

			element.style.width  = '1px';
			element.style.height = '1px';

		}



		/*
		 * ISSUE in Mobile Firefox and Mobile WebKit
		 *
		 * The reflow is too slow for an update, so we have
		 * to lock the heuristic to only be executed once,
		 * waiting for a second to let the reflow finish.
		 */

		setTimeout(function() {

			for (var i = 0, l = _instances.length; i < l; i++) {
				_process_reshape.call(_instances[i], global.innerWidth, global.innerHeight);
			}

			_reshapewidth  = global.innerWidth;
			_reshapeheight = global.innerHeight;
			_reshapeactive = false;

		}, 1000);

	};


	var _instances = [];
	var _listeners = {

		orientationchange: function() {

			for (var i = 0, l = _instances.length; i < l; i++) {
				_process_orientation.call(_instances[i], global.orientation);
			}

			_clock.orientationchange = Date.now();
			_reshape_viewport();

		},

		resize: function() {

			if (
				_clock.orientationchange === null
				|| (
					   _clock.orientationchange !== null
					&& _clock.orientationchange > _clock.resize
				)
			) {

				_clock.resize = Date.now();
				_reshape_viewport();

			}

		},

		focus: function() {

			if (_focusactive === false) {

				for (var i = 0, l = _instances.length; i < l; i++) {
					_instances[i].trigger('show', []);
				}

				_focusactive = true;

			}

		},

		blur: function() {

			if (_focusactive === true) {

				for (var i = 0, l = _instances.length; i < l; i++) {
					_instances[i].trigger('hide', []);
				}

				_focusactive = false;

			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	var _enterFullscreen = null;
	var _leaveFullscreen = null;

	(function() {

		var methods = [];

		if (typeof global.onorientationchange !== 'undefined') {
			methods.push('Orientation');
			global.addEventListener('orientationchange', _listeners.orientationchange, true);
		}

		if (typeof global.onfocus !== 'undefined') {
			methods.push('Focus');
			global.addEventListener('focus', _listeners.focus, true);
		}

		if (typeof global.onblur !== 'undefined') {
			methods.push('Blur');
			global.addEventListener('blur', _listeners.blur, true);
		}


		global.addEventListener('resize', _listeners.resize, true);


		if (global.document && global.document.documentElement) {

			var element = global.document.documentElement;

			if (
				   typeof element.requestFullscreen === 'function'
				&& typeof element.exitFullscreen === 'function'
			) {

				_enterFullscreen = function() {
					element.requestFullscreen();
				};

				_leaveFullscreen = function() {
					element.exitFullscreen();
				};

			}


			if (_enterFullscreen === null || _leaveFullscreen === null) {

				var prefixes = [ 'moz', 'ms', 'webkit' ];

				for (var p = 0, pl = prefixes.length; p < pl; p++) {

					if (
						   typeof element[prefixes[p] + 'RequestFullScreen'] === 'function'
						&& typeof document[prefixes[p] + 'CancelFullScreen'] === 'function'
					) {

						(function(document, element, prefix) {

							_enterFullscreen = function() {
								element[prefix + 'RequestFullScreen']();
							};

							_leaveFullscreen = function() {
								document[prefix + 'CancelFullScreen']();
							};

						})(global.document, element, prefixes[p]);

						break;

					}

				}

			}

		}


		if (_enterFullscreen !== null && _leaveFullscreen !== null) {
			methods.push('Fullscreen');
		}


		if (lychee.debug === true) {
			console.log('lychee.Viewport: Supported methods are ' + methods.join(', '));
		}

	})();



	/*
	 * HELPERS
	 */

	var _process_orientation = function(orientation) {

		orientation = typeof orientation === 'number' ? orientation : null;

		if (orientation !== null) {
			this.__orientation = orientation;
		}

	};

	var _process_reshape = function(width, height) {

		if (
			   width === this.width
			&& height === this.height
		) {
			return;
		}


		this.width  = width;
		this.height = height;



		/*
		 *    TOP
		 *  _______
		 * |       |
		 * |       |
		 * |       |
		 * |       |
		 * |       |
		 * [X][X][X]
		 *
		 *  BOTTOM
		 */

		if (this.__orientation === 0) {

			if (width > height) {
				this.trigger('reshape', [
					'landscape',
					'landscape'
				]);
			} else {
				this.trigger('reshape', [
					'portrait',
					'portrait'
				]);
			}



		/*
		 *  BOTTOM
		 *
		 * [X][X][X]
		 * |       |
		 * |       |
		 * |       |
		 * |       |
		 * |_______|
		 *
		 *    TOP
		 */

		} else if (this.__orientation === 180) {

			if (width > height) {
				this.trigger('reshape', [
					'landscape',
					'landscape'
				]);
			} else {
				this.trigger('reshape', [
					'portrait',
					'portrait'
				]);
			}



		/*
		 *    ____________    B
		 * T |            [x] O
		 * O |            [x] T
		 * P |____________[x] T
		 *                    O
		 *                    M
		 */

		} else if (this.__orientation === 90) {

			if (width > height) {
				this.trigger('reshape', [
					'portrait',
					'landscape'
				]);
			} else {
				this.trigger('reshape', [
					'landscape',
					'portrait'
				]);
			}



		/*
		 * B    ____________
		 * O [x]            | T
		 * T [x]            | O
		 * T [x]____________| P
		 * O
		 * M
		 */

		} else if (this.__orientation === -90) {

			if (width > height) {
				this.trigger('reshape', [
					'portrait',
					'landscape'
				]);
			} else {
				this.trigger('reshape', [
					'landscape',
					'portrait'
				]);
			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.fullscreen = false;
		this.width      = global.innerWidth;
		this.height     = global.innerHeight;

		this.__orientation = typeof global.orientation === 'number' ? global.orientation : 0;


		lychee.event.Emitter.call(this);

		_instances.push(this);


		this.setFullscreen(settings.fullscreen);

		settings = null;

	};


	Class.prototype = {

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



		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var settings = {};


			if (this.fullscreen !== false) settings.fullscreen = this.fullscreen;


			return {
				'constructor': 'lychee.Viewport',
				'arguments':   [ settings ],
				'blob':        null
			};

		},



		/*
		 * CUSTOM API
		 */

		setFullscreen: function(fullscreen) {

			if (
				   fullscreen === true
				&& this.fullscreen === false
				&& _enterFullscreen !== null
			) {

				_enterFullscreen();
				this.fullscreen = true;

				return true;

			} else if (
				   fullscreen === false
				&& this.fullscreen === true
				&& _leaveFullscreen !== null
			) {

				_leaveFullscreen();
				this.fullscreen = false;

				return true;

			}


			return false;

		}

	};


	return Class;

});
lychee.define("lychee.game.Jukebox").exports(function (lychee, global) {

	/*
	 * HELPERS
	 */

	var _refresh_channels = function(amount) {

		var sounds = [];

		for (var a = 0; a < amount; a++) {
			sounds.push(null);
		}

		this.__sounds = sounds;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.channels = 8;
		this.music    = true;
		this.sound    = true;

		this.__music  = null;
		this.__sounds = [
			null, null,
			null, null,
			null, null,
			null, null
		];


		this.setChannels(settings.channels);
		this.setMusic(settings.music);
		this.setSound(settings.sound);

		settings = null;

	};


	Class.prototype = {

		play: function(track) {

			if (
				   track instanceof Music
				&& this.music === true
			) {

				var music = this.__music;
				if (music !== null) {
					music.stop();
				}


				this.__music = track;
				this.__music.play();


				return true;

			} else if (
				   track instanceof Sound
				&& this.sound === true
			) {

				var sounds = this.__sounds;
				for (var s = 0, sl = sounds.length; s < sl; s++) {

					var sound = sounds[s];
					if (sound === null) {

						sounds[s] = track.clone();
						sounds[s].play();

						break;

					} else if (sound.isIdle === true) {

						if (sound.url === track.url) {
							sound.play();
						} else {
							sounds[s] = track.clone();
							sounds[s].play();
						}


						break;

					}

				}


				return true;

			}


			return false;

		},

		stop: function(track) {

			track = (track instanceof Music || track instanceof Sound) ? track : null;


			var found = false;


			if (track instanceof Music) {

				var music = this.__music;
				if (music === track) {
					found = true;
					music.stop();
				}


				this.__music = null;

			} else if (track instanceof Sound) {

				var sounds = this.__sounds;
				for (var s = 0, sl = sounds.length; s < sl; s++) {

					var sound = sounds[s];
					if (
						   sound !== null
						&& sound.url === track.url
						&& sound.isIdle === false
					) {
						found = true;
						sound.stop();
					}

				}

			} else if (track === null) {

				var music = this.__music;
				if (music !== null) {
					found = true;
					music.stop();
				}


				var sounds = this.__sounds;
				for (var s = 0, sl = sounds.length; s < sl; s++) {

					var sound = sounds[s];
					if (
						   sound !== null
						&& sound.isIdle === false
					) {
						found = true;
						sound.stop();
					}

				}

			}


			return found;

		},

		setChannels: function(channels) {

			channels = typeof channels === 'number' ? channels : null;


			if (channels !== null) {

				this.channels = channels;

				_refresh_channels.call(this, channels);

				return true;

			}


			return false;

		},

		setMusic: function(music) {

			if (music === true || music === false) {

				this.music = music;

				return true;

			}


			return false;

		},

		setSound: function(sound) {

			if (sound === true || sound === false) {

				this.sound = sound;

				return true;

			}


			return false;

		}

	};


	return Class;

});
lychee.define("lychee.game.Loop").supports(function (lychee, global) {

	if (typeof setInterval === 'function') {
		return true;
	}

	return false;

}).includes([
	"lychee.event.Emitter"
]).exports(function (lychee, global) {

    var _instances = [];
 	var _id        = 0;



	/*
	 * EVENTS
	 */

	var _listeners = {

		interval: function() {

			var now = Date.now();

			for (var i = 0, l = _instances.length; i < l; i++) {

				var instance = _instances[i];
				var clock    = now - instance.__start;

				_update_loop.call(instance, clock);
				_render_loop.call(instance, clock);

			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function(delta) {

		var interval = typeof global.setInterval === 'function';
		if (interval === true) {
			global.setInterval(_listeners.interval, delta);
		}


		if (lychee.debug === true) {

			var methods = [];
			if (interval) methods.push('setInterval');

			if (methods.length === 0) methods.push('NONE');

			console.log('lychee.game.Loop: Supported interval methods are ' + methods.join(', '));

		}

	})(1000 / 60);



	/*
	 * HELPERS
	 */

	var _update_loop = function(clock) {

		if (this.__state !== 1) return;


		var delta = clock - this.__updateclock;
		if (delta >= this.__updatedelay) {

			this.trigger('update', [ clock, delta ]);


			for (var iid in this.__intervals) {

				var interval = this.__intervals[iid];

				if (clock >= interval.clock) {

					interval.callback.call(
						interval.scope,
						clock,
						clock - interval.clock,
						interval.step++
					);

					interval.clock = clock + interval.delta;

				}

			}


			for (var tid in this.__timeouts) {

				var timeout = this.__timeouts[tid];
				if (clock >= timeout.clock) {

					timeout.callback.call(
						timeout.scope,
						clock,
						clock - timeout.clock
					);

					delete this.__timeouts[tid];

				}

			}


			this.__updateclock = clock;

		}

	};

	var _render_loop = function(clock) {

		if (this.__state !== 1) return;


		var delta = clock - this.__renderclock;
		if (delta >= this.__renderdelay) {

			this.trigger('render', [ clock, delta ]);


			this.__renderclock = clock;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.update = 40;
		this.render = 40;

		this.__timeouts  = {};
		this.__intervals = {};

		this.__pause       = 0;
		this.__state       = 1;
		this.__start       = Date.now();
		this.__renderclock = 0;
		this.__renderdelay = 1000 / this.update;
		this.__updateclock = 0;
		this.__updatedelay = 1000 / this.render;


		this.setUpdate(settings.update);
		this.setRender(settings.render);


		lychee.event.Emitter.call(this);

		_instances.push(this);

		settings = null;

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		start: function() {

			this.__state = 1;
			this.__start = Date.now();

		},

		stop: function() {

			this.__state = 0;

		},

		pause: function() {

			this.__state = 0;
			this.__pause = Date.now() - this.__start;

		},

		resume: function() {

			this.__state = 1;
			this.__start = Date.now() - this.__pause;
			this.__pause = 0;

		},

		setTimeout: function(delta, callback, scope) {

			delta    = typeof delta === 'number'    ? delta    : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : global;


			if (delta === null || callback === null) {
				return null;
			}


			var id = _id++;

			this.__timeouts[id] = {
				clock:    this.__updateclock + delta,
				callback: callback,
				scope:    scope
			};


			return id;

		},

		removeTimeout: function(id) {

			id = typeof id === 'number' ? id : null;


			if (
				   id !== null
				&& this.__timeouts[id] !== undefined
			) {

				delete this.__timeouts[id];

				return true;

			}


			return false;

		},

		setInterval: function(delta, callback, scope) {

			delta    = typeof delta === 'number'    ? delta    : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : global;


			if (delta === null || callback === null) {
				return null;
			}


			var id = _id++;

			this.__intervals[id] = {
				clock:    this.__updateclock + delta,
				delta:    delta,
				step:     1,
				callback: callback,
				scope:    scope
			};


			return id;

		},

		removeInterval: function(id) {

			id = typeof id === 'number' ? id : null;


			if (
				   id !== null
				&& this.__intervals[id] !== undefined
			) {

				delete this.__intervals[id];

				return true;

			}


			return false;

		},

		setUpdate: function(update) {

			update = typeof update === 'number' ? update : null;


			if (update !== null && update > 0) {

				this.update        = update;
				this.__updatedelay = 1000 / update;

				return true;

			} else if (update === 0) {

				this.update        = update;
				this.__updatedelay = Infinity;

				return true;

			}


			return false;

		},

		setRender: function(render) {

			render = typeof render === 'number' ? render : null;


			if (render !== null && render > 0) {

				this.render        = render;
				this.__renderdelay = 1000 / render;

				return true;

			} else if (render === 0) {

				this.render        = render;
				this.__renderdelay = Infinity;

				return true;

			}


			return false;

		}

	};


	return Class;

});
lychee.define("lychee.game.Main").requires([
	"lychee.Input",
	"lychee.Renderer",
	"lychee.Viewport",
	"lychee.game.Jukebox",
	"lychee.game.Loop",
	"lychee.game.State",
	"lychee.net.Client"
]).includes([
	"lychee.event.Emitter"
]).exports(function (lychee, global) {

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

			preloader.destroy();
			this.init();

		}, this);

		preloader.bind('error', function(assets, mappings) {

			preloader.destroy();
			this.init();

		}, this);

		preloader.load(url, null, 'json');

	};

	var _load_server = function(url) {
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
		server: null

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

			var data = this.settings.client;
			if (
				   data === null
				|| typeof data === 'string'
			) {
				_load_client.call(this, data);
			}


			var data = this.settings.server;
			if (
				   data === null
				|| typeof data === 'string'
			) {
				_load_server.call(this, data);
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
lychee.define("game.Main").requires([
	"game.net.Client",
	"game.state.Game",
	"game.state.Menu",
	"game.DeviceSpecificHacks"
]).includes([
	"lychee.game.Main"
]).exports(function (lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			title: 'Game Boilerplate',

			// Is configured by sorbet/module/Server
			client: null,

			input: {
				delay:       0,
				key:         false,
				keymodifier: false,
				touch:       true,
				swipe:       true
			},

			jukebox: {
				music: true,
				sound: true
			},

			renderer: {
				id:     'game',
				width:  null,
				height: null
			},

			viewport: {
				fullscreen: false
			}

		}, data);


		lychee.game.Main.call(this, settings);

		this.load();

	};


	Class.prototype = {

		load: function() {


			// 1. Initialize Client via Sorbet Gateway
			lychee.game.Main.prototype.load.call(this);



			/*
			 * 2. MANUAL preloading:
			 *
			 * Usually, every Entity has its required
			 * assets attached to it, so you don't need
			 * to preload. If you still want to, here's
			 * how...
			 *
			 */

			/*

			var urls = [
				'./asset/img/example.png'
			];


			this.preloader = new lychee.Preloader({
				timeout: 5000
			});

			this.preloader.bind('ready', function(assets, mappings) {

				console.log(urls[0], assets[urls[0]]);

				this.assets = assets;
				this.init();

			}, this);

			this.preloader.bind('error', function(assets, mappings) {

				if (lychee.debug === true) {
					console.warn('Preloader error for these assets: ', assets);
				}

			}, this);

			this.preloader.load(urls);

			*/

		},

		reshape: function(orientation, rotation) {

			game.DeviceSpecificHacks.call(this);

			lychee.game.Main.prototype.reshape.call(this, orientation, rotation);

		},

		init: function() {

			// Overwrite client with game.net.Client
			var clientsettings   = this.settings.client;
			this.settings.client = null;

			lychee.game.Main.prototype.init.call(this);

			this.reshape();


			if (clientsettings !== null) {
				this.client = new game.net.Client(clientsettings, this);
			}


			this.setState('game', new game.state.Game(this));
			this.setState('menu', new game.state.Menu(this));
			this.changeState('game');

		}

	};


	return Class;

});
