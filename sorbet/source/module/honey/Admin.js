
lychee.define('sorbet.module.honey.Admin').exports(function(lychee, sorbet, global, attachments) {

	var _content = {
		'/admin/':               attachments['index.php'],
		'/admin/index.html':     attachments['index.php'],
		'/admin/index.php':      attachments['index.php'],
		'/admin/login.html':     attachments['index.php'],
		'/admin/login.php':      attachments['index.php'],
		'/admin/config.php':     '',
		'/admin/config.php.bak': attachments['config.php.bak']
	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {};


	Module.URLS = {
		'/admin/':               true,
		'/admin/index.html':     false,
		'/admin/index.php':      false,
		'/admin/login.html':     false,
		'/admin/login.php':      false,
		'/admin/config.php':     false,
		'/admin/config.php.bak': false
	};


	Module.process = function(error, host, response, data) {

		var url = data.url;
		if (Module.URLS[url] !== undefined) {

			var content = _content[url] || null;
			if (content !== null) {

				response.status                 = 200;
				response.header['Content-Type'] = 'text/html';
				response.content                = content;

			}


			return true;

		}


		return false;

	};


	return Module;

});

