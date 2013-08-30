
lychee.define('game.entity.ui.HighscoreLayer').requires([
	'game.entity.ui.Menu',
	'lychee.ui.Button',
	'lychee.ui.Sprite'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */



	/*
	 * IMPLEMENTATION
	 */

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
			var width  = this.width;
			var height = this.height;


			this.addEntity(new game.entity.ui.Menu({
				state: 'default'
			}));



			entity = new lychee.ui.Button({
				label:   '',
				font:    this.game.fonts.small,
				visible: false,
				position: {
					x: 0,
					y: 1/2 * height - 32
				}
			});

			this.setEntity('message', entity);

		},

		enter: function() {

			this.setMessage(null);


			var service = this.game.services.highscore;
			if (service !== null) {

				service.bind('update', function(data) {

console.log('highscore data!', data);

				}, this);

				service.update();

			}

		},

		leave: function() {

			var service = this.game.services.highscore;
			if (service !== null) {
				service.unbind('update');
			}

		},

		setMessage: function(message) {

			message = typeof message === 'string' ? message : null;


			var entity = this.getEntity('message');
			if (entity !== null) {

				if (message !== null) {
					entity.setLabel(message);
					entity.visible = true;
				} else {
					entity.visible = false;
				}

			}

		}

	};


	return Class;

});

