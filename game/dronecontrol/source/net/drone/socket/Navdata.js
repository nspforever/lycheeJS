
lychee.define('game.net.drone.socket.Navdata').tags({
	platform: 'nodejs'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof Buffer !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, game, global, attachments) {

	var _dgram  = require('dgram');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(ip) {

		this.sequence = 0;

		this.__ip   = typeof ip === 'string' ? ip : '192.168.1.1';
		this.__port = 5554;


		var that = this;


		this.__socket = _dgram.createSocket('udp4');
		this.__socket.bind();
		this.__socket.on('message', function(buffer) {
			that.sequence++;
			that.trigger('receive', [ buffer ]);
		});


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		flush: function() {

			var buffer = new Buffer([1]);


			this.__socket.send(
				buffer,
				0,
				buffer.length,
				this.__port,
				this.__ip
			);

		},

		close: function() {

			this.__socket.close();
			return true;

		}

	};


	return Class;

});

