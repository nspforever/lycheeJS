
lychee.define('sorbet.net.remote.Project').includes([
	'lychee.net.Service'
]).exports(lychee, sorbet, global, attachments) {

	var Class = function(remote, data) {

		var settings = lychee.extend({}, data);


		lychee.net.Service.call(this, 'project', remote, lychee.net.Service.TYPE.remote);

		settings = null;

	};


	Class.prototype = {

		setId:

	};


	return Class;

});

