
lychee.define('game.Server').includes([
	'lychee.net.Server'
]).exports(function(lychee, game, global, attachments) {

	var Class = function() {

		lychee.net.Server.call(this, JSON.stringify, JSON.parse);


		this.bind('connect', function(remote) {

			console.log('NEW COSMO REMOTE', remote.id);

			remote.accept();

		}, this);

	};


	Class.prototype = {

	};


	return Class;

});

