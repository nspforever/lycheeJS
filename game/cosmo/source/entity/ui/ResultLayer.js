
lychee.define('game.entity.ui.ResultLayer').requires([
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

	var _show_statistics = function(data) {

		var percentage = data.destroyed / (data.destroyed + data.missed) * 100;
		var hits       = (percentage + '').substr(0, 5) + '%';
		var shield     = (data.health < 0 ? 0 : data.health) + '%';
		var score      = data.points + '';


		if (hits === 'NaN%') {
			hits = '0%';
		}

		var rank = 'A';
		if (percentage < 80 || isNaN(percentage)) {

			rank = 'B';

			if (data.health < 50) {
				rank = 'C';
			}

		}


		var ehits   = this.getEntity('hits');
		var eshield = this.getEntity('shield');
		var escore  = this.getEntity('score');

		var maxlength = Math.max(
			'Hits:   '.length + hits.length,
			'Shield: '.length + shield.length,
			'Score:  '.length + score.length
		);


		for (var l = 'Hits:   '.length + hits.length; l < maxlength; l++) {
			hits = ' ' + hits;
		}

		for (var l = 'Shield: '.length + shield.length; l < maxlength; l++) {
			shield = ' ' + shield;
		}

		for (var l = 'Score:  '.length + score.length; l < maxlength; l++) {
			score = ' ' + score;
		}


		  ehits.setLabel('Hits:   ' + hits);
		eshield.setLabel('Shield: ' + shield);
		 escore.setLabel('Score:  ' + score);


		this.getEntity('rank').setLabel('Rank:'     + rank);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings, game, state) {

		// Required because of Font integration
		this.game   = game;
		this._state = state;


		if (settings === undefined) {
			settings = {};
		}


		settings.width  = _config.width;
		settings.height = _config.height;
		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;

		settings.position = {
			x: 0,
			y: 0
		};


		lychee.ui.Layer.call(this, settings);

		settings = null;


		this.reset();

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		reset: function() {

			lychee.ui.Layer.prototype.reset.call(this);


			var entity = null;
			var width  = this.width;
			var height = this.height;


			entity = new lychee.ui.Sprite(_spriteconfig);
			entity.width  = width;
			entity.height = height;
			entity.setState('background');
			this.addEntity(entity);



			entity = new lychee.ui.Button({
				label: 'Game Over',
				font: this.game.fonts.normal,
				position: {
					x:  0,
					y: -1/2 * height + 32
				}
			});

			this.setEntity('headline', entity);



			entity = new lychee.ui.Sprite(_spriteconfig);
			entity.setState('menu');
			entity.setPosition({
				x: -128,
				y:  156 - 32
			});
			entity.bind('touch', function() {
				this.game.changeState('menu');
			}, this);
			this.setEntity('menu', entity);


			entity = new lychee.ui.Sprite(_spriteconfig);
			entity.setState('restart');
			entity.setPosition({
				x: 128,
				y: 156 - 32
			});
			entity.bind('touch', function() {

				var level = this._state.stage.level;

				this._state.leave();
				this._state.enter({
					level: level
				});

			}, this);
			this.setEntity('restart', entity);


			entity = new lychee.ui.Sprite(_spriteconfig);
			entity.setState('continue');
			entity.setPosition({
				x: 128,
				y: 156 - 32
			});
			entity.bind('touch', function() {

				var level = parseInt(this._state.stage.level.substr(-1), 10);

				this._state.leave();
				this._state.enter({
					level: 'stage' + (level + 1)
				});

			}, this);
			this.setEntity('continue', entity);


			entity = new lychee.ui.Button({
				font: this.game.fonts.small,
				position: {
					x: 0,
					y: -48
				}
			});
			this.setEntity('hits', entity);

			entity = new lychee.ui.Button({
				font: this.game.fonts.small,
				position: {
					x: 0,
					y: -24
				}
			});
			this.setEntity('shield', entity);

			entity = new lychee.ui.Button({
				font: this.game.fonts.small,
				position: {
					x: 0,
					y: 0
				}
			});
			this.setEntity('score', entity);


			entity = new lychee.ui.Button({
				font: this.game.fonts.normal,
				position: {
					x: 0,
					y: 48
				}
			});
			this.setEntity('rank', entity);


			this.__hits = entity;

		},



		/*
		 * CUSTOM API
		 */

		processSuccess: function(data) {

			var headline = this.getEntity('headline');

			headline.setLabel('STAGE CLEAR');


			var restart = this.getEntity('restart');
			var continu = this.getEntity('continue');

			restart.visible = false;
			continu.visible = true;

			_show_statistics.call(this, data);

		},

		processFailure: function(data) {

			var headline = this.getEntity('headline');

			headline.setLabel('GAME OVER');


			var restart = this.getEntity('restart');
			var continu = this.getEntity('continue');

			restart.visible = true;
			continu.visible = false;

			_show_statistics.call(this, data);

		}

	};


	return Class;

});

