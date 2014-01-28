
lychee.define('game.net.Client').requires([
	'lychee.data.BitON',
	'game.net.client.Highscore',
	'game.net.client.Multiplayer'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, game, global, attachments) {

	var _BitON       = lychee.data.BitON;
	var _highscore   = game.net.client.Highscore;
	var _multiplayer = game.net.client.Multiplayer;


	var Class = function(settings, game) {

		// required by services due to renderer
		this.game = game;


		lychee.net.Client.call(this, {
			encoder: settings.encoder || _BitON.encode,
			decoder: settings.decoder || _BitON.decode
		});


		this.bind('connect', function() {

			var highscore   = new _highscore(this);
			var multiplayer = new _multiplayer(this);

			this.plug(highscore);
			this.plug(multiplayer);

		}, this);

		this.bind('disconnect', function(code, reason) {

			console.log('Client disconnected!', code, reason);

		}, this);


		this.listen(settings.port, settings.host);

	};


	Class.prototype = {

	};


	return Class;

});

