
lychee.define('game.ar.command.Socket').tags({
	platform: 'nodejs'
}).supports(function(lychee, global) {

	if (typeof Buffer !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, game, global, attachments) {

	var _dgram = require('dgram');


	var Class = function(ip) {

		this.__ip       = typeof ip === 'string' ? ip : '192.168.1.1';
		this.__port     = 5556;
		this.__buffer   = [];
		this.__sequence = 0;
		this.__socket   = _dgram.createSocket('udp4');

	};


	Class.prototype = {

		add: function(command) {
			this.__buffer.push(command.toString(this.__sequence++));
			return true;
		},

		flush: function() {

			var cmdbuffer = this.__buffer;
			if (cmdbuffer.length > 0) {

				var commands = cmdbuffer.join('');
				var buffer   = new Buffer(commands);


//				if (lychee.debug === true) {
//					console.log('game.ar.command.Socket: ' + JSON.stringify(commands));
//				}


				this.__socket.send(
					buffer,
					0,
					buffer.length,
					this.__port,
					this.__ip
				);

				this.__buffer = [];


				return true;

			}


			return false;

		},

		close: function() {
			this.__raw.close();
			return true;
		}

	};


	return Class;

});

