
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
			var session = _cache[sid] || null;
			if (session === null) {

				var ready = data.autostart === false       ? false      : true;
				var limit = typeof data.limit === 'number' ? data.limit : 4;

				session = _cache[sid] = {
					sid:     sid,
					limit:   limit,
					tunnels: [ this.tunnel ],
					ready:   ready,
					active:  false
				};

			// 2. Join Session
			} else {

				var index = session.tunnels.indexOf(this.tunnel);
				var users = session.tunnels.length;
				if (
					   index === -1
					&& users < session.limit
					&& session.active === false
				) {

					session.tunnels.push(this.tunnel);

					_sync_session.call(this, session);

				} else if (session.active === true) {

					this.report('Session is already running.', {
						sid:   sid,
						users: users,
						limit: limit
					});

				} else if (users >= session.limit) {

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
			var session = _cache[sid] || null;
			if (session !== null) {

				var index = session.tunnels.indexOf(this.tunnel);
				if (index !== -1) {

					session.tunnels.splice(index, 1);

					this.setSession(null);
					this.setMulticast([]);

				}


				var users = session.tunnels.length;
				if (users === 0) {

					delete _cache[sid];

				} else {

					_sync_session.call(this, cache);

				}

			}

		}

	};

	var _on_start = function(data) {

		var sid = data.sid || null;
		if (sid !== null) {

			var session = _cache[sid] || null;
			if (
				   session !== null
				&& session.active === false
			) {

				session.ready = true;

				_sync_session.call(this, cache);

			}

		}

	};

	var _on_stop = function(data) {

		var sid = data.sid || null;
		if (sid !== null) {

			var session = _cache[sid] || null;
			if (
				   session !== null
				&& session.active === true
			) {

				session.ready = false;

				_sync_session.call(this, cache);

			}

		}

	};

	var _sync_session = function(session) {

		var sid = session.sid;
		if (sid !== null) {

			var limit = session.limit;

			var tunnels = [];
			for (var t = session.tunnels.length; t < tl; t++) {
				tunnels.push(session.tunnels[t].id);
			}


			var data = {
				type:    'update',
				sid:     sid,
				limit:   limit,
				tid:     'localhost:1337',
				tunnels: tunnels
			};


			if (tunnels.length === limit) {

				if (
					   session.ready === true
					&& session.active === false
				) {

					data.type = 'start';
					session.active = true;

					if (lychee.debug === true) {
						console.log('lychee.net.remote.Session: Starting session "' + sid + '"');
					}

				} else if (
					   session.ready === false
					&& session.active === true
				) {

					data.type = 'stop';
					session.active = false;

					if (lychee.debug === true) {
						console.log('lychee.net.remote.Session: Stopping session "' + sid + '"');
					}

				}


			} else if (tunnels.length < limit) {

				if (session.active === true) {

					data.type = 'stop';
					session.active = false;

					if (lychee.debug === true) {
						console.log('lychee.net.remote.Session: Stopping session "' + sid + '"');
					}

				} else {

					data.type = 'update';

					if (lychee.debug === true) {
						console.log('lychee.net.remote.Session: Updating session "' + sid + '" (' + tunnels.length + ' of ' + limit + ' tunnels)');
					}

				}

			}


			this.setSession(session);
			this.setMulticast(session.tunnels);


			for (var t = 0, tl = session.tunnels.length; t < tl; t++) {

				var tunnel = session.tunnels[t];
				if (tunnel !== null) {

					data.tid = tunnel.id;

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

	var Class = function(id, remote, data) {

		id = typeof id === 'string' ? id : 'session';


		var settings = lychee.extend({}, data);


		this.session = null;


		lychee.net.Service.call(this, id, remote, lychee.net.Service.TYPE.remote);



		/*
		 * INITIALIZATION
		 */

		this.bind('join',  _on_join,  this);
		this.bind('leave', _on_leave, this);
		this.bind('start', _on_start, this);
		this.bind('stop',  _on_stop,  this);


		this.bind('unplug', function() {

			for (var sid in _cache) {

				var cache = _cache[sid];
				var index = cache.tunnels.indexOf(this.tunnel);
				if (index !== -1) {
					_on_leave.call(this, cache);
				}

			}

		}, this);


		settings = null;

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		setSession: function(session) {

			if (
				   session === null
				|| (
					   session instanceof Object
					&& session.sid !== null
				)
			) {

				this.session = session;

				return true;

			}


			return false;

		}

	};


	return Class;

});

