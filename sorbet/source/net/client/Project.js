
lychee.define('sorbet.net.client.Project').includes([
	'lychee.net.Service'
]).exports(lychee, sorbet, global, attachments) {

	var Class = function(client, data) {

		var settings = lychee.extend({}, data);


		lychee.net.Service.call(this, 'project', client, lychee.net.Service.TYPE.client);

		settings = null;

	};


	Class.prototype = {
	};


	return Class;

});

