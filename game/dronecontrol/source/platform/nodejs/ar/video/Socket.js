
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

	var net = require('net');



	/*
	 * HELPERS
	 */

	var _process_data = function(buffer) {

console.log('processing raw video stream', buffer);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(ip) {

		this.__ip       = typeof ip === 'string' ? ip : '192.168.1.1';
		this.__port     = 5555;
		this.__sequence = 0;


		var that = this;

		this.__socket = new net.Socket();
		this.__socket.setTimeout(1000);
		this.__socket.connect(this.__port, this.__ip);
		this.__socket.on('data', function(buffer) {
			_process_data.call(that, buffer);
		});
		this.__socket.on('timeout', function() {
			this.destroy();
		});


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		close: function() {
			this.__socket.destroy();
			return false;
		}

	};


	return Class;

});

