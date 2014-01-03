
lychee.define('game.net.remote.Multiplayer').includes([
	'lychee.net.remote.Session'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	// TODO: Port session_control to multicast via clients

	var _session_control = function(session, data) {

		var broadcast = false;

		var players = session.players;
		for (var p = 0, pl = players.length; p < pl; p++) {

			var remote = players[p];
			if (remote.id === data.id) {
				broadcast = true;
			}

		}


		if (broadcast === true) {

			var packet = {
				id: data.id || null
			};

			if (data.key !== undefined)    packet.key    = data.key;
			if (data.update !== undefined) packet.update = data.update;
			if (data.touch !== undefined)  packet.touch  = data.touch;


			for (var p = 0, pl = players.length; p < pl; p++) {

				var remote = players[p];
				if (remote.id !== data.id) {

					remote.send(packet, {
						id:    this.id,
						event: 'control-' + data.id
					});

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		lychee.net.remote.Session.call(this, 'multiplayer', remote, {
			// no settings
		});

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		control: function(data) {

			// TODO: this needs to be removed, as it is multicasted

			var code = data.code;
			if (code !== null) {

				var session = _sessions[code] || null;

				// 1. Broadcast Control Action
				if (
					   session !== null
					&& session.ready === true
				) {

					_session_control.call(this, session, data);

				}

			}

		}

	};


	return Class;

});

