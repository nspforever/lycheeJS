
lychee.define('lychee.net.Service').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _services = {};

	var _validate_enum = function(enumobject, value) {

		if (typeof value !== 'number') return false;


		var found = false;

		for (var id in enumobject) {

			if (value === enumobject[id]) {
				found = true;
				break;
			}

		}


		return found;

	};

	var _plug_broadcast = function(service) {

		var id = service.id;
		if (id !== null) {

			var cache = _services[id] || null;
			if (cache === null) {
				cache = _services[id] = [];
			}


			var found = false;

			for (var c = 0, cl = cache.length; c < cl; c++) {

				if (cache[c] === service) {
					found = true;
					break;
				}

			}


			if (found === false) {
				cache.push(service);
			}

		}

	};

	var _unplug_broadcast = function(service) {

		var id = service.id;
		if (id !== null) {

			var cache = _services[id] || null;
			if (cache !== null) {

				for (var c = 0, cl = cache.length; c < cl; c++) {

					if (cache[c] === service) {
						cache.splice(c, 1);
						break;
					}

				}

			}

		}

	};

	var _broadcast_packet = function(packet) {

		if (packet.service === null) return;


		var id = this.id;
		if (id !== null) {

			var cache = _services[id] || null;
			if (cache !== null) {

				for (var c = 0, cl = cache.length; c < cl; c++) {

					var service = cache[c];
					if (service !== this) {

						var tunnel = service.tunnel;
						if (tunnel !== null) {

							tunnel.send(
								packet.data,
								packet.service
							);

						}

					}

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(id, tunnel, type) {

		id     = typeof id === 'string'                                            ? id     : null;
		tunnel = (typeof tunnel === 'object' && typeof tunnel.send === 'function') ? tunnel : null;
		type   = _validate_enum(Class.TYPE, type) === true                         ? type   : null;


		this.id     = id;
		this.tunnel = tunnel;
		this.type   = type;


		if (lychee.debug === true) {

			if (this.id === null) {
				console.error('lychee.net.Service: Invalid (string) id. It has to be kept in sync with the lychee.net.Client and lychee.net.Remote instance.');
			}

			if (this.tunnel === null) {
				console.error('lychee.net.Service: Invalid (lychee.net.Client || lychee.net.Remote) tunnel.');
			}

			if (this.type === null) {
				console.error('lychee.net.Service: Invalid (lychee.net.Service.TYPE) type.');
			}

		}


		lychee.event.Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		this.bind('broadcast', function(packet) {

			var type = this.type;
			if (type === Class.TYPE.remote) {
				_broadcast_packet.call(this, packet.data);
			}

		}, this);

	};


	Class.TYPE = {
		// default: 0 (deactivated)
		'client': 1,
		'remote': 2
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.tunnel instanceof Object) {
				this.tunnel = lychee.deserialize(blob.tunnel);
			}

		},

		serialize: function() {

			var id     = null;
			var tunnel = null;
			var type   = null;

			var blob = {};


			if (this.id !== null)     id = this.id;
			if (this.tunnel !== null) blob.tunnel = this.tunnel.serialize();
			if (this.type !== null)   type = this.type;


			return {
				'constructor': 'lychee.net.Service',
				'arguments':   [ id, tunnel, type ],
				'blob':        blob
			};

		},



		/*
		 * CUSTOM API
		 */

		broadcast: function(data, service) {

			data    = data instanceof Object    ? data    : null;
			service = service instanceof Object ? service : null;


			if (
				   data === null
				|| this.id === null
			) {
				return false;
			}


			var type = this.type;
			if (type === Class.TYPE.client) {

				if (this.tunnel !== null) {

					this.tunnel.send({
						data:    data,
						service: service
					}, {
						id:    this.id,
						event: 'broadcast'
					});

					return true;

				}

			} else if (type === Class.TYPE.remote) {

				// TODO: Evaluate if broadcast shall be received by own remote or others only

			}


			return false;

		},

		plug: function() {

			var type = this.type;
			if (type === Class.TYPE.remote) {
				_plug_broadcast(this);
			}

		},

		unplug: function() {

			var type = this.type;
			if (type === Class.TYPE.remote) {
				_unplug_broadcast(this);
			}

		}

	};


	return Class;

});

