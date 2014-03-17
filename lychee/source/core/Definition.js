
lychee.Definition = (function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _export_definition = function() {

		var environment = lychee.getEnvironment();
		if (environment instanceof Object) {

			var validated_support = false;
			if (this._supports !== null) {
				validated_support = this._supports.call(global, lychee, global);
			} else {
				validated_support = true;
			}


			var validated_tags = true;
			if (Object.keys(this._tags).length > 0) {

				for (var type in this._tags) {

					var value  = this._tags[type];
					var values = environment.tags[type] || null;
					if (
						   values instanceof Array
						&& values.indexOf(value) === -1
					) {

						validated_tags = false;
						break;

					}

				}

			}


			if (environment.type === 'build') {

				if (validated_tags === true) {
					environment.definitions[this.id] = this;
				}

			} else if (environment.type === 'source') {

				if (
					   validated_support === true
					&& validated_tags === true
				) {
					environment.definitions[this.id] = this;
				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(identifier) {

		identifier = typeof identifier === 'string' ? identifier : '';


		if (identifier.match(/\./)) {

			var tmp = identifier.split('.');

			this.id        = identifier;
			this.classId   = tmp.pop();
			this.packageId = tmp.join('.');

		} else {

			this.id        = 'lychee.' + identifier;
			this.classId   = identifier;
			this.packageId = 'lychee';

		}


		this._attaches = {};
		this._tags     = {};
		this._requires = [];
		this._includes = [];
		this._exports  = null;
		this._supports = null;


		return this;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		toDefinitionString: function() {

			var str = 'lychee.define("' + this.id + '")';

			if (Object.keys(this._attaches).length > 0) {

				str += '.attaches({';

				for (var id in this._attaches) {

					str += '\n';

					var attachment = this._attaches[id];
					if (
						   attachment instanceof Font
						|| attachment instanceof Music
						|| attachment instanceof Sound
						|| attachment instanceof Texture
					) {

						str += '\t"' + id + '": ' + attachment.toDefinitionString() + ',';

					} else {

						str += '\t"' + id + '": ' + JSON.stringify(attachment, null, '\t') + ',';

					}

				}


				// Fix the issue with trailing comma
				if (Object.keys(this._attaches).length > 0) {
					str = str.substr(str, str.length - 1);
				}


				str += '\n';
				str += '})';

			}

			if (Object.keys(this._tags).length > 0) {
				str += '.tags(' + JSON.stringify(this._tags, null, '\t') + ')';
			}

			if (this._requires.length > 0) {
				str += '.requires(' + JSON.stringify(this._requires, null, '\t') + ')';
			}

			if (this._includes.length > 0) {
				str += '.includes(' + JSON.stringify(this._includes, null, '\t') + ')';
			}

			if (this._supports !== null) {
				str += '.supports(' + this._supports.toString() + ')';
			}

			if (this._exports !== null) {
				str += '.exports(' + this._exports.toString() + ')';
			}


			str += ';';


			return str;

		},



		/*
		 * CUSTOM API
		 */

		attaches: function(map) {

			map = map instanceof Object ? map : null;


			if (map !== null) {

				for (var id in map) {

					var value = map[id];
					if (
						   value instanceof Font
						|| value instanceof Music
						|| value instanceof Sound
						|| value instanceof Texture
						|| value !== undefined
						// RAW string templates can be attached, too.
						// || value instanceof Object
					) {
						this._attaches[id] = map[id];
					}

				}

			}


			return this;

		},

		exports: function(callback) {

			callback = callback instanceof Function ? callback : null;


			if (callback !== null) {
				this._exports = callback;
			}


			_export_definition.call(this);


			return this;

		},

		includes: function(definitions) {

			definitions = definitions instanceof Array ? definitions : null;


			if (definitions !== null) {

				for (var d = 0, dl = definitions.length; d < dl; d++) {

					var definition = definitions[d];
					if (
						   typeof definition === 'string'
						&& definition.indexOf('.') !== -1
						&& this._includes.indexOf(definition) === -1
					) {
						this._includes.push(definition);
					}

				}

			}


			return this;

		},

		requires: function(definitions) {

			definitions = definitions instanceof Array ? definitions : null;


			if (definitions !== null) {

				for (var d = 0, dl = definitions.length; d < dl; d++) {

					var definition = definitions[d];
					if (
						   typeof definition === 'string'
						&& definition.indexOf('.') !== -1
						&& this._requires.indexOf(definition) === -1
					) {
						this._requires.push(definition);
					}

				}

			}


			return this;

		},

		supports: function(callback) {

			callback = callback instanceof Function ? callback : null;


			if (callback !== null) {
				this._supports = callback;
			}


			return this;

		},

		tags: function(map) {

			map = map instanceof Object ? map : null;


			if (map !== null) {

				for (var id in map) {

					var value = map[id];
					if (typeof value === 'string') {
						this._tags[id] = value;
					}

				}

			}


			return this;

		}

	};


	return Class;

})(lychee, typeof global !== undefined ? global : this);

