
lychee.define('game.net.remote.Multiplayer').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, game) {

	var _remotes  = [];
	var _sessions = {};


	var _session_start = function(session) {

		var players = session.players;
		for (var p = 0, pl = players.length; p < pl; p++) {

			var player = players[p];

			player.send({
				session: session.id,
				player:  (p + 1)
			}, {
				id:     this.id,
				method: 'start'
			});

		}

	};

	var _session_stop = function(session) {

		var players = session.players;
		for (var p = 0, pl = players.length; p < pl; p++) {

			var player = players[p];

			player.send({
				session: session.id
			}, {
				id:     this.id,
				method: 'stop'
			});

		}

	};


	var Class = function() {

		this.id     = 'multiplayer';
		this.remote = null;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		plug: function(remote) {

			this.remote = remote;
			_remotes.push(remote);

		},

		unplug: function() {

			if (this.remote !== null) {

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
							session.ready = false;
							stop = true;
							break;
						}

					}

					if (session.players.length > 0) {

						if (session.admin === this.remote) {
							session.admin = session.players[0];
							session.ready = false;
						}

						if (stop === true) {
							_session_stop.call(this, session);
						}

					} else {

						delete _sessions[sid];

					}

				}

				this.remote = null;

			}

		},

		enter: function(data) {

			var code = data.code;
			if (code !== null) {


				var session = _sessions[code] || null;

				// JOIN GAME
				if (
					   session !== null
					&& session.ready === false
				) {

					var players = session.players;
					if (players.indexOf(this.remote) === -1) {

						session.ready = false;
						session.players.push(this.remote);

						_session_start.call(this, session);

					} else {

						this.remote.send({
							code:    null,
							session: null,
							message: 'Invalid Code',
						}, {
							id:     this.id,
							method: 'verification'
						});

					}


				// CREATE GAME
				} else {

					var session = {
						ready:   false,
						code:    code,
						admin:   this.remote,
						players: [ this.remote ]
					};

					_sessions[code] = session;


					this.remote.send({
						code:    code,
						session: code,
						message: 'Waiting for Co-Player ...',
					}, {
						id:     this.id,
						method: 'verification'
					});

				}

			}

		}

	};


	return Class;

});

