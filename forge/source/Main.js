
lychee.define('game.Main').requires([
	'game.Client',
	'game.entity.Font',
	'game.entity.ui.Project',
	'game.entity.ui.Scene',
	'game.state.Font',
	'game.state.Scene',
//	'game.Builder',
	'game.Controller'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			fullscreen: true,

			// Is configured by sorbet/module/Server
			client: null,

			input: {
				fireKey:   true,
				fireTouch: true,
				fireSwipe: true
			},

			project: {
				path: '/game/boilerplate'
			},

			renderer: {
				id: 'forge'
			},

			state: 'scene'

		}, data);


		lychee.game.Main.call(this, settings);

		this.load();

	};


	Class.prototype = {

		reset: function(state) {

			this.reshape();


			if (state === true) {
				this.resetState(null, null);
			}

		},

		load: function() {

			var preloader = new lychee.Preloader();


			preloader.bind('ready', function(assets, mappings) {

				var url = Object.keys(assets)[0];
				var settings = assets[url];
				if (settings !== null) {

					this.settings.client = {
						port: settings.port,
						host: settings.host
					};

				}

				preloader.unbind('ready');
				preloader.unbind('error');

				this.init();

			}, this);

			preloader.bind('error', function(assets, mappings) {

				preloader.unbind('ready');
				preloader.unbind('error');

				this.init();

			}, this);

			preloader.load('/sorbet/module/Server', null, 'json');

		},

		init: function(project) {

			lychee.game.Main.prototype.init.call(this);
			this.reset(false);


			var env = this.renderer.getEnvironment();


			this.fonts = {};
			this.fonts.normal = new game.entity.Font('normal');

			this.client   = null;
			this.services = {
				project: null
			};

			if (this.settings.client !== null) {
				this.client = new game.Client(this.settings.client, this);
			}

//			this.builder    = new game.Builder(this);
			this.controller = new game.Controller(this);
			this.project    = new game.entity.ui.Project(this);
			this.scene      = new game.entity.ui.Scene(this);

			this.setState('font',  new game.state.Font(this));
			this.setState('scene', new game.state.Scene(this));
			this.changeState(this.settings.state);

			this.start();

		}

	};


	return Class;

});
