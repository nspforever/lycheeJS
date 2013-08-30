
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
		for (var p = 0, pl = players.length; p < pl; p++) {

			var player = players[p];

			player.send({
				session: session.code,
				player:  (p + 1)
			}, {
				id:    this.id,
				event: 'start'
			});

		}

	};

	var _session_stop = function(session) {

console.log('> stop session!', session.code);

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

var _interval;

	var Class = function(remote) {

		this.id     = 'multiplayer';
		this.remote = remote;


if (_interval === undefined) {
_interval = setInterval(function() {
	console.log('sessions:', _sessions);
}, 5000);
}

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

				var session = _sessions[sid];
				var stop    = false;

				for (var p = 0, pl = session.players.length; p < pl; p++) {

					if (session.players[p] === this.remote) {
						session.players.splice(p, 1);
						stop = session.ready === true;
						session.ready = false;
						break;
					}

				}


				if (session.players.length > 0) {

					if (session.admin === this.remote) {
						session.admin = session.players[0];
					}

					if (stop === true) {
						_session_stop.call(this, session);
					}

				} else {

					delete _sessions[sid];

				}

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

				} else {

					// 1. Join Game
					if (session.ready === false) {

						var players = session.players;
						if (players.indexOf(this.remote) === -1) {

							session.players.push(this.remote);
							session.ready = session.players.length === 2;

							if (session.ready === true) {
								_session_start.call(this, session);
							}

						} else {

							session.ready = session.players.length === 2;

							if (session.ready === true) {
								_session_start.call(this, session);
							} else {
								_session_stop.call(this, session);
								_session_wait.call(this, session);
							}

						}

					} else {

						_session_full.call(this, session);

					}

				}

			}

		},

		leave: function(data) {

			var code = data.session;
			if (code !== null) {

				var session = _sessions[code] || null;

				// LEAVE GAME
				if (session !== null) {

console.log('leave session!', session);

				}

			}

		}

	};


	return Class;

});

