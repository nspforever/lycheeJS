
lychee.define('game.net.remote.Multiplayer').includes([
	'lychee.net.remote.Session'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(remote) {

		lychee.net.remote.Session.call(this, 'multiplayer', remote, {
			// no settings
		});

	};


	Class.prototype = {

	};


	return Class;

});

