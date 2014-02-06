
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

				layer.addEntity(root);



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

				root.addEntity(welcome);


				entity = new lychee.ui.Button({
					label: this.game.settings.title,
					font:  _fonts.headline,
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

					position.x = -1 * width;
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

				root.addEntity(settings);


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

		}

	};


	return Class;

});
