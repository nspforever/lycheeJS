
lychee.define('game.entity.ui.MultiplayerLayer').requires([
	'game.entity.ui.Menu',
	'lychee.ui.Button',
	'lychee.ui.Sprite'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"];

	var _spriteconfig = {
		texture: _texture,
		width:   _config.spritewidth,
		height:  _config.spriteheight,
		states:  _config.states,
		map:     _config.map
	};



	/*
	 * HELPERS
	 */

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


		var joingame   = this.getEntity('joingame');
		var creategame = this.getEntity('creategame');

		if (result === true) {
			joingame.visible   = true;
			creategame.visible = true;
		} else {
			joingame.visible   = false;
			creategame.visible = false;
		}


		return result;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings, game) {

		this.game = game;


		settings.width  = _config.width;
		settings.height = _config.height;


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
				label: '_ _ _ _',
				font: this.game.fonts.normal,
				position: {
					x:  0,
					y: -1/2 * height + 64 + 20
				}
			});

			this.addEntity(entity);

			entity = new lychee.ui.Button({
				label: '* * * *',
				font: this.game.fonts.normal,
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
					font: this.game.fonts.normal,
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


			entity = new lychee.ui.Sprite(_spriteconfig);
			entity.setState('joingame');
			entity.setPosition({
				x: -128,
				y:  156 - 32
			});
			entity.bind('touch', function() {

				var result = _validate_code.call(this);
				if (result === true) {
					console.log('JOIN GAME');
				}

			}, this);
			this.setEntity('joingame', entity);


			entity = new lychee.ui.Sprite(_spriteconfig);
			entity.setState('creategame');
			entity.setPosition({
				x: 128,
				y: 156 - 32
			});
			entity.bind('touch', function() {

				var result = _validate_code.call(this);
				if (result === true) {
					console.log('CREATE GAME');
				}

			}, this);
			this.setEntity('creategame', entity);

		},

		resetCode: function() {
			this.getEntity('code').setLabel('* * * *');
			_validate_code.call(this);
		},

		processNumber: function(entity, id, position, delta) {

			var code = this.getEntity('code');
			var tmp  = code.label.split(' ');

			if (typeof entity.label === 'string') {

				var number = entity.label;
				tmp[this.__cursor] = number;

				this.__cursor++;
				this.__cursor %= 4;

				code.setLabel(tmp.join(' '));

				_validate_code.call(this);

			}

		}

	};


	return Class;

});

