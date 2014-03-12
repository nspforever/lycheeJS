
lychee.define('sorbet.module.honey.Robots').exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _get_modules = function() {

		var modules = [];

		if (sorbet.module.honey instanceof Object) {

			for (var id in sorbet.module.honey) {

				if (id !== 'Robots') {
					modules.push(sorbet.module.honey[id]);
				}

			}

		}


		return modules;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {};


	Module.URLS = {
		'/robots.txt': false
	};


	Module.process = function(error, host, response, data) {

		var urls = [];


		var modules = _get_modules();
		for (var m = 0, ml = modules.length; m < ml; m++) {

			var module = modules[m];

			for (var url in module.URLS) {

				if (module.URLS[url] === true) {
					urls.push(url);
				}

			}

		}


		var content = '';


		content += 'User-agent: *' + '\n';

		for (var u = 0, ul = urls.length; u < ul; u++) {
			content += 'Disallow: ' + urls[u] + '\n';
		}

		content += '\n';


		response.status                 = 200;
		response.header['Content-Type'] = 'text/plain';
		response.content                = content;


		return true;

	};


	return Module;

});

