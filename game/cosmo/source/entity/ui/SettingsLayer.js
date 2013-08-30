
lychee.define('game.entity.ui.SettingsLayer').requires([
	'game.entity.ui.Menu'
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


			this.addEntity(new game.entity.ui.Menu({
				state: 'default'
			}));


			entity = new lychee.ui.Button({
				label: 'Fullscreen:' + ((this.game.settings.fullscreen === true) ? ' On': 'Off'),
				font:  this.game.fonts.normal,
				position: {
					x: 0,
					y: -48
				}
			});

			entity.bind('#touch', function(entity) {

				var s = this.game.settings;
				s.fullscreen = !s.fullscreen;

				entity.setLabel('Fullscreen:' + ((s.fullscreen === true) ? ' On': 'Off'));

				this.game.reset(true);

			}, this);

			this.addEntity(entity);

			entity = new lychee.ui.Button({
				label: 'Music:     ' + ((this.game.settings.music === true) ? ' On': 'Off'),
				font:  this.game.fonts.normal,
				position: {
					x: 0,
					y: 0
				}
			});

			entity.bind('#touch', function(entity) {

				var s = this.game.settings;
				s.music = !s.music;

				entity.setLabel('Music:     ' + ((s.music === true) ? ' On': 'Off'));

			}, this);

			this.addEntity(entity);

			entity = new lychee.ui.Button({
				label: 'Sound:     ' + ((this.game.settings.sound === true) ? ' On': 'Off'),
				font:  this.game.fonts.normal,
				position: {
					x: 0,
					y: 48
				}
			});

			entity.bind('#touch', function(entity) {

				var s = this.game.settings;
				s.sound = !s.sound;

				entity.setLabel('Sound:     ' + ((s.sound === true) ? ' On': 'Off'));

			}, this);

			this.addEntity(entity);

		}

	};


	return Class;

});

