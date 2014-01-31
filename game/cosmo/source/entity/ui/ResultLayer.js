
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

	var _get_statistics = function(data) {

		var result = {};

		var percentage = data.destroyed / (data.destroyed + data.missed) * 100;

		result.hits    = (percentage + '').substr(0, 5) + '%';
		result.shield  = (data.health < 0 ? 0 : data.health) + '%';
		result.score   = data.points + '';

		if (result.hits === 'NaN%') {
			result.hits = '00.00%';
		}

		result.rank = 'A';

		if (percentage < 80 || isNaN(percentage)) {

			result.rank = 'B';

			if (data.health < 50) {
				result.rank = 'C';
			}

		}

		var length = 0;

		length = Math.max(length, result.hits.length);
		length = Math.max(length, result.shield.length);
		length = Math.max(length, result.score.length);

		result.hits   = _format_label(result.hits,   length);
		result.shield = _format_label(result.shield, length);
		result.score  = _format_label(result.score,  length);


		return result;

	};

	var _format_label = function(label, length) {

		for (var l = label.length; l < length; l++) {
			label = ' ' + label;
		}

		return label;

	};

	var _process_success = function(player1, player2) {

		var headline = this.getEntity('headline');

		headline.setLabel('STAGE CLEAR');


		var restart = this.getEntity('restart');
		var continu = this.getEntity('continue');

		restart.visible = false;
		continu.visible = true;

		_process_data.call(this, player1, player2);

	};

	var _process_failure = function(player1, player2) {

		var headline = this.getEntity('headline');

		headline.setLabel('GAME OVER');


		var restart = this.getEntity('restart');
		var continu = this.getEntity('continue');

		restart.visible = true;
		continu.visible = false;

		_process_data.call(this, player1, player2 || null);

	};

	var _process_data = function(player1, player2) {

		player1 = player1 || null;
		player2 = player2 || null;


		var hits   = this.getEntity('hits');
		var shield = this.getEntity('shield');
		var score  = this.getEntity('score');
		var rank   = this.getEntity('rank');


		if (player2 !== null) {

			var stats1 = _get_statistics(player1);
			var stats2 = _get_statistics(player2);

			hits.setLabel(  'Hits:   ' + stats1.hits   + ' | ' + stats2.hits  );
			shield.setLabel('Shield: ' + stats1.shield + ' | ' + stats2.shield);
			score.setLabel( 'Score:  ' + stats1.score  + ' | ' + stats2.score );
			rank.setLabel(  'Rank:'    + stats1.rank   + ' | ' + stats2.rank  );

		} else {

			var stats1 = _get_statistics(player1);

			hits.setLabel(  'Hits:   ' + stats1.hits  );
			shield.setLabel('Shield: ' + stats1.shield);
			score.setLabel( 'Score:  ' + stats1.score );
			rank.setLabel(  'Rank: '   + stats1.rank  );

		}

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


		this.bind('success', _process_success, this);
		this.bind('failure', _process_failure, this);


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

		}

	};


	return Class;

});

