
lychee.define('game.Server').requires([
	'lychee.net.remote.RoomService'
]).includes([
	'lychee.net.Server',
]).exports(function(lychee, game, global, attachments) {

	var Class = function() {

		lychee.net.Server.call(this, JSON.stringify, JSON.parse);


		this.bind('connect', function(remote) {

			console.log('NEW REMOTE ', remote.id);

			remote.accept();

		}, this);

	};


	Class.prototype = {

	};


	return Class;

});

