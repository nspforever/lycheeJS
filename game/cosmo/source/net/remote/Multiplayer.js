
lychee.define('game.net.remote.Multiplayer').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var _remotes  = [];
	var _sessions = {};


	/*
	 * HELPERS
	 */

	var _session_wait = function(session) {

		this.remote.send({
			code:    session.code,
			session: session.code,
			message: 'Waiting for Co-Player.'
		}, {
			id:    this.id,
			event: 'session'
		});

	};

	var _session_leave = function(session) {

		var broadcast = false;

		for (var p = 0, pl = session.players.length; p < pl; p++) {

			if (session.players[p] === this.remote) {
				session.players.splice(p, 1);
				broadcast = session.ready === true;
				session.ready = false;
				break;
			}

		}


		if (session.players.length > 0) {

			if (session.admin === this.remote) {
				session.admin = session.players[0];
			}

			if (broadcast === true) {
				_session_stop.call(this, session);
			}

		} else {

			delete _sessions[session.code];

		}

	};

	var _session_full = function(session) {

		this.remote.send({
			code:    session.code,
			session: null,
			message: 'Game session already full.'
		}, {
			id:    this.id,
			event: 'session'
		});

	};

	var _session_start = function(session) {

		var players = session.players;

		var playerids = [];
		for (var p = 0, pl = players.length; p < pl; p++) {
			playerids.push(players[p].id);
		}

		for (var p = 0, pl = players.length; p < pl; p++) {

			var remote = players[p];

			remote.send({
				session: session.code,
				players: playerids,
				player:  p
			}, {
				id:    this.id,
				event: 'start'
			});

		}

	};

	var _session_stop = function(session) {

		var players = session.players;
		for (var p = 0, pl = players.length; p < pl; p++) {

			var player = players[p];

			player.send({
				session: session.code
			}, {
				id:    this.id,
				event: 'stop'
			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		this.id     = 'multiplayer';
		this.remote = remote;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * SERVICE API
		 */

		plug: function() {

			_remotes.push(this.remote);

		},

		unplug: function() {

			for (var r = 0, rl = _remotes.length; r < rl; r++) {
				if (_remotes[r] === this.remote) {
					_remotes.splice(r, 1);
					break;
				}
			}


			for (var sid in _sessions) {
				_session_leave.call(this, _sessions[sid]);
			}

		},



		/*
		 * CUSTOM API
		 */

		enter: function(data) {

			var code = data.code;
			if (code !== null) {

				var session = _sessions[code] || null;

				// 1. Create Game
				if (session === null) {

					var session = {
						ready:   false,
						code:    code,
						admin:   this.remote,
						players: [ this.remote ]
					};

					_sessions[code] = session;

					_session_wait.call(this, session);


				// 2. Join Game
				} else {


					// 2.1. Game waiting for others
					if (session.ready === false) {

						// 2.1a Join
						var players = session.players;
						if (players.indexOf(this.remote) === -1) {

							session.players.push(this.remote);
							session.ready = session.players.length === 2;

							if (session.ready === true) {
								_session_start.call(this, session);
							}

						// 2.1b Already joined
						} else {

							session.ready = session.players.length === 2;

							if (session.ready === true) {
								_session_start.call(this, session);
							} else {
								_session_stop.call(this, session);
								_session_wait.call(this, session);
							}

						}

					// 2.2. Game already full
					} else {

						_session_full.call(this, session);

					}

				}

			}

		},

		leave: function(data) {

			var code = data.code;
			if (code !== null) {

				var session = _sessions[code] || null;

				// 1. Leave Game
				if (session !== null) {
					_session_leave.call(this, session);
				}

			}

		}

	};


	return Class;

});

