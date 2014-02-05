
lychee.define('game.entity.ui.menu.Settings').requires([
	'game.entity.ui.menu.Background'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(settings, game) {

		this.game = game;


		settings.width  = 512;
		settings.height = 312;


		lychee.ui.Layer.call(this, settings);


		this.reset();

	};


	Class.prototype = {

		reset: function() {

			var entity = null;


			var background = new game.entity.ui.menu.Background({
				state: 'default'
			});

			this.addEntity(background);


			entity = new lychee.ui.Button({
				label: 'Fullscreen:' + ((this.game.viewport.fullscreen === true) ? ' On': 'Off'),
				font:  background.font,
				position: {
					x: 0,
					y: -48
				}
			});

			entity.bind('#touch', function(entity) {

				var viewport   = this.game.viewport;
				var fullscreen = !viewport.fullscreen;

				entity.setLabel('Fullscreen:' + ((fullscreen === true) ? ' On': 'Off'));

				viewport.setFullscreen(fullscreen);
				// TODO: Evaluate if this is correct
				// this.game.reset(true);

			}, this);

			this.addEntity(entity);

			entity = new lychee.ui.Button({
				label: 'Music:     ' + ((this.game.jukebox.music === true) ? ' On': 'Off'),
				font:  background.font,
				position: {
					x: 0,
					y: 0
				}
			});

			entity.bind('#touch', function(entity) {

				var jukebox = this.game.jukebox;
				var music   = !jukebox.music;
				var _music  = this.game.getState('menu').music;

				entity.setLabel('Music:     ' + ((music === true) ? ' On': 'Off'));

				jukebox.setMusic(music);
                jukebox.stop(_music);

				if (jukebox.music === true) {
					jukebox.play(_music);
				}

			}, this);

			this.addEntity(entity);

			entity = new lychee.ui.Button({
				label: 'Sound:     ' + ((this.game.jukebox.sound === true) ? ' On': 'Off'),
				font:  background.font,
				position: {
					x: 0,
					y: 48
				}
			});

			entity.bind('#touch', function(entity) {

				var jukebox = this.game.jukebox;
				var sound   = !jukebox.sound;

				entity.setLabel('Sound:     ' + ((sound === true) ? ' On': 'Off'));

				jukebox.setSound(sound);

			}, this);

			this.addEntity(entity);

		}

	};


	return Class;

});

