
lychee.define('game.state.Menu').requires([
	'game.entity.lycheeJS',
	'lychee.ui.Layer',
	'lychee.ui.Button'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _fonts = {
		headline: attachments["headline.fnt"],
		normal:   attachments["normal.fnt"]
	};


	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.__cache = {
			x: 0, y: 0
		};


		this.reset();

	};


	Class.prototype = {

		reset: function() {

			lychee.game.State.prototype.reset.call(this);


			var renderer = this.renderer;
			if (renderer !== null) {

				var entity = null;
				var width  = renderer.getEnvironment().width;
				var height = renderer.getEnvironment().height;


				this.removeLayer('ui');


				var layer = new lychee.game.Layer();


				var root = new lychee.ui.Layer({
					width:  width * 3,
					height: height,
					position: {
						x: 0,
						y: 0
					}
				});

				layer.setEntity('root', root);



				/*
				 * WELCOME MENU
				 */

				var welcome = new lychee.ui.Layer({
					width:  width,
					height: height,
					position: {
						x: 0,
						y: 0
					}
				});

				root.setEntity('welcome', welcome);


				entity = new lychee.ui.Button({
					label:    this.game.settings.title,
					font:     _fonts.headline,
					position: {
						x: 0,
						y: -1 * height / 2 + 64
					}
				});

				welcome.addEntity(entity);


				entity = new game.entity.lycheeJS({
					position: {
						x: 0,
						y: height / 2 - 32
					}
				});

				welcome.addEntity(entity);


				entity = new lychee.ui.Button({
					label: 'New Game',
					font:  _fonts.normal,
					position: {
						x: 0,
						y: -24
					}
				});

				entity.bind('touch', function() {
					this.game.changeState('game');
				}, this);

				welcome.addEntity(entity);


				entity = new lychee.ui.Button({
					label: 'Settings',
					font:  _fonts.normal,
					position: {
						x: 0,
						y: 24
					}
				});

				entity.bind('touch', function() {

					var position = this.__cache;

					position.x = -1/3 * root.width;
					position.y = 0;

					root.setPosition(position);

				}, this);

				welcome.addEntity(entity);



				/*
				 * SETTINGS MENU
				 */

				var settings = new lychee.ui.Layer({
					width:  width,
					height: height,
					position: {
						x: width,
						y: 0
					}
				});

				root.setEntity('settings', settings);


				entity = new lychee.ui.Button({
					label: 'Settings',
					font:  _fonts.headline,
					position: {
						x: 0,
						y: -1 * height / 2 + 64
					}
				});

				entity.bind('touch', function() {

					var position = this.__cache;

					position.x = 0;
					position.y = 0;

					root.setPosition(position);

				}, this);

				settings.addEntity(entity);


				entity = new game.entity.lycheeJS({
					position: {
						x: 0,
						y: height / 2 - 32
					}
				});

				settings.addEntity(entity);


				entity = new lychee.ui.Button({
					label: 'Fullscreen: ' + ((this.game.viewport.fullscreen === true) ? 'On': 'Off'),
					font:  _fonts.normal,
					position: {
						x: 0,
						y: -24
					}
				});

				entity.bind('#touch', function(entity) {

					var viewport   = this.game.viewport;
					var fullscreen = !viewport.fullscreen;

					entity.setLabel('Fullscreen: ' + ((fullscreen === true) ? 'On': 'Off'));

					viewport.setFullscreen(fullscreen);

				}, this);

				settings.addEntity(entity);


				entity = new lychee.ui.Button({
					label: 'Music: ' + ((this.game.jukebox.music === true) ? 'On': 'Off'),
					font:  _fonts.normal,
					position: {
						x: 0,
						y: 24
					}
				});

				entity.bind('#touch', function(entity) {

					var jukebox = this.game.jukebox;
					var music   = !jukebox.music;

					entity.setLabel('Music: ' + ((music === true) ? 'On': 'Off'));

					jukebox.setMusic(music);

				}, this);

				settings.addEntity(entity);


				entity = new lychee.ui.Button({
					label: 'Sound: ' + ((this.game.jukebox.sound === true) ? 'On': 'Off'),
					font:  _fonts.normal,
					position: {
						x: 0,
						y: 72
					}
				});

				entity.bind('#touch', function(entity) {

					var jukebox = this.game.jukebox;
					var sound   = !jukebox.sound;

					entity.setLabel('Sound: ' + ((sound === true) ? 'On': 'Off'));

					jukebox.setSound(sound);

				}, this);

				settings.addEntity(entity);


				this.setLayer('ui', layer);

			}

		},

		reshape: function(orientation, rotation, width, height) {

			lychee.game.State.prototype.reshape.call(this);


			var renderer = this.renderer;
			if (renderer !== null) {

				var entity = null;
				var width  = renderer.getEnvironment().width;
				var height = renderer.getEnvironment().height;


				var root = this.queryLayer('ui', 'root');

				root.width  = width * 3;
				root.height = height;


				var welcome = this.queryLayer('ui', 'root > welcome');

				welcome.width  = width;
				welcome.height = height;
				welcome.position.x =

				welcome.entities[0].position.y = -1 * height / 2 + 64;
				welcome.entities[1].position.y =      height / 2 - 32;


				var settings = this.queryLayer('ui', 'root > settings');

				settings.width      = width;
				settings.height     = height;
				settings.position.x = width;

				settings.entities[0].position.y = -1 * height / 2 + 64;
				settings.entities[1].position.y =      height / 2 - 32;

console.log('reshape!');

				root.setPosition({ x: 0 });

global._ROOT = root;

			}

		}

	};


	return Class;

});
