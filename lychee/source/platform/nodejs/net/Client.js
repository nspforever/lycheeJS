
lychee.define('lychee.net.Client').tags({
	platform: 'nodejs'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof process !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, global) {

	var Class = function() {
	};


	Class.prototype = {
	};


	return Class;

});

