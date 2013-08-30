
lychee.define('game.Server').requires([
	'game.net.remote.Highscore',
	'game.net.remote.Multiplayer'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, game, global, attachments) {

	var _highscore   = game.net.remote.Highscore;
	var _multiplayer = game.net.remote.Multiplayer;


	var Class = function() {

		lychee.net.Server.call(this, JSON.stringify, JSON.parse);


		this.bind('connect', function(remote) {

			console.log('(Cosmo) game.Server: New Remote (' + remote.id + ')');

			remote.register('highscore',   _highscore);
			remote.register('multiplayer', _multiplayer);
			remote.accept();

		}, this);

	};


	Class.prototype = {

		listen: function(port, host) {

			console.log('(Cosmo) game.Server: Listening on ' + host + ':' + port);

			lychee.net.Server.prototype.listen.call(this, port, host);

		}

	};


	return Class;

});

