
lychee.define('game.net.remote.Project').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _update = function() {

console.log(this.remote.server.config);


	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		this.id     = 'project';
		this.remote = remote;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * SERVICE API
		 */

		plug: function() {

			_update.call(this);

		},

		unplug: function() {

		}

	};


	return Class;

});

