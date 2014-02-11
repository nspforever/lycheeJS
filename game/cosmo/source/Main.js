
lychee.define('game.Main').requires([
	'game.net.Client',
//	'game.logic.Game',
//	'game.state.Game',
	'game.state.Menu'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			// Is configured by sorbet/module/Server
			client: null,

			input: {
				delay:       0,
				key:         true,
				keymodifier: false,
				touch:       true,
				swipe:       false
			},

			jukebox: {
				music: true,
				sound: true
			},

			renderer: {
				id:     'game',
				width:  null,
				height: null
			},

			viewport: {
				fullscreen: true
			}

		}, data);


		lychee.game.Main.call(this, settings);

		this.load();

	};


	Class.prototype = {

		init: function() {

			// Overwrite client with game.Client
			var clientsettings   = this.settings.client;
			this.settings.client = null;

			lychee.game.Main.prototype.init.call(this);


			this.client   = null;
			this.services = {
				highscore:   null,
				multiplayer: null
			};

//			this.logic = new game.logic.Game(this);

			if (clientsettings !== null) {
				this.client = new game.net.Client(clientsettings, this);
			}

//			this.setState('game', new game.state.Game(this));
			this.setState('menu', new game.state.Menu(this));
			this.changeState('menu');

		}

	};


	return Class;

});
