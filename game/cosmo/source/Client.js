
lychee.define('game.Client').requires([
	'game.net.client.Highscore',
	'game.net.client.Multiplayer'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, game, global, attachments) {

	var _highscore   = game.net.client.Highscore;
	var _multiplayer = game.net.client.Multiplayer;



	/*
	 * HELPERS
	 */

	var _init_highscore = function(service) {

		this.game.services.highscore = service;

		var state = this.game.getState('menu');
		var root  = state.getLayer('ui').getEntity('root');
		if (root !== null) {
			root.getEntity('highscore').setState('highscore');
		}

	};

	var _init_multiplayer = function(service) {

		this.game.services.multiplayer = service;

		var state = this.game.getState('menu');
		var root  = state.getLayer('ui').getEntity('root');
		if (root !== null) {
			root.getEntity('multiplayer').setState('multiplayer');
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings, game) {

		this.game = game;


		lychee.net.Client.call(this, JSON.stringify, JSON.parse);


		this.bind('connect', function() {

			var highscore   = new _highscore(this);
			var multiplayer = new _multiplayer(this);

			highscore.bind(  '#init', _init_highscore,   this, true);
			multiplayer.bind('#init', _init_multiplayer, this, true);

			this.plug(highscore);
			this.plug(multiplayer);

		}, this);

		this.bind('disconnect', function(code, reason) {

			this.game.client               = null;
			this.game.services.highscore   = null;
			this.game.services.multiplayer = null;


			var state = this.game.getState('menu');
			if (state !== null) {

				var root = state.getLayer('ui').getEntity('root');
				if (root !== null) {
					root.getEntity('highscore').setState('highscore-disabled');
					root.getEntity('multiplayer').setState('multiplayer-disabled');
				}

			}

		}, this);


		this.listen(settings.port, settings.host);

	};


	Class.prototype = {

	};


	return Class;

});

