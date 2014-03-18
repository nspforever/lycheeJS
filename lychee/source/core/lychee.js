
if (typeof global !== 'undefined') {

	if (typeof lychee === 'undefined') {
		global.lychee = {};
	}

} else {

	if (typeof lychee === 'undefined') {
		this.lychee = {};
	}

}


(function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _environment = new lychee.Environment();

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

	var Module = {

		debug:       false,
		environment: _environment,
		type:        'source', // TODO: move lychee.type to environment
		VERSION:     0.8,



		/*
		 * LIBRARY API
		 */

		define: function(identifier) {
			return new lychee.Definition(identifier);
		},

		enumof: function(template, value) {

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

		},

		extend: function(target) {

			for (var a = 1, al = arguments.length; a < al; a++) {

				var object = arguments[a];
				if (object) {

					for (var prop in object) {
						target[prop] = object[prop];
					}

				}

			}


			return target;

		},

		extendsafe: function(target) {

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

		},

		interfaceof: function(template, instance) {

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

		},



		/*
		 * ENTITY API
		 */

		serialize: function(definition) {

			definition = definition !== undefined ? definition : null;


			if (definition !== null) {

				if (typeof definition.serialize === 'function') {
					return definition.serialize();
				} else {
					return JSON.parse(JSON.stringify(definition));
				}

			}


			return null;

		},

		deserialize: function(data) {


			data = data instanceof Object ? data : null;


			if (data !== null) {

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


						for (var b = 0, bl = bindargs.length; b < bl; b++) {

							var value = bindargs[b];
							if (
								   typeof value === 'string'
								&& value.substr(0, 6) === '#this.'
							) {

								var resolved = _resolve_constructor(value.substr(6), this.environment);
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

		},



		/*
		 * CUSTOM API
		 */

		setEnvironment: function(environment) {

			environment = environment instanceof lychee.Environment ? environment : null;


			if (environment !== null) {
				this.environment = environment;
			} else {
				this.environment = _environment;
			}


			return true;

		}

	};


	Module.extend(lychee, Module);

})(lychee, typeof global !== 'undefined' ? global : this);

