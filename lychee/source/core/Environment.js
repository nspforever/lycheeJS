
lychee.Environment = (function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _validate_values = function(array) {

		if (array instanceof Array) {

			var valid = true;

			for (var a = 0, al = array.length; a < al; a++) {

				var value = array[a];
				if (typeof value !== 'string') {
					valid = false;
					break;
				}

			}


			return valid;

		}


		return false;

	};



	/*
	 * STRUCTS
	 */

	var _console = global.console;

	var _sandbox = function(isolated) {

		isolated = isolated === true;


		if (isolated === true) {

			this.console = {

				_log: '',

				log: function() {

					var str = '\n';

					for (var a = 0, al = arguments.length; a < al; a++) {

						var arg = arguments[a];
						if (typeof arg.toString === 'function') {
							str += ' ' + arg.toString();
						} else {
							str += ' ' + arg;
						}

					}

					this._log += str;

				},

				error: function() {

					var args = [].slice.call(arguments);
					args.reverse();
					args.push('(E)\t');
					args.reverse();

					this.log.apply(this, args);

				},

				warn: function() {

					var args = [].slice.call(arguments);
					args.reverse();
					args.push('(W)\t');
					args.reverse();

					this.log.apply(this, args);

				},

				group: function(title) {
					this.log.call(this, '~ ~ ~ ' + title + ' ~ ~ ~');
				},

				groupEnd: function(title) {
					this.log.call(this, '~ ~ ~ ~ ~ ~');
				}

			};

		} else {

			this.console = _console;

		}


		this.lychee = {};

		for (var identifier in global.lychee) {

			if (
				   identifier === 'Compiler'
				|| identifier === 'Definition'
				|| identifier === 'Environment'
				|| identifier === 'Preloader'
				// TODO: Include new core.js' methods here
			) {

				this.lychee[identifier] = global.lychee[identifier];

			}

		}


		this.setTimeout = function(callback, timeout) {
			global.setTimeout(callback, timeout);
		};

		this.setInterval = function(callback, interval) {
			global.setInterval(callback, interval);
		};

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.definitions = {};
		this.sandbox     = new _sandbox(settings.isolated);
		this.tags        = {};
		this.bases       = {
			'lychee': '/lychee/source'
		};


		this.setBases(settings.bases);
		this.setDefinitions(settings.definitions);
		this.setTags(settings.tags);

		settings = null;


		_update_sandbox.call(this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var settings = {};


			if (Object.keys(this.bases).length > 0) {

				settings.bases = {};

				for (var id in this.bases) {
					settings.bases[id] = this.bases[id];
				}

			}


			// TODO: serialize Definitions


			if (Object.keys(this.tags).length > 0) {

				settings.tags = {};

				for (var id in this.tags) {
					settings.tags[id] = this.tags[id];
				}

			}


			return {
				'constructor': 'lychee.Environment',
				'arguments':   [ settings ]
			};

		},

		toDefinitionString: function() {

			var data = this.serialize();

			var settings = data['arguments'][0];


			return 'new lychee.Environment(' + JSON.stringify(settings, null, '\t') + ');';

		},



		/*
		 * CUSTOM API
		 */

		setBases: function(bases) {

			bases = bases instanceof Object ? bases : null;


			if (bases !== null) {

				for (var namespace in bases) {

					var url = bases[namespace];
					if (typeof url === 'string') {
						this.bases[namespace] = url;
					}

				}


				return true;

			}


			return false;

		},

		setDefinitions: function(definitions) {

			definitions = definitions instanceof Object ? definitions : null;


			if (definitions !== null) {

				for (var identifier in definitions) {

					var definition = definitions[identifier];
					if (definition instanceof lychee.Definition) {
						this.definitions[identifier] = definition;
					}

				}


				return true;

			}


			return false;

		},

		setTags: function(tags) {

			tags = tags instanceof Object ? tags : null;


			if (tags !== null) {

				for (var type in tags) {

					var values = tags[type];
					if (_validate_values(values) === true) {
						this.tags[type] = values;
					}

				}


				return true;

			}


			return false;

		}

	};


	return Class;

})(lychee, typeof global !== 'undefined' ? global : this);
