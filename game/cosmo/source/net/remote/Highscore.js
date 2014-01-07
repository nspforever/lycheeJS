
lychee.define('game.net.remote.Highscore').includes([
	'lychee.net.Service'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _get_highscores = function() {

		// TODO: Implement _get_highscores based on filesystem

		var highscores = [];


		highscore.push({
			name:  'Christoph',
			mode:  'multiplayer',
			stage: 'stage1',
			points: 20000
		});


		return highscores;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		lychee.net.Service.call(this, 'highscore', remote, lychee.net.Service.TYPE.remote);

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		sync: function() {

			if (this.tunnel !== null) {

				this.tunnel.send({
					highscores: _get_highscores()
				}, {
					id:    this.id,
					event: 'sync'
				});

			}

		}

	};


	return Class;

});

