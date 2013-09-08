
lychee.define('game.net.remote.Highscore').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(remote) {

		this.id     = 'highscore';
		this.remote = remote;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * SERVICE API
		 */

		plug: function() {

		},

		unplug: function() {

		},



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

