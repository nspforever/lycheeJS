
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
					tunnels: [],
					ready:   ready,
					active:  false
				};


				session.tunnels.push(this.tunnel);
				this.setMulticast(session.tunnels);

				_sync_session.call(this, session);

			// 2. Join Session
			} else {

				var index   = session.tunnels.indexOf(this.tunnel);
				var tunnels = session.tunnels.length;
				if (
					   index === -1
					&& tunnels < session.limit
					&& session.active === false
				) {

					session.tunnels.push(this.tunnel);
					this.setMulticast(session.tunnels);

					_sync_session.call(this, session);

				} else if (session.active === true) {

					this.report('Session is already running.', {
						sid:   sid,
						limit: limit
					});

				} else if (tunnels >= session.limit) {

					this.report('Session is full.', {
						sid:   sid,
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


				if (session.tunnels.length === 0) {

					delete _cache[sid];

				} else {

					_sync_session.call(this, session);

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

				_sync_session.call(this, session);

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

				_sync_session.call(this, session);

			}

		}

	};

	var _sync_session = function(session) {

		var sid = session.sid;
		if (sid !== null) {

			var limit = session.limit;

			var tunnels = [];
			for (var t = 0, tl = session.tunnels.length; t < tl; t++) {
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

				var session = _cache[sid];
				var index   = session.tunnels.indexOf(this.tunnel);
				if (index !== -1) {
					_on_leave.call(this, session);
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

