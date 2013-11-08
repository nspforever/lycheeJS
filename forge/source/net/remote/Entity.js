
lychee.define('game.net.remote.Entity').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _update = function(projectroot) {

		projectroot = typeof projectroot === 'string' ? projectroot : null;


		var filtered = [];


		return filtered;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		this.id     = 'entity';
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

			_update.call(this, data.projectroot || null);

		}

	};


	return Class;

});

