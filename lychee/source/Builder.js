
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

			var tree     = config.tree;
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


			if (this.mode === lychee.Builder.MODE.normal) {

				for (var o = 0, l = order.length; o < l; o++) {
					_export_definitionblock.call(this, this.__tree[order[o]]);
				}

			}


			this.duration = Date.now() - this.clock;
			if (lychee.debug === true) {
				console.log('COMPILE TIME: Finished in ' + this.duration + 'ms');
			}


			if (this.__callback !== null) {

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
		this.mode  = 0;

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
			timeout: Infinity
		});

		this.__preloader.bind('ready', _load_asset,   this);
		this.__preloader.bind('error', _unload_asset, this);

	};


	lychee.Builder.MODE = {
		normal:     0,
		simulation: 1
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

		},

		setMode: function(mode) {

			if (lychee.enumof(lychee.Builder.MODE, mode) === true) {

				this.mode = mode;

				return true;

			}


			return false;

		}

	};


	if (typeof Object.seal === 'function') {
		Object.seal(lychee.Builder.prototype);
	}


	lychee.build = function(callback, scope, environment, mode) {

		environment = environment instanceof Object                     ? environment : lychee.getEnvironment();
		mode        = lychee.enumof(lychee.Builder.MODE, mode) === true ? mode        : null;


		var builder = new lychee.Builder();

		if (mode !== null) {
			builder.setMode(mode);
		}


		var result = builder.build(environment, callback, scope);
		if (result === true) {
			return true;
		}


		return false;

	};

})(lychee, typeof global !== 'undefined' ? global : this);

