
lychee.define('game.entity.ui.game.HUD').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, game, global, attachments) {

	var _config  = attachments["json"];
	var _font    = attachments["fnt"];
	var _texture = attachments["png"];



	/*
	 * HELPERS
	 */

	var _get_level = function(points) {

		var level = 0;


		var logic = this.game.logic;
		if (logic !== null) {

			var config = logic._config.level;

			for (var levelid in config) {

				if (points > config[levelid]) {
					level = parseInt(levelid, 10);
				}

			}

		}


		return level;

	};

	var _get_points = function(level) {

		var points = 999999999;

		var logic = this.game.logic;
		if (logic !== null) {
			points = logic._config.level[level];
		}


		return points;

	};

	var _format_points = function(points) {

		var pre = '';
		var str = points + '';

		for (var l = str.length; l < 9; l++) {
			pre += '0';
		}

		return pre + str;

	};

	var _process_update = function(player1, player2) {

		_process_update_player.call(this, this.__player1, player1 || null);
		_process_update_player.call(this, this.__player2, player2 || null);

	};

	var _process_update_player = function(player, data) {

		if (data === null) return;

		var shield  = player.shield;
		var upgrade = player.upgrade;
		var level   = _get_level.call(this, data.points);

		shield.w  = shield._x  + (shield._w  * (data.health / 100));
		upgrade.w = upgrade._x + (upgrade._w * (data.points / _get_points.call(this, level + 1)));

		player.points = _format_points(data.points);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings, game) {

		if (settings === undefined) {
			settings = {};
		}

		this.game    = game || null;
		this.font    = _font;
		this.texture = _texture;


		this.__player1 = {};
		this.__player1.shield  = lychee.extend({}, _config.map.shield);
		this.__player1.upgrade = lychee.extend({}, _config.map.upgrade);
		this.__player1.points  = '000000000';

		this.__player2 = {};
		this.__player1.shield  = lychee.extend({}, _config.map.shield);
		this.__player1.upgrade = lychee.extend({}, _config.map.upgrade);
		this.__player1.points  = '000000000';


		settings.width  = _config.width;
		settings.height = _config.height;
		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;


		lychee.ui.Entity.call(this, settings);

		settings = null;


		this.bind('update', _process_update, this);


		this.reset();

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		reset: function() {

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var map     = _config.map;
			var player1 = this.__player1;

			var font    = this.font;
			var texture = this.texture;
			if (
				   font !== null
				&& texture !== null
			) {

				var position = this.position;

				var x1 = position.x + offsetX - this.width / 2;
				var y1 = position.y + offsetY - this.height / 2;


				renderer.drawSprite(x1,      y1,      texture, map.background);

				renderer.drawSprite(x1,      y1 +  8, texture, map.bar);
				renderer.drawSprite(x1,      y1 +  8, texture, player1.shield);
				renderer.drawSprite(x1,      y1 + 48, texture, map.bar);
				renderer.drawSprite(x1,      y1 + 48, texture, player1.upgrade);

				renderer.drawText(  x1 + 12, y1 + 90, player1.points, font);

			}

		}

	};


	return Class;

});

