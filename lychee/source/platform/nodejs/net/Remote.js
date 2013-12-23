
lychee.define('lychee.net.Remote').tags({
	platform: 'nodejs'
}).requires([
	'lychee.net.Protocol'
]).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof process !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, global) {

	var _protocol = lychee.net.Protocol;



	/*
	 * HELPERS
	 */

	var _receive_handler = function(blob, isBinary) {

		var data = null;
		try {
			data = this.__decoder(blob);
		} catch(e) {
			// Unsupported data encoding
			return false;
		}


		if (
			data instanceof Object
			&& typeof data._serviceId === 'string'
		) {

			var service = _get_service_by_id.call(this, data._serviceId);
			var event   = data._serviceEvent || null;
			var method  = data._serviceMethod || null;

			if (method !== null) {

				if (method.charAt(0) === '@') {

					if (method === '@plug') {
						_plug_service.call(this, data._serviceId, service);
					} else if (method === '@unplug') {
						_unplug_service.call(this, data._serviceId, service);
					}

				} else if (
					service !== null
					&& typeof service[method] === 'function'
				) {

					// Remove data frame service header
					delete data._serviceId;
					delete data._serviceMethod;

					service[method](data);

				}

			} else if (event !== null) {

				if (
					service !== null
					&& typeof service.trigger === 'function'
				) {

					// Remove data frame service header
					delete data._serviceId;
					delete data._serviceEvent;

					service.trigger(event, [ data ]);

				}

			}

		} else {

			this.trigger('receive', [ data ]);

		}


		return true;

	};

	var _get_service_by_id = function(id) {

		for (var s = 0, sl = this.__services.length; s < sl; s++) {

			var service = this.__services[s];
			if (service.id === id) {
				return service;
			}

		}


		return null;

	};

	var _plug_service = function(id, service) {

		id = typeof id === 'string' ? id : null;


		if (
			   id === null
			|| service !== null
		) {
			return;
		}


		var construct = this.__servicesmap[id] || null;
		if (typeof construct === 'function') {

			service = new construct(this);
			this.__services.push(service);


			if (lychee.debug === true) {
				console.log('lychee.net.Remote: Plugged service (' + service.id + ')');
			}


			if (typeof service.plug === 'function') {
				service.plug();
			}


			// Okay, Client, plugged Service! PONG
			this.send({}, {
				id:     service.id,
				method: '@plug'
			});

		} else {

			if (lychee.debug === true) {
				console.log('lychee.net.Remote: Unplugged service (' + id + ')');
			}


			// Nope, Client, unplug invalid Service! PONG
			this.send({}, {
				id:     id,
				method: '@unplug'
			});

		}

	};

	var _unplug_service = function(id, service) {

		id = typeof id === 'string' ? id : null;


		if (
			   id === null
			|| service === null
		) {
			return;
		}


		var found = false;

		for (var s = 0, sl = this.__services.length; s < sl; s++) {

			if (this.__services[s].id === id) {
				this.__services.splice(s, 1);
				found = true;
				sl--;
			}

		}


		if (lychee.debug === true) {
			console.log('lychee.net.Remote: Unplugged service (' + id + ')');
		}


		if (found === true) {

			if (typeof service.unplug === 'function') {
				service.unplug();
			}

			this.send({}, {
				id:     id,
				method: '@unplug'
			});

		}

	};

	var _cleanup_services = function() {

		var services = this.__services;

		for (var s = 0; s < services.length; s++) {

			var service = services[s];
			if (typeof service.unplug === 'function') {
				service.unplug();
			}

		}

		this.__services = [];

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(server, socket, encoder, decoder) {

		encoder = encoder instanceof Function ? encoder : function(blob) { return blob; };
		decoder = decoder instanceof Function ? decoder : function(blob) { return blob; };


		this.id      = socket.remoteAddress + ':' + socket.remotePort;
		this.version = _protocol.VERSION;
		this.waiting = true;
		this.server  = server;

		this.__encoder = encoder;
		this.__decoder = decoder;

		this.__services    = [];
		this.__servicesmap = {};


		lychee.event.Emitter.call(this);

		settings = null;


		var that = this;

		this.__protocol = new _protocol(socket, function(closedByRemote) {

			socket.end();
			socket.destroy();
			server.disconnect(that);

		});

		socket.on('data', function(data) {
			that.__protocol.read(data, _receive_handler, that);
		});

		socket.on('error', function(err) {
			that.__protocol.close(true);
			_cleanup_services.call(that);
		});

		socket.on('timeout', function(a,b,c) {
			that.__protocol.close(true);
			_cleanup_services.call(that);
		});

		socket.on('end', function() {
			that.__protocol.close(true);
			_cleanup_services.call(that);
		});

		socket.on('close', function(err) {
			that.__protocol.close(true);
			_cleanup_services.call(that);
		});

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		accept: function() {

			if (this.waiting === true) {

				this.waiting = false;

				return true;

			}


			return false;

		},

		reject: function(reason) {

			if (this.waiting === true) {

				this.__protocol.close(false, reason);
				this.waiting = false;

				return true;

			}


			return false;

		},

		register: function(id, construct) {

			id        = typeof id === 'string'          ? id        : null;
			construct = typeof construct === 'function' ? construct : null;


			if (
				   id !== null
				&& construct !== null
			) {

				this.__servicesmap[id] = construct;

				return true;

			}


			return false;

		},

		send: function(data, service) {

			data    = data instanceof Object    ? data    : null;
			service = service instanceof Object ? service : null;


			if (
				   data === null
				|| this.__protocol.isConnected() === false
			) {
				return false;
			}


			if (service !== null) {

				if (typeof service.id     === 'string') data._serviceId     = service.id;
				if (typeof service.event  === 'string') data._serviceEvent  = service.event;
				if (typeof service.method === 'string') data._serviceMethod = service.method;

			}


			var blob = this.__encoder(data);


			this.__protocol.write(blob);

		},

		disconnect: function(reason) {

			if (this.__protocol.isConnected() === true) {
				return this.__protocol.close(false, reason);
			}


			return false;

		}

	};


	return Class;

});

