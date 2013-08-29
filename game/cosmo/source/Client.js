
lychee.define('game.Client').requires([
	'game.net.client.Controller',
	'game.net.client.Highscore',
	'game.net.client.Multiplayer'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, game, global, attachments) {

	var _highscore   = game.net.client.Highscore;
	var _multiplayer = game.net.client.Multiplayer;
	var _controller  = game.net.client.Controller;


	var Class = function(settings, game) {

		this.game = game;


		lychee.net.Client.call(this, JSON.stringify, JSON.parse);


		this.bind('connect', function() {

			var ctservice = new _controller(this);
			var hsservice = new _highscore(this);
			var mpservice = new _multiplayer(this);

			ctservice.bind('init', function() {
				this.game.services.controller = ctservice;
			}, this, true);

			hsservice.bind('init', function() {
				this.game.services.highscore = hsservice;
			}, this, true);

			mpservice.bind('init', function() {
				this.game.services.multiplayer = mpservice;
			}, this, true);


			this.plug(ctservice);
			this.plug(hsservice);
			this.plug(mpservice);


			mpservice.bind('start', function(data) {

				if (this.game.isState('menu') === true) {

					this.game.changeState('game', {
						type:   'multiplayer',
						player: data.player
					});

				}

			}, this);

			mpservice.bind('stop', function(data) {

				if (this.game.isState('game') === true) {
					this.game.changeState('menu');
				}

			}, this);

		}, this);

		this.bind('disconnect', function(code, reason) {
			this.game.client               = null;
			this.game.services.controller  = null;
			this.game.services.highscore   = null;
			this.game.services.multiplayer = null;
		}, this);


		this.listen(settings.port, settings.host);

	};


	Class.prototype = {

	};


	return Class;

});

