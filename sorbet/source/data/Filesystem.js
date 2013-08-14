
lychee.define('sorbet.data.Filesystem').exports(function(lychee, sorbet, global, attachments) {

	var fs = require('fs');


	var Class = function(root) {

		root = typeof root === 'string' ? root : null;


		this.__roots = [];
		this.__cache = {};
		this.__map   = {};
		this.__rmap  = {};


		if (root !== null) {
			this.watch(root);
		}

	};


	Class.TYPE = {
		directory: 1,
		file:      2,
		link:      3
	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		reset: function() {

			this.__roots = [];
			this.__cache = {};
			this.__map   = {};
			this.__rmap  = {};

		},

		refresh: function() {

			if (lychee.debug === true) {
				console.log('sorbet.module.Filesystem: Refreshing tree for ' + this.__roots.join(', '));
			}

			for (var r = 0, rl = this.__roots.length; r < rl; r++) {
				this.walk(this.__roots[r]);
			}

		},

		watch: function(directory) {

			var index = this.__roots.indexOf(directory);
			if (index === -1) {

				this.__roots.push(directory);
				this.__cache[directory] = Class.TYPE.directory;

				this.refresh();

				return true;

			}


			return false;

		},

		unwatch: function(directory) {

			var index = this.__roots.indexOf(directory);
			if (index !== -1) {

				this.__roots.splice(index, 1);

				for (var path in this.__cache) {

					if (path.substr(0, directory.length) === directory) {
						delete this.__cache[path];
					}

				}

				return true;

			}


			return false;

		},

		walk: function(directory) {

			var that = this;


			fs.readdir(directory, function(err, list) {

				if (!err) {

					var pending = list.length;
					if (pending > 0) {

						list.forEach(function(file) {

							fs.stat(directory + '/' + file, function(err, stat) {

								if (stat) {

									if (stat.isDirectory() === true) {

										if (that.add(directory, file, Class.TYPE.directory) === true) {
											that.walk(directory + '/' + file);
										}

									} else {
										that.add(directory, file, Class.TYPE.file);
									}

								}

							});

						});

					}

				}

			});

		},

		add: function(path, entry, type, alias) {

			alias = typeof alias === 'string' ? alias : null;


			if (entry.substr(0, 1) !== '.') {

				var fullpath = path + '/' + entry;

				this.__cache[fullpath] = type;


				if (
					alias !== null
					&& type === Class.TYPE.link
				) {

					var fullalias = path + '/' + alias;

					this.__map[fullalias] = fullpath;
					this.__rmap[fullpath] = fullalias;

				}


				return true;

			}


			return false;

		},

		remove: function(path, entry) {

			var id = path + '/' + entry;

			if (this.__cache[id] !== undefined) {

				var type = this.__cache[id];
				if (type === Class.TYPE.link) {

					var alias = this.__rmap[id];
					delete this.__map[alias];
					delete this.__rmap[id];

				}


				delete this.__cache[id];

				return true;

			}


			return false;

		},

		resolve: function(path) {

			if (this.__map[path] !== undefined) {

				return this.__map[path];

			} else if (this.__cache[path] !== undefined) {

				return path;

			} else if (path.substr(-1) === '/') {

				var tmp = path.substr(0, path.length - 1);
				if (this.__cache[tmp] !== undefined) {
					return tmp;
				}

			}


			return null;

		},

		read: function(url, callback, scope) {

			fs.readFile(url, function(err, data) {

				if (err) {
					callback.call(scope, null);
				} else {

					fs.stat(url, function(err, stat) {

						if (err) {
							callback.call(scope, null);
						} else {
							callback.call(scope, data, stat.mtime);
						}

					});

				}

			});

		},

		info: function(path) {

			var resolved = this.resolve(path);
			if (resolved !== null) {

				var raw = null;

				try {

					raw = fs.statSync(path);

				} catch(e) {
				}


				if (raw !== null) {

					return {
						ino:   raw.ino,
						size:  raw.size,
						mtime: raw.mtime
					};

				}

			}


			return null;

		},

		filter: function(prefix, suffix, type) {

			prefix = typeof prefix === 'string' ? prefix : null;
			suffix = typeof suffix === 'string' ? suffix : null;
			type   = typeof type === 'number'   ? type   : null;


			var pl = 0, sl = 0;
			if (prefix !== null) pl = prefix.length;
			if (suffix !== null) sl = suffix.length;


			var filtered = [];
			for (var path in this.__cache) {

				if (prefix === null || path.substr(0, pl) === prefix) {
					if (suffix === null || path.substr(-1 * sl) === suffix) {
						if (type === null || this.__cache[path] === type) {
							filtered.push(path);
						}
					}
				}

			}


			return filtered;

		},

		isDirectory: function(path) {
			return this.__cache[path] === Class.TYPE.directory;
		},

		isFile: function(path) {
			return this.__cache[path] === Class.TYPE.file;
		}

	};


	return Class;

});

