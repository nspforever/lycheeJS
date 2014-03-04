
lychee.define('lychee.net.Server').tags({
	platform: 'html'
}).requires([
	'lychee.net.Remote'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global) {

	var _remote = lychee.net.Remote;



	/*
	 * HELPERS
	 */

	// TODO: WebSocket Upgrade
	// TODO: WebSocket Handshake



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.remotes = [];

		this.__encoder = settings.encoder instanceof Function ? settings.encoder : JSON.stringify;
		this.__decoder = settings.decoder instanceof Function ? settings.decoder : JSON.parse;
		this.__socket  = null;


		lychee.event.Emitter.call(this);

		settings = null;

	};


	Class.prototype = {

		listen: function(port, host) {

			if (this.__socket !== null) return false;


			port = typeof port === 'number' ? port : 1337;
			host = typeof host === 'string' ? host : null;


			if (lychee.debug === true) {
				console.log('lychee.net.Server: Listening on ' + host + ':' + port);
			}


			var that = this;

			try {

				// TODO: Setup HTTP Server

			} catch(e) {

				if (lychee.debug === true) {
					console.error(e);
				}

				return false;

			}


			return true;

		},



		/*
		 * REMOTE INTEGRATION API
		 */

		connect: function(remote) {

			var found = false;
			for (var r = 0, rl = this.remotes.length; r < rl; r++) {

				if (this.remotes[r] === remote) {
					found = true;
					break;
				}

			}


			if (found === false) {

				if (lychee.debug === true) {
					console.log('lychee.net.Server: Connected lychee.Remote (' + remote.id + ')');
				}

				remote.bind('#destroy', this.disconnect, this);

				this.remotes.push(remote);
				this.trigger('connect', [ remote ]);


				return true;

			}


			return false;

		},

		disconnect: function(remote) {

			var found = false;
			for (var r = 0, rl = this.remotes.length; r < rl; r++) {

				if (this.remotes[r] === remote) {
					found = true;
					this.remotes.splice(r, 1);
					rl--;
					r--;
				}

			}


			if (found === true) {

				if (lychee.debug === true) {
					console.log('lychee.net.Server: Disconnected lychee.Remote (' + remote.id + ')');
				}

				this.trigger('disconnect', [ remote ]);


				return true;

			}


			return false;

		}

	};


	return Class;

});

