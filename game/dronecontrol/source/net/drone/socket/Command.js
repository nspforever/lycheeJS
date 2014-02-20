
lychee.define('game.net.drone.socket.Command').tags({
	platform: 'nodejs'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof Buffer !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, game, global, attachments) {

	var _dgram = require('dgram');


	var Class = function(ip) {

		this.sequence = 0;

		this.__ip     = typeof ip === 'string' ? ip : '192.168.1.1';
		this.__port   = 5556;
		this.__buffer = [];
		this.__socket = _dgram.createSocket('udp4');


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		push: function(command) {

			command = typeof command === 'string' ? command : null;


			if (command !== null) {

				this.__buffer.push(command);

				return true;

			}


			return false;

		},

		flush: function() {

			var cmdbuffer = this.__buffer;
			if (cmdbuffer.length > 0) {

				var commands = cmdbuffer.join('');
				var buffer   = new Buffer(commands);


				if (lychee.debug === true) {
					console.log(this.__buffer.join('\n'));
				}


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

			this.__socket.close();
			return true;

		}

	};


	return Class;

});

