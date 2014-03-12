
lychee.define('sorbet.module.Honey').requires([
	'sorbet.module.honey.Admin',
	'sorbet.module.honey.Robots'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _get_module = function(data) {

		if (sorbet.module.honey instanceof Object) {

			for (var id in sorbet.module.honey) {

				var module = sorbet.module.honey[id];

				for (var url in module.URLS) {

					if (url === data.url) {
						return module;
					}

				}

			}

		}


		return null;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.main = main;
		this.type = 'private';

	};


	Class.prototype = {

		check: function(host, response, data) {

			return _get_module(data) !== null;

		},

		process: function(host, response, data) {


			var _error = this.main.modules.get('error');

			var module = _get_module(data);
			if (module !== null) {

				return module.process(_error, host, response, data);

			} else {

				_error.process(host, response, {
					status:   410,
					host:     data.host,
					url:      data.url,
					resolved: null
				});

			}


			return true;

		}

	};


	return Class;

});

