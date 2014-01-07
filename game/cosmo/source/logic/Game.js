
lychee.define('game.logic.Game').requires([
	'game.entity.Background',
	'game.entity.Shield',
	'game.logic.Controller',
	'game.logic.Level',
	'lychee.game.Layer'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var _config = attachments["json"];


	var _background = game.entity.Background;
	var _blackhole  = game.entity.Blackhole;
	var _enemy      = game.entity.Enemy;
	var _lazer      = game.entity.Lazer;
	var _meteor     = game.entity.Meteor;
	var _shield     = game.entity.Shield;
	var _ship       = game.entity.Ship;

	var _controller = game.logic.Controller;
	var _level      = game.logic.Level;



	/*
	 * HELPERS
	 */

	var _get_level_ship = function(ship) {

		var level = 0;

		var state = ship.state;
		if (state.substr(0, 5) === 'level') {

			level = parseInt(state.substr(-1), 10);

		} else if (
			   state.substr(0, 7) === 'upgrade'
			|| state.substr(0, 9) === 'downgrade'
		) {

			level = -1;

		}


		return isNaN(level) ? 0 : level;

	};

	var _get_level_points = function(points) {

		var level = -1;

		for (var levelid in _config.level) {

			var current = parseInt(levelid, 10);
			var next    = current + 1;

			var currentmin = _config.level[current];
			var nextmin    = _config.level[next] || Infinity;

			if (
				   points > currentmin
				&& points < nextmin
			) {
				level = current;
			}

		}


		return level;

	};

	var _process_update = function(player1, player2) {

		var ship1 = this.__level.ships[0];
		var ship2 = this.__level.ships[1];


		_process_update_player.call(this, player1, ship1);

		if (
			   player2 !== undefined
			&& ship2 !== undefined
		) {
			_process_update_player.call(this, player2, ship2);
		}


		this.trigger('update', [ player1, player2 ]);

	};

	var _process_update_player = function(data, ship) {

		var oldlevel = _get_level_ship(ship);
		var newlevel = _get_level_points(data.points);

		if (
			   oldlevel !== newlevel
			&& oldlevel !== -1
			&& newlevel !== -1
		) {

			if (newlevel > oldlevel) {
				ship.setState('upgrade' + newlevel);
				data.health = 100;
//			} else if (newlevel < oldlevel) {
//				ship.setState('downgrade' + newlevel);
			}


			if (this.game.settings.sound === true) {
				this.jukebox.play('ship-transformation');
			}


			this.loop.timeout(1000, function() {

				var state = this.state;
				if (state.substr(0, 7) === 'upgrade') {

					var level = parseInt(state.substr(-1), 10);
					this.setState('level' + level);

//				} else if (state.substr(0, 9) === 'downgrade') {
//
//					var level = parseInt(state.substr(-1), 10) - 1;
//					if (level > 0) {
//						this.setState('level' + level);
//					} else {
//						this.setState('default');
//					}
//
				}

			}, ship);

		}

	};



	var _interval = function() {

		var level = this.__level;
		if (level === null) return;


		var controllers = this.controllers;
		if (controllers.length > 1) {

			for (var c = 0, cl = controllers.length; c < cl; c++) {
				controllers[c].sync();
			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game) {

		this.game     = game;
		this.jukebox  = game.jukebox;
		this.loop     = game.loop;
		this.renderer = game.renderer;

		this.controller  = null;
		this.controllers = [];


		this.__background = null;
		this.__level      = null;
		this.__width      = null;
		this.__height     = null;
		this.__stage      = null;
		this.__session    = { ships: [], stage: null };
		this.__interval   = null;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * PRIVATE API
		 */

		__processSuccess: function(data) {
			this.trigger('success', [ data ]);
		},

		__processFailure: function(data) {
			this.trigger('failure', [ data ]);
		},



		/*
		 * LOGIC INTERACTION
		 */

		spawn: function(construct, posarray, velarray, owner) {

			posarray = posarray instanceof Array ? posarray : null;
			velarray = velarray instanceof Array ? velarray : null;
			owner    = owner !== undefined       ? owner    : null;


			if (
				   posarray !== null
				&& velarray !== null
				&& posarray.length === velarray.length
			) {

				if (construct === _lazer) {

					if (this.game.settings.sound === true) {
						this.jukebox.play('ship-lazer');
					}

					var data  = null;
					var index = this.__level.ships.indexOf(owner);
					if (index !== -1) {

						data = this.__level.data[index];

						for (var a = 0, al = posarray.length; a < al; a++) {
							data.points -= 10;
						}

						_process_update.apply(this, this.__level.data);

					}

				}


				for (var a = 0, al = posarray.length; a < al; a++) {

					var pos = posarray[a];
					var vel = velarray[a];


					this.__level.spawn(
						construct,
						pos.x,
						pos.y,
						vel.x,
						vel.y,
						owner
					);

				}

			}

		},



		/*
		 * PUBLIC API
		 */

		enter: function(stage, width, height) {

			/*
			 * CLEANUP
			 */

			for (var c = 0, cl = this.controllers.length; c < cl; c++) {
				this.controllers[c].setService(null);
			}

			this.controller  = null;
			this.controllers = [];

			if (this.__level !== null) {
				this.__level.unbind('failure');
				this.__level.unbind('success');
				this.__level.unbind('update');
			}

			this.__width  = width;
			this.__height = height;



			/*
			 * LEVEL SETUP
			 */

			var data = {
				points: null,
				width:  width,
				height: height,
				ships:  stage.type === 'multiplayer' ? 2 : 1,
				level:  stage.level
			};


			var newstage = data.level;
			var oldstage = this.__session.stage;
			if (oldstage !== null) {

				var oldstglvl = parseInt(oldstage.substr(-1), 10);
				var newstglvl = parseInt(newstage.substr(-1), 10);

				if (newstglvl > oldstglvl) {
					data.ships  = this.__session.ships;
					data.points = this.__session.points;
				}

			}


			this.__level = new game.logic.Level(data, this);
//			this.__level.bind('failure', this.__processFailure, this);
//			this.__level.bind('success', this.__processSuccess, this);
			this.__level.bind('update',  _process_update, this);
			this.__stage = newstage;



			/*
			 * CONTROLLER SETUP
			 */

			if (stage.type === 'singleplayer') {


				var ship = this.__level.ships[0];

				ship.setColor('red');

				var controller = new _controller(stage.players[0], {
					mode: _controller.MODE.local,
					ship: ship
				});

				this.controllers.push(controller);
				this.controller = controller;


			} else if (stage.type === 'multiplayer') {

				var colors  = [ 'red', 'blue', 'green' ];
				var service = this.game.services.multiplayer;

				for (var p = 0, pl = stage.players.length; p < pl; p++) {

					var ship = this.__level.ships[p];

					ship.setColor(colors[p % 3]);

					var controller = new _controller(stage.players[p], {
						mode:    _controller.MODE.online,
						service: service,
						ship:    ship
					});

					this.controllers.push(controller);


					if (p === stage.player) {
						this.controller = controller;
					}

				}

			}



			/*
			 * BACKGROUND SETUP
			 */

			this.__background = new _background({
				width:  width,
				height: height
			});


			this.__interval = this.loop.interval(1000, _interval, this);


			_process_update.apply(this, this.__level.data);

		},

		leave: function() {

			this.__session.ships  = this.__level.ships;
			this.__session.stage  = this.__stage;
			this.__session.points = this.__level.data.points;


			var interval = this.__interval
			if (interval !== null) {
				interval.clear();
			}


			/*
			 * CLEANUP TODO: Evaluate if cleanup is necessary
			 */

/*
			for (var c = 0, cl = this.controllers.length; c < cl; c++) {
				this.controllers[c].setService(null);
			}

			this.controller  = null;
			this.controllers = [];
*/

		},

		update: function(clock, delta) {

			var level = this.__level;
			if (level === null) return;


    		var ship = level.ships[0];
			var miny = -1/2 * this.__height;
			var maxy =  1/2 * this.__height;
			var minx = -1/2 * this.__width;
			var maxx =  1/2 * this.__width;


			var config = {
				scrollx:  (delta / 1000) * ship.speedx,
				scrolly:  (delta / 1000) * ship.speedy,
				entities: level.entities,
				width:    this.__width,
				height:   this.__height
			};


 			var shiphits  = 0;
			var enemyhits = 0;

			var entities = level.entities;
			for (var e = 0; e < entities.length; e++) {

				var entity   = entities[e];
				var position = entity.position;
				var type     = entity.type;


				entity.update(clock, delta, config);


				if (type === 'ship') {

					for (var e2 = 0; e2 < entities.length; e2++) {

						var oentity = entities[e2];
						var otype   = oentity.type;

						if (otype === 'meteor') {

							if (entity.collidesWith(oentity) === true) {
								enemyhits += level.collide(oentity, entity);
								shiphits++;
								entity.shield.setState('flicker');
							}

						}

					}

				} else if (type === 'lazer') {

					if (
						   position.y < miny
						|| position.y > maxy
					) {
						level.destroy(entity, false);
						continue;
					}

					if (position.x < minx) position.x = maxx;
					if (position.x > maxx) position.x = minx;


					var ownertype = entity.ownertype;

					for (var e2 = 0; e2 < entities.length; e2++) {

						var oentity = entities[e2];
						var otype   = oentity.type;
						if (ownertype === otype) continue;


						if (
							   otype === 'enemy'
							|| otype === 'meteor'
						) {

							if (entity.collidesWith(oentity) === true) {
								enemyhits += level.collide(entity, oentity);
							}

						} else if (
							otype === 'ship'
						) {

							if (entity.collidesWith(oentity) === true) {
								enemyhits += level.collide(entity, oentity);
								shiphits++;
								oentity.shield.setState('flicker');
							}

						}

					}


				} else if (
					   type === 'blackhole'
					|| type === 'enemy'
					|| type === 'meteor'
				) {

					if (position.y > maxy) {
						level.destroy(entity, false);
						continue;
					}

				}

			}



			var background = this.__background;
			if (background !== null) {

				var origin = background.origin;

				background.setOrigin({
					x: origin.x - config.scrollx,
					y: origin.y + config.scrolly
				});

			}


			if (enemyhits !== 0) {

				if (this.game.settings.sound === true) {
					this.jukebox.play('explosion');
				}

			}

			if (shiphits > 0) {

				if (this.game.settings.sound === true) {
					this.jukebox.play('ship-shield');
				}

			}

		},

		render: function(clock, delta) {

			var renderer = this.renderer;
			var level    = this.__level;
			if (
				renderer !== null
				&& level !== null
			) {

				var offsetX = this.__width / 2;
				var offsetY = this.__height / 2;


				var background = this.__background;
				if (background !== null) {

					background.render(
						renderer,
						offsetX,
						offsetY
					);

				}


				var entities = level.entities;
				for (var e = 0, el = entities.length; e < el; e++) {

					var entity = entities[e];
					if (entity.type === 'ship') continue;

					entity.render(
						renderer,
						offsetX,
						offsetY
					);

				}


				var ships = level.ships;
				for (var s = 0, sl = ships.length; s < sl; s++) {

					var ship = ships[s];

					ship.render(
						renderer,
						offsetX,
						offsetY
					);

				}

			}

		}

	};


	return Class;

});

