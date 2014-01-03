
lychee.define('game.Client').requires([
	'game.net.client.Highscore',
	'game.net.client.Multiplayer'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, game, global, attachments) {

	var _highscore   = game.net.client.Highscore;
	var _multiplayer = game.net.client.Multiplayer;


	var Class = function(settings, game) {

		this.game = game;


		lychee.net.Client.call(this, JSON.stringify, JSON.parse);


		this.bind('connect', function() {

			var highscore   = new _highscore(this);
			var multiplayer = new _multiplayer(this);

			this.plug(highscore);
			this.plug(multiplayer);

		}, this);

		this.bind('disconnect', function(code, reason) {

			this.game.client = null;

		}, this);


		this.listen(settings.port, settings.host);

	};


	Class.prototype = {

	};


	return Class;

});

