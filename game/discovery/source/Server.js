
lychee.define('game.Server').requires([
	'lychee.net.remote.RoomService'
]).includes([
	'lychee.net.Server',
]).exports(function(lychee, game, global, attachments) {

	var Class = function() {

		lychee.net.Server.call(this, JSON.stringify, JSON.parse);


		this.bind('connect', function(remote) {

			console.log('(Discovery) game.Server: New Remote (' + remote.id + ')');

			remote.register('RoomService', lychee.net.remote.RoomService);
			remote.accept();

		}, this);

	};


	Class.prototype = {

		listen: function(port, host) {

			console.log('(Discovery) game.Server: Listening on ' + host + ':' + port);

			lychee.net.Server.prototype.listen.call(this, port, host);

		}

	};


	return Class;

});

