
lychee.define('game.entity.ui.HUDLayer').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"];


	// TODO: Evaluate if it makes sense to query Assets
	// of other lychee.DefinitionBlocks
	var _gameconfig = new lychee.Preloader().get('./source/logic/Game.json');



	/*
	 * HELPERS
	 */

	var _get_level = function(points) {

		var currentlvl = 0;
		for (var lvlid in _gameconfig.upgrade) {
			if (_gameconfig.upgrade[lvlid] < points) {
				currentlvl = parseInt(lvlid, 10);
			}
		}

		return isNaN(currentlvl) ? 0 : currentlvl;

	};

	var _get_points = function(points) {

		points = points >= 0 ? points : 0;


		var pre = '';
		var str = points + '';
		if (str.length < 8) {

			for (var l = str.length; l < 8; l++) {
				pre += '0';
			}

		}

		return pre + points;

	};

	var _process_update = function(data, index) {

		var level   = this.__map.level;
		var points  = this.__map.points;
		var shield  = this.__map.shield;
		var upgrade = this.__map.upgrade;

		level     =  _get_level(data.points);
		points    =  _get_points(data.points);

		shield.w  = shield._x  + (shield._w  * (data.health / 100));
		upgrade.w = upgrade._x + (upgrade._w * (data.points / (_gameconfig.upgrade['' + (level + 1)] || 999999999)));

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings, game, gamestate) {


		if (settings === undefined) {
			settings = {};
		}


		this.texture = _texture;

		this.__font           = game.fonts.hud;
		this.__points         = '00000000';
		this.__map            = {};
		this.__map.background = _config.map.background;
		this.__map.bar        = _config.map.bar;

		var shield = _config.map.shield;
		this.__map.shield = {
			x:  shield.x,   y: shield.y,
			w:  shield.w,   h: shield.h,
			_w: shield._w, _x: shield._x
		};

		var upgrade = _config.map.upgrade;
		this.__map.upgrade = {
			x:  upgrade.x,   y: upgrade.y,
			w:  upgrade.w,   h: upgrade.h,
			_w: upgrade._w, _x: upgrade._x
		};


		settings.width  = _config.width;
		settings.height = _config.height;
		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;


		lychee.ui.Entity.call(this, settings);

		settings = null;


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


			var map = this.__map;

			var texture = this.texture;
			if (texture !== null) {

				var position = this.position;

				var x1 = position.x + offsetX - this.width / 2;
				var y1 = position.y + offsetY - this.height / 2;


				renderer.drawSprite(
					x1,
					y1,
					texture,
					map.background
				);


				renderer.drawSprite(
					x1,
					y1 + 8,
					texture,
					map.bar
				);

				renderer.drawSprite(
					x1,
					y1 + 8,
					texture,
					map.shield
				);


				renderer.drawSprite(
					x1,
					y1 + 48,
					texture,
					map.bar
				);

				renderer.drawSprite(
					x1,
					y1 + 48,
					texture,
					map.upgrade
				);


				renderer.drawText(
					x1 + 34,
					y1 + 92,
					this.__points,
					this.__font
				);

			}

		},



		/*
		 * CUSTOM API
		 */

		processUpdate: function(player1, player2) {

console.log(player1, player2);

			_process_update.call(this, player1, 0);

			if (player2 !== undefined) {
				_process_update.call(this, player2, 1);
			}

		}


	};


	return Class;

});

