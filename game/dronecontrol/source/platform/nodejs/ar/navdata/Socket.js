
lychee.define('game.ar.navdata.Socket').tags({
	platform: 'nodejs'
}).requires([
	'game.ar.data.NAVDATA'
]).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof Buffer !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, game, global, attachments) {

	var _dgram  = require('dgram');
	var _parser = game.ar.data.NAVDATA;



	/*
	 * HELPERS
	 */

	var _process_message = function(buffer) {

		var navdata = _parser.decode(buffer);

		if (
			   navdata instanceof Object
			&& navdata.valid === true
		) {
			this.trigger('receive', [ navdata ]);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(ip) {

		this.__ip       = typeof ip === 'string' ? ip : '192.168.1.1';
		this.__port     = 5554;
		this.__sequence = 0;


		var that = this;

		this.__socket = _dgram.createSocket('udp4');
		this.__socket.bind();
		this.__socket.on('message', function(buffer) {
			_process_message.call(that, buffer);
		});


		// Request Navdata from Drone
		var buffer = new Buffer([1]);

		this.__socket.send(
			buffer,
			0,
			buffer.length,
			this.__port,
			this.__ip
		);


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		close: function() {
			this.__socket.close();
			return true;
		}

	};


	return Class;

});

