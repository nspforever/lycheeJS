
lychee.define('game.net.remote.Highscore').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var _config = attachments['json'];


	var _remotes = [];


	var Class = function() {

		this.id     = 'highscore';
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

				this.remote = null;

			}

		},

		update: function(data) {

			var highscore = [];

			highscore.push({
				name:  'Christoph',
				mode:  'multiplayer',
				stage: 'stage1',
				points: 20000
			});

			this.remote.send(highscore, {
				id:     this.id,
				method: 'triggerupdate'
			});

		}

	};


	return Class;

});

