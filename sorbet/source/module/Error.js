
lychee.define('sorbet.module.Error').requires([
	'sorbet.data.Template'
]).exports(function(lychee, sorbet, global, attachments) {

	var _template = new sorbet.data.Template(attachments['html']);


	var Class = function() {

	};


	Class.STATUS = {
		400: 'I could not understand the Request.',
		401: 'You have no authorization to process this Request.',
//		402: 'Payment Required',
		403: 'This Request is forbidden.',
		404: 'The requested file you were looking for could not be found.',
		405: 'The requested Method is not allowed.',
//		406: 'Not Acceptable.',
//		407: 'You need to authorize to the Proxy before.',
//		408: 'Request Timeout',
		409: 'There was an access conflict for the requested resource.',
		410: 'Oh noez! The requested resource has disappeared!',
//		411: 'Length Required',
//		412: 'Precondition Failed',
//		413: 'Request Entity Too Large',
//		414: 'Request-URI Too Long',
		415: 'Unsupported Media Type',
//		416: 'Request Range Not Statisfiable',
		417: 'Expectation Failed',
		500: 'Damn. You broke it!'
	};


	Class.prototype = {

		process: function(host, response, data) {

			var status   = typeof data.status === 'number'   ? data.status   : 500;
			var url      = typeof data.url === 'string'      ? data.url      : null;
			var resolved = typeof data.resolved === 'string' ? data.resolved : null;


			if (lychee.debug === true) {
				console.error('sorbet.module.Error: ' + status + ' for "' + data.host + ' , ' + url + '"');
			}


			var content = '';
			var message = Class.STATUS[status] || '';
			var version = sorbet.Main.VERSION;

			try {

				content = _template.render({
					status:  status,
					message: message,
					version: version
				});

			} catch(e) {

				content = '';

				// Error Module can't fail
				// return false;

			}


			response.status                 = status;
			response.header['Content-Type'] = 'text/html';
			response.content                = content;


			return true;

		}

	};


	return Class;

});

