
lychee.define('game.Main').requires([
	'game.net.Client',
	'game.state.Game'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			// Is configured by sorbet/module/Server
			client: null,

			fullscreen: true,

			input: {
				delay:       0,
				key:         false,
				keymodifier: false,
				touch:       true,
				swipe:       true
			},

			renderer: {
				id:     'game',
				width:  null,
				height: null
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


			if (clientsettings !== null) {
				this.client = new game.net.Client(clientsettings, this);
			}


			this.setState('game', new game.state.Game(this));
			this.changeState('game');

		}

	};


	return Class;

});
