
lychee.define('game.entity.ui.ResultLayer').requires([
	'lychee.ui.Button',
	'lychee.ui.Sprite'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"];

	var _sprite = lychee.ui.Sprite;
	var _spriteconfig = {
		texture: _texture,
		width:   _config.width,
		height:  _config.height,
		states:  _config.states,
		map:     _config.map
	};



	/*
	 * HELPERS
	 */

	var _show_statistics = function(data) {
	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings, game, gamestate) {

		// Required because of Font integration
		this.game        = game;
		this.__gamestate = gamestate;


		if (settings === undefined) {
			settings = {};
		}


		settings.width  = 512;
		settings.height = 312;
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
				font: this.game.fonts.headline,
				position: {
					x:  0,
					y: -1/2 * height - 24 - 16
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

				var stglvl = this.__gamestate.stagelevel;

				this.__gamestate.leave();
				this.__gamestate.enter(stglvl);

			}, this);
			this.setEntity('restart', entity);


			entity = new lychee.ui.Sprite(_spriteconfig);
			entity.setState('continue');
			entity.setPosition({
				x: 128,
				y: 156 - 32
			});
			entity.bind('touch', function() {

				var stglvl = parseInt(this.__gamestate.stagelevel.substr(-1), 10);

				this.__gamestate.leave();
				this.__gamestate.enter('stage' + (stglvl + 1));

			}, this);
			this.setEntity('continue', entity);

		},



		/*
		 * CUSTOM API
		 */

		success: function(data) {

			var headline = this.getEntity('headline');

			headline.setLabel('STAGE CLEAR');


			var restart = this.getEntity('restart');
			var continu = this.getEntity('continue');

			restart.visible = false;
			continu.visible = true;

			_show_statistics.call(this, data);

		},

		failure: function(data) {

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

