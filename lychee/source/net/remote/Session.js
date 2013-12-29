
lychee.define('lychee.net.remote.Session').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _cache = {};

	var _on_join = function(data) {

		var sid = data.sid || null;
		if (sid !== null) {

			// 1. Create Session
			var cache = _cache[sid] || null;
			if (cache === null) {

				var limit = typeof data.limit === 'number' ? data.limit : 4;

				cache = _cache[sid] = {
					sid:     sid,
					limit:   limit,
					tunnels: [ this.tunnel ],
					running: false
				};

			// 2. Join Session
			} else {

				var index = cache.tunnels.indexOf(this.tunnel);
				var users = cache.tunnels.length;
				if (
					   index === -1
					&& users < cache.limit
					&& cache.running === false
				) {

					cache.tunnels.push(this.tunnel);

					_sync_session.call(this, cache);

				} else if (cache.running === true) {

					this.report('Session is already running.', {
						sid:   sid,
						users: users,
						limit: limit
					});

				} else if (users >= cache.limit) {

					this.report('Session is full.', {
						sid:   sid,
						users: users,
						limit: limit
					});

				}

			}

		}

	};

	var _on_leave = function(data) {

		var sid = data.sid || null;
		if (sid !== null) {

			// 1. Leave Session
			var cache = _cache[sid] || null;
			if (cache !== null) {

				var index = cache.tunnels.indexOf(this.tunnel);
				if (index !== -1) {
					cache.tunnels.splice(index, 1);
				}


				var users = cache.tunnels.length;
				if (users === 0) {

					delete _cache[sid];

				} else {

					_sync_session.call(this, cache);

				}

			}

		}

	};

	var _sync_session = function(session) {

		var sid = session.sid;
		if (sid !== null) {

			var users = session.tunnels.length;
			var limit = session.limit;

			var data = {
				type:   'update',
				sid:    sid,
				userid: 0,
				users:  users,
				limit:  limit
			};


			if (users === limit) {

				data.type     = 'start';
				cache.running = true;

			} else if (users < limit) {

				if (cache.running === true) {

					data.type     = 'stop';
					cache.running = false;

				} else {

					data.type = 'update';

				}

			}


			for (var t = 0, tl = session.tunnels.length; t < tl; t++) {

				var tunnel = session.tunnels[t];
				if (tunnel !== null) {

					data.userid = t;

					tunnel.send(data, {
						id:    this.id,
						event: 'sync'
					});

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote, data) {

		var settings = lychee.extend({}, data);


		lychee.net.Service.call(this, 'session', remote, lychee.net.Service.TYPE.remote);



		/*
		 * INITIALIZATION
		 */

		this.bind('join',  _on_join,  this);
		this.bind('leave', _on_leave, this);


		settings = null;

	};


	Class.prototype = {

		// plug: function() { },

		unplug: function() {

			lychee.net.Service.prototype.unplug.call(this);


			for (var sid in _cache) {

				var cache = _cache[sid];
				var index = cache.tunnels.indexOf(this.tunnel);
				if (index !== -1) {

					_on_leave.call(this, {
						sid: sid
					});

				}

			}

		}

	};


	return Class;

});

