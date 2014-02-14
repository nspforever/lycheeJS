
lychee.define('game.net.Client').requires([
	'lychee.data.BitON',
	'game.net.client.Highscores',
	'game.net.client.Multiplayer'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, game, global, attachments) {

	var _BitON       = lychee.data.BitON;
	var _highscores  = game.net.client.Highscores;
	var _multiplayer = game.net.client.Multiplayer;


	var Class = function(settings, game) {

		// required by services due to renderer
		this.game = game;

		this.services = {};
		this.services.highscores  = new _highscores(this);
		this.services.multiplayer = new _multiplayer(this);


		lychee.net.Client.call(this, {
			encoder: settings.encoder || _BitON.encode,
			decoder: settings.decoder || _BitON.decode
		});


		this.bind('connect', function() {

			this.plug(this.services.highscores);
			this.plug(this.services.multiplayer);

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

