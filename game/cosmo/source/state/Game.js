
lychee.define('game.state.Game').requires([
	'game.logic.Controller',
	'game.entity.ui.HUDLayer',
	'game.entity.ui.ResultLayer'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _controller  = game.logic.Controller;
	var _hudlayer    = game.entity.ui.HUDLayer;
	var _resultlayer = game.entity.ui.ResultLayer;



	/*
	 * HELPERS
	 */

	var _process_update = function(player1, player2) {

		this.__hud.trigger('update', [ player1, player2 ]);

	};

	var _process_success = function(player1, player2) {

		this.logic.leave();


		if (this.game.settings.music === true) {
			this.game.jukebox.stop('music-game');
		}

		this.__hud.visible    = false;
		this.__result.visible = true;
		this.__result.trigger('success', [ player1, player2 ]);

	};

	var _process_failure = function(player1, player2) {

		this.logic.leave();


		if (this.game.settings.music === true) {
			this.game.jukebox.stop('music-game');
		}

		this.__hud.visible    = false;
		this.__result.visible = true;
		this.__result.trigger('failure', [ player1, player2 ]);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game) {

		lychee.game.State.call(this, game);

		this.controllers = [];
		this.logic       = game.logic || null;

		this._leveldata = null;

		this.__result = new _resultlayer({}, game, this);
		this.__hud    = new _hudlayer({}, game, this);


		this.reset();

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		reset: function() {

			lychee.game.State.prototype.reset.call(this);


			this.removeLayer('ui');


			var layer = new lychee.game.Layer();

			layer.addEntity(this.__hud);
			layer.addEntity(this.__result);


			var renderer = this.renderer;
			if (renderer !== null) {

				var env    = renderer.getEnvironment();
				var width  = env.width;
				var height = env.height;


				this.__hud.setPosition({
					x: -1/2 * width  + 96,
					y: -1/2 * height + 64
				});

			}


			this.setLayer('ui', layer);

		},

		enter: function(data) {

			if (data === null) data = {};

			data.type    = data.type === 'multiplayer'     ? 'multiplayer' : 'singleplayer';
			data.level   = typeof data.level === 'string'  ? data.level    : 'stage1';
			data.players = data.players instanceof Array   ? data.players  : [ 'local:1337' ];
			data.player  = typeof data.player === 'string' ? data.player   : 'local:1337';


			if (
				   this.renderer !== null
				&& this.logic !== null
			) {

				var env = this.renderer.getEnvironment();

				data.width  = typeof data.width === 'number'  ? data.width  : env.width;
				data.height = typeof data.height === 'number' ? data.height : env.height;


				if (lychee.debug === true) {
					console.log('game.state.Game: Creating level ', data);
				}


				var level = this.logic.createLevel(data);


				if (data.type === 'singleplayer') {

					var player1 = new _controller(data.players[0]);
					var ship1   = level.ships[0];

					player1.setMode(_controller.MODE.local);
					player1.setShip(ship1);
					ship1.setColor('red');

					this.controller = player1;

				} else {

					var service = this.game.services.multiplayer;
					var player1 = new _controller(data.players[0]);
					var player2 = new _controller(data.players[1]);
					var ship1   = level.ships[0];
					var ship2   = level.ships[1];

					player1.setMode(_controller.MODE.online);
					player1.setService(service);
					player1.setShip(ship1);

					player2.setMode(_controller.MODE.online);
					player2.setService(service);
					player2.setShip(ship2);

					ship1.setColor('red');
					ship2.setColor('blue');


					if (data.player === data.players[0]) {
						this.controller = player1;
					} else {
						this.controller = player2;
					}

				}


				level.bind('update',  _process_update,  this);
				level.bind('success', _process_success, this);
				level.bind('failure', _process_failure, this);

				this._leveldata = data;


				this.logic.setLevel(level);
				this.logic.setShip(this.controller.ship);
				this.logic.enter();

			}


			this.__result.visible = false;
			this.__hud.visible    = true;


			if (this.game.settings.music === true) {
				this.game.jukebox.play('music-game', true);
			}


			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			if (this.game.settings.music === true) {
				this.game.jukebox.stop('music-game');
			}


			if (this.logic !== null) {

				var level = this.logic.level;
				if (level !== null) {

					level.unbind('update',  _process_update,  this);
					level.unbind('success', _process_success, this);
					level.unbind('failure', _process_failure, this);

				}

				this.logic.leave();

			}


			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			var logic = this.logic;
			if (logic !== null) {
				logic.update(clock, delta);
			}


			lychee.game.State.prototype.update.call(this, clock, delta);

		},

		render: function(clock, delta) {

			var renderer = this.renderer;
			if (renderer !== null) {

				var layer;

				var env = renderer.getEnvironment();
				var offsetX = env.width / 2;
				var offsetY = env.height / 2;


				renderer.clear();


				var logic = this.logic;
				if (logic !== null) {
					logic.render(clock, delta);
				}


				lychee.game.State.prototype.render.call(this, clock, delta, true);


				renderer.flush();

			}

		},

		processKey: function(key, name, delta) {

			var result = this.__result;
			if (result.visible === true) {

			} else {

				var controller = this.controller;
				if (controller !== null) {
					controller.processKey(key);
				}

			}

		},

		processSwipe: function(id, type, position, delta, swipe) {

			// Ignore swipe events

		},

		processTouch: function(id, position, delta) {

			var result = this.__result;
			if (result.visible === true) {

				lychee.game.State.prototype.processTouch.call(this, id, position, delta);

			} else {

				var renderer = this.renderer;
				if (renderer !== null) {

					var env = renderer.getEnvironment();

					position.x -= env.width / 2;
					position.y -= env.height / 2;

				}


				var controller = this.controller;
				if (controller !== null) {
					controller.processTouch(position);
				}

			}

		}

	};


	return Class;

});
