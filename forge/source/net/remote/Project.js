
lychee.define('game.net.remote.Project').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

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

		},

		unplug: function() {

		}

	};


	return Class;

});

