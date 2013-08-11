
lychee.define('game.ar.video.Socket').tags({
	platform: [ 'nodejs' ]
}).requires([
//	'game.ar.data.VIDEO'
]).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof Buffer !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, game, global, attachments) {

	var Class = function(ip) {

		this.__ip       = typeof ip === 'string' ? ip : '192.168.1.1';
		this.__port     = 5555;
		this.__sequence = 0;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		close: function() {
			return false;
		}

	};


	return Class;

});

