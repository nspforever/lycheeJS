
lychee.define('game.entity.ui.MultiplayerLayer').requires([
	'game.entity.ui.Menu',
	'lychee.ui.Button',
	'lychee.ui.Sprite'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _enter_number = function(entity) {

		var code = this.getEntity('code');
		var tmp  = code.label.split(' ');

		if (typeof entity.label === 'string') {
			tmp[this.__cursor] = entity.label;
			code.setLabel(tmp.join(' '));
		}

		this.__cursor += 1;
		this.__cursor %= 4;

		if (this.__cursor === 0) {

			var service = this.game.services.multiplayer;
			if (service !== null) {

				service.leave();
				service.setSid(code.label);
				service.join();

			}

		}

	};

	var _on_start = function(data) {

		if (this.game.isState('menu') === true) {

			this.game.changeState('game', {
				type:    'multiplayer',
				players: data.users,
				player:  data.userid
			});

			this.getEntity('code').setLabel(data.sid);

		}

	};

	var _on_stop = function(data) {

		if (this.game.isState('game') === true) {
			this.game.changeState('menu');
			this.getEntity('code').setLabel(data.sid);
		}

	};

	var _on_update = function(data) {

		this.getEntity('code').setLabel(data.sid);

	};

	var _on_error = function(data) {

		if (typeof data.message === 'string') {

			var message = this.getEntity('message');
			if (message !== null) {
				message.setLabel(data.message);
				message.setVisible(true);
			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings, game) {

		this.game = game;


		settings.width  = 512;
		settings.height = 312;


		this.__cursor = 0;


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
				label: 'Enter Code',
				font: this.game.fonts.normal,
				position: {
					x:  0,
					y: -1/2 * height + 32
				}
			});

			this.setEntity('headline', entity);

			entity = new lychee.ui.Button({
				label:    '_ _ _ _',
				font:     this.game.fonts.normal,
				position: {
					x:  0,
					y: -1/2 * height + 64 + 20
				}
			});

			this.addEntity(entity);

			entity = new lychee.ui.Button({
				label:    '* * * *',
				font:     this.game.fonts.normal,
				position: {
					x:  0,
					y: -1/2 * height + 64 + 16
				}
			});

			this.setEntity('code', entity);



			var ox = -56;
			var oy = -20;
			var x = 0;
			var y = 0;

			for (var n = 1; n <= 9; n++) {

				var button = new lychee.ui.Button({
					label: n + '',
					font:  this.game.fonts.normal,
					position: {
						x: ox + x * 56,
						y: oy + y * 48
					}
				});

				button.bind('#touch', _enter_number, this);

				this.addEntity(button);

				x++;

				if (x >= 3) {
					x %= 3;
					y++;
				}

			}



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

			this.getEntity('code').setLabel('* * * *');
			this.getEntity('message').setVisible(false);


			var service = this.game.services.multiplayer;
			if (service !== null) {

				service.bind('start',  _on_start,  this);
				service.bind('stop',   _on_stop,   this);
				service.bind('update', _on_update, this);
				service.bind('error',  _on_error,  this);

			}

		},

		leave: function() {

			this.getEntity('code').setLabel('* * * *');
			this.getEntity('message').setVisible(false);


			var service = this.game.services.multiplayer;
			if (service !== null) {

				service.unbind('start',  _on_start,  this);
				service.unbind('stop',   _on_stop,   this);
				service.unbind('update', _on_update, this);
				service.unbind('error',  _on_error,  this);

				service.leave();

			}

		}

	};


	return Class;

});

