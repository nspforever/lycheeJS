
lychee.define('lychee.net.Service').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _services = {};

	var _validate_tunnel = function(tunnel, type) {

		if (type === null) return false;


		if (type === Class.TYPE.client) {
			return lychee.validate(lychee.net.Client, tunnel);
		} else if (type === Class.TYPE.remote) {
			return lychee.validate(lychee.net.Remote, tunnel);
		}


		return false;

	};

	var _plug_broadcast = function() {

		var id = this.id;
		if (id !== null) {

			var cache = _services[id] || null;
			if (cache === null) {
				cache = _services[id] = [];
			}


			var found = false;

			for (var c = 0, cl = cache.length; c < cl; c++) {

				if (cache[c] === this) {
					found = true;
					break;
				}

			}


			if (found === false) {
				cache.push(this);
			}

		}

	};

	var _unplug_broadcast = function() {

		this.setMulticast([]);


		var id = this.id;
		if (id !== null) {

			var cache = _services[id] || null;
			if (cache !== null) {

				for (var c = 0, cl = cache.length; c < cl; c++) {

					if (cache[c] === this) {
						cache.splice(c, 1);
						break;
					}

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(id, tunnel, type) {

		id     = typeof id === 'string'                     ? id   : null;
		type   = lychee.validate(Class.TYPE, type) === true ? type : null;

		// tunnel needs to be validated after type, due to inclusion dependencies
		tunnel = _validate_tunnel(tunnel, type) === true   ? tunnel : null;


		this.id     = id;
		this.tunnel = tunnel;
		this.type   = type;

		this.__multicast = [];


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

		if (this.type === Class.TYPE.remote) {

			this.bind('plug',   _plug_broadcast,   this);
			this.bind('unplug', _unplug_broadcast, this);

		}

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
		 * SERVICE API
		 */

		multicast: function(data, service) {

			data    = data instanceof Object    ? data    : null;
			service = service instanceof Object ? service : null;


			if (data === null) {
				return false;
			}


			var type = this.type;
			if (type === Class.TYPE.client) {

				if (service === null) {

					service = {
						id:    this.id,
						event: 'multicast'
					};

				}


				if (this.tunnel !== null) {

					this.tunnel.send({
						data:    data,
						service: service
					}, {
						id:     this.id,
						method: 'multicast'
					});

					return true;

				}

			} else if (type === Class.TYPE.remote) {

				if (data.service !== null) {

					for (var m = 0, ml = this.__multicast.length; m < ml; m++) {

						var tunnel = this.__multicast[m];
						if (tunnel !== this.tunnel) {

							tunnel.send(
								data.data,
								data.service
							);

						}

					}

					return true;

				}

			}


			return false;

		},

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

				if (service === null) {

					service = {
						id:    this.id,
						event: 'broadcast'
					};

				}


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

				if (data.service !== null) {

					var broadcast = _services[this.id] || null;
					if (broadcast !== null) {

						for (var b = 0, bl = broadcast.length; b < bl; b++) {

							var tunnel = broadcast[b].tunnel;
							if (tunnel !== this.tunnel) {

								tunnel.send(
									data.data,
									data.service
								);

							}

						}

						return true;

					}

				}

			}


			return false;

		},

		report: function(message, blob) {

			message = typeof message === 'string' ? message : null;
			blob    = blob instanceof Object      ? blob    : null;


			if (message !== null) {

				if (this.tunnel !== null) {

					this.tunnel.send({
						message: message,
						blob:    blob
					}, {
						id:    this.id,
						event: 'error'
					});

				}

			}

		},

		setMulticast: function(multicast) {

			if (multicast instanceof Array) {

				var valid = true;
				var type  = this.type;

				for (var m = 0, ml = multicast.length; m < ml; m++) {

					if (_validate_tunnel(multicast[m], type) === false) {
						valid = false;
						break;
					}

				}

				this.__multicast = multicast;

				return true;

			}


			return false;

		}

	};


	return Class;

});

