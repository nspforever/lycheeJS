
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

	var _get_code = function() {

		var result = null;


		var code = this.getEntity('code');
		if (code !== null) {

			var tmp = parseInt(code.label.split(' ').join(''), 10);
			if (!isNaN(tmp)) {
				result = tmp;
			}

		}


		return result;

	};

	var _validate_code = function() {

		var result = true;


		var code = this.getEntity('code');
		if (code !== null) {

			var tmp = code.label.split(' ');

			for (var t = 0, tl = tmp.length; t < tl; t++) {
				if (tmp[t] === '*') {
					result = false;
					break;
				}
			}

		}


		return result;

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
				state: 'blank'
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

				button.bind('#touch', this.processNumber, this);

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

			this.resetCode();
			this.setMessage(null);


			var service = this.game.services.multiplayer;
			if (service !== null) {

				service.bind('verification', function(data) {

console.log('WOOT WOOT', data);

					if (data.code === null) {

						this.resetCode();

						if (typeof data.message === 'string') {
							this.setMessage(data.message);
						}

					} else {

						if (typeof data.message === 'string') {
							this.setMessage(data.message);
						}

					}

				}, this);

			}

		},

		leave: function() {

			var service = this.game.services.multiplayer;
			if (service !== null) {
				service.unbind('verification');
			}

		},

		resetCode: function() {
			this.getEntity('code').setLabel('* * * *');
			_validate_code.call(this);
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

		},

		processNumber: function(entity, id, position, delta) {

			var code = this.getEntity('code');
			var tmp  = code.label.split(' ');

			if (typeof entity.label === 'string') {

				var number = entity.label;
				tmp[this.__cursor] = number;

				code.setLabel(tmp.join(' '));
				_validate_code.call(this);

			}

			this.__cursor++;


			if (this.__cursor === 4) {

				this.__cursor %= 4;


				var service = this.game.services.multiplayer;
				if (service !== null) {

					service.enter({
						code: _get_code.call(this)
					});

				}

			}

		}

	};


	return Class;

});

