
lychee.define('sorbet.module.Redirect').exports(function(lychee, sorbet, global, attachments) {

	var Class = function(main) {

		this.main = main;
		this.type = 'private';

	};


	Class.prototype = {

		process: function(host, response, data) {

			var url = typeof data.url === 'string' ? data.url : null;


			if (url !== null) {

				if (url.charAt(0) === '/') {
					url = url.substr(host.root.length);
				}


				response.status             = 301;
				response.header['Location'] = url;
				response.content            = '';

				return true;

			}


			return false;

		}

	};


	return Class;

});

