
lychee.define('game.net.remote.Highscore').includes([
	'lychee.net.Service'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(remote) {

		lychee.net.Service.call(this, 'highscore', remote, lychee.net.Service.TYPE.remote);

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		update: function(data) {

			// TODO: Implement Highscores via Database

			var highscore = [];

			highscore.push({
				name:  'Christoph',
				mode:  'multiplayer',
				stage: 'stage1',
				points: 20000
			});


			this.remote.send({
				highscore: highscore
			}, {
				id:     this.id,
				event:  'update'
			});

		}

	};


	return Class;

});

