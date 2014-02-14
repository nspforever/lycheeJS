
lychee.define('game.state.Game').requires([
	'game.logic.Controller',
	'game.entity.ui.game.HUD',
	'game.entity.ui.game.Result'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _music = attachments["msc"];

	var _controller = game.logic.Controller;
	var _hud        = game.entity.ui.game.HUD;
	var _result     = game.entity.ui.game.Result;



	/*
	 * HELPERS
	 */

	var _process_update = function(player1, player2) {

		this.__hud.trigger('update', [ player1, player2 ]);

	};

	var _process_success = function(player1, player2) {

		this.logic.leave();


		if (this.game.settings.music === true) {
			_music.stop();
		}

		this.__controls.visible = false;
		this.__hud.visible      = false;
		this.__result.visible   = true;
		this.__result.trigger('success', [ player1, player2 ]);

	};

	var _process_failure = function(player1, player2) {

		this.logic.leave();


		if (this.game.settings.music === true) {
			_music.stop();
		}

		this.__hud.visible      = false;
		this.__result.visible   = true;
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
		this.__hud      = new _hud({}, game);
		this.__result   = new _result({}, game);


//		this.deserialize();

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		reset: function() {

			this.removeLayer('ui');


			var layer = new lychee.game.Layer();

			layer.addEntity(this.__hud);
			layer.addEntity(this.__result);


			var renderer = this.renderer;
			if (renderer !== null) {

				var width  = renderer.width;
				var height = renderer.height;


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


			var renderer = this.renderer;
			if (renderer !== null) {

				data.width  = typeof data.width === 'number'  ? data.width  : renderer.width;
				data.height = typeof data.height === 'number' ? data.height : renderer.height;

			}


			var logic = this.logic;
			if (logic !== null) {

				if (lychee.debug === true) {
					console.log('game.state.Game: Creating level ', data);
				}


				var level = logic.createLevel(data);


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


				logic.setLevel(level);
				logic.setShip(this.controller.ship);
				logic.enter();

			}


			this.__hud.visible    = true;
			this.__result.visible = false;


			this.game.jukebox.play(_music);


			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			this.game.jukebox.stop(_music);


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
					controller.process(key);
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

					position.x -= renderer.width / 2;
					position.y -= renderer.height / 2;

				}


				var controls = this.__controls;
				if (controls.visible === true) {
					controls.processTouch(position);
				}

			}

		}

	};


	return Class;

});
