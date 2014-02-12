
lychee.define('game.state.Menu').requires([
	'game.entity.lycheeJS',
	'lychee.ui.Layer',
	'lychee.ui.Button'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _blob  = attachments["json"];
	var _fonts = {
		headline: attachments["headline.fnt"],
		normal:   attachments["normal.fnt"]
	};


	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.deserialize(_blob);
		this.reshape();

	};


	Class.prototype = {

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);


			var root   = this.queryLayer('ui', 'root');
			var entity = null;


			this.queryLayer('ui', 'root > welcome > title').setLabel(this.game.settings.title);

			this.queryLayer('ui', 'root > welcome > newgame').bind('touch', function() {
				this.game.changeState('game');
			}, this);


			this.queryLayer('ui', 'root > welcome > settings').bind('touch', function() {
				this.setPosition({ x: -1/4 * this.width });
			}, root);

			this.queryLayer('ui', 'root > settings > title').bind('touch', function() {
				this.setPosition({ x: 1/4 * this.width });
			}, root);


			entity = this.queryLayer('ui', 'root > settings > fullscreen');
			entity.setLabel('Fullscreen: ' + ((this.game.viewport.fullscreen === true) ? 'On': 'Off'));
			entity.bind('#touch', function(entity) {

				var viewport   = this.game.viewport;
				var fullscreen = !viewport.fullscreen;

				entity.setLabel('Fullscreen: ' + ((fullscreen === true) ? 'On': 'Off'));
				viewport.setFullscreen(fullscreen);

			}, this);

			entity = this.queryLayer('ui', 'root > settings > music');
			entity.setLabel('Music: ' + ((this.game.jukebox.music === true) ? 'On': 'Off'));
			entity.bind('#touch', function(entity) {

				var jukebox = this.game.jukebox;
				var music   = !jukebox.music;

				entity.setLabel('Music: ' + ((music === true) ? 'On': 'Off'));
				jukebox.setMusic(music);

			}, this);

			entity = this.queryLayer('ui', 'root > settings > sound');
			entity.setLabel('Sound: ' + ((this.game.jukebox.sound === true) ? 'On': 'Off'));
			entity.bind('#touch', function(entity) {

				var jukebox = this.game.jukebox;
				var sound   = !jukebox.sound;

				entity.setLabel('Sound: ' + ((sound === true) ? 'On': 'Off'));
				jukebox.setSound(sound);

			}, this);

			entity = this.queryLayer('ui', 'root > settings > debug');
			entity.setLabel('Debug: ' + ((lychee.debug === true) ? 'On': 'Off'));
			entity.bind('#touch', function(entity) {

				var debug = !lychee.debug;

				entity.setLabel('Debug: ' + ((debug === true) ? 'On': 'Off'));
				lychee.debug = debug;

			}, this);

		},

		reshape: function(orientation, rotation) {

			var renderer = this.renderer;
			if (renderer !== null) {

				var entity = null;
				var width  = renderer.width;
				var height = renderer.height;


				var root = this.queryLayer('ui', 'root');

				root.width  = width * 2;
				root.height = height;


				entity = this.queryLayer('background', 'lycheeJS');
				entity.position.y = 1/2 * height - 32;


				entity = this.queryLayer('ui', 'root > welcome');
				entity.width      = width;
				entity.height     = height;
				entity.position.x = -1/2 * width;


				entity = this.queryLayer('ui', 'root > welcome > title');
				entity.position.y = -1/2 * height + 64;


				entity = this.queryLayer('ui', 'root > settings');
				entity.width      = width;
				entity.height     = height;
				entity.position.x = 1/2 * width;


				entity = this.queryLayer('ui', 'root > settings > title');
				entity.position.y = -1/2 * height + 64;


				this.getLayer('ui').reshape();
				root.setPosition({ x: 1/2 * width });

			}


			lychee.game.State.prototype.reshape.call(this, orientation, rotation);

		},

		enter: function(data) {

			lychee.game.State.prototype.enter.call(this);


			var renderer = this.renderer;
			if (renderer !== null) {

				var width = renderer.width;
				var root  = this.queryLayer('ui', 'root');
				if (root !== null) {
					root.setPosition({ x: 1/2 * width });
				}

			}

		}

	};


	return Class;

});
