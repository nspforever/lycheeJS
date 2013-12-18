
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

	var _send_broadcast = function(data, service) {

		data    = data instanceof Object    ? data    : null;
		service = service instanceof Object ? service : null;


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
								data,
								service
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

	var Class = function(id, tunnel, data) {

		id     = typeof id === 'string'                                            ? id     : null;
		tunnel = (typeof tunnel === 'object' && typeof tunnel.send === 'function') ? tunnel : null;


		var settings = lychee.extend({}, data);


		this.id        = id;
		this.tunnel    = tunnel;

		this.broadcast = false;
		this.type      = 0;


		if (lychee.debug === true) {

			if (this.id === null) {
				console.error('lychee.net.Service: Invalid id. It has to be kept in sync with the lychee.net.Client and lychee.net.Remote instance.');
			}

			if (this.tunnel === null) {
				console.error('lychee.net.Service: Invalid tunnel. It has to be either a lychee.net.Client or lychee.net.Remote instance.');
			}

		}


		this.setBroadcast(settings.broadcast);
		this.setType(settings.type);


		lychee.event.Emitter.call(this);

		settings = null;

	};


	Class.TYPE = {
		'client':  1,
		'remote':  2
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			// TODO: Implement serialize() method for lychee.net.Client and lychee.net.Remote

			if (blob.tunnel instanceof Object) {
				this.tunnel = lychee.deserialize(blob.tunnel);
			}

		},

		serialize: function() {

			var settings = {};


			if (this.broadcast !== false)            settings.broadcast = this.broadcast;
			if (this.type !== Class.TYPE['default']) settings.type      = this.type;


			var blob = {};

			if (this.tunnel !== null) blob.tunnel = this.tunnel.serialize();


			return {
				'constructor': 'lychee.net.Service',
				'arguments':   [ this.id, null, settings ],
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
				|| this.broadcast === false
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
						id:     this.id,
						method: 'broadcast'
					});

					return true;

				}

			} else if (type === Class.TYPE.remote) {

				_send_broadcast.call(
					this,
					data.data,
					data.service
				);

				return true;

			}


			return false;

		},

		plug: function() {

			var broadcast = this.broadcast;
			var type      = this.type;
			if (
				   broadcast === true
				&& type === Class.TYPE.remote
			) {

				_plug_broadcast(this);

			}

		},

		unplug: function() {

			_unplug_broadcast(this);

		},

		setBroadcast: function(broadcast) {

			if (broadcast === true || broadcast === false) {

				this.broadcast = broadcast;

				return true;

			}


			return false;

		},

		setType: function(type) {

			if (_validate_enum(Class.TYPE, type) === true) {

				this.type = type;

				return true;

			}


			return false;

		}

	};


	return Class;

});

