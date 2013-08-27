
lychee.define('game.logic.Game').requires([
	'game.entity.Background',
	'game.entity.Shield',
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



	/*
	 * HELPERS
	 */

	var _get_ship_level = function(points, downgrade) {

		downgrade = downgrade === true;


		var shiplevel = 0;

		for (var lvlid in _config.upgrade) {

			var lvl = parseInt(lvlid, 10);
			var min = _config.upgrade[lvl];

			if (points > min) {
				shiplevel = lvl;
			}

		}


		if (downgrade === true) {

			shiplevel = -1;


			for (var lvlid in _config.downgrade) {

				var lvl = parseInt(lvlid, 10);
				var min = _config.downgrade[lvlid].min;
				var max = _config.downgrade[lvlid].max;

				if (points > min && points < max) {
					shiplevel = lvl;
				}

			}

		}


		return shiplevel;

	};

	var _process_update = function(data, downgrade) {

return;

		downgrade = downgrade === true;


		var ship     = this.__level.getShip();
		var oldstate = ship.state;

		var oldlvl = 0;
		if (oldstate !== 'default') {
			oldlvl = parseInt(oldstate.substr(-1), 10);
		}

		var newlvl = _get_ship_level(data.points, downgrade);


		if (
			   oldlvl !== newlvl
			&& newlvl !== -1
		) {

			if (newlvl > oldlvl) {
				ship.setState('upgrade'   + newlvl);
				data.health = 100;
			} else if (newlvl < oldlvl) {
				ship.setState('downgrade' + oldlvl);
			}


			if (this.game.settings.sound === true) {
				this.jukebox.play('ship-transformation');
			}


			this.loop.timeout(1000, function() {

				var state = ship.state;
				if (state.substr(0, 7) === 'upgrade') {

					var lvl = parseInt(state.substr(-1), 10);
					ship.setState('level' + lvl);

				} else if (state.substr(0, 9) === 'downgrade') {

					var lvl = parseInt(state.substr(-1), 10);
					if (!isNaN(lvl)) {

						lvl--;

						if (lvl > 0) {
							ship.setState('level' + lvl);
						} else {
							ship.setState('default');
						}

					}

				}

			}, this);

		}


		this.trigger('update', [ data ]);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game) {

		this.game     = game;
		this.jukebox  = game.jukebox;
		this.loop     = game.loop;
		this.renderer = game.renderer;

		this.__scrollOffset = 0;

		this.__background = null;
		this.__level      = null;
		this.__width      = null;
		this.__height     = null;

		this.__stage      = null;
		this.__session    = { ship: null, stage: null };
		this.__isRunning  = false;

		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * PRIVATE API
		 */

		__processSuccess: function(data) {
			this.__isRunning = false;
			this.trigger('success', [ data ]);
		},

		__processFailure: function(data) {
			this.__isRunning = false;
			this.trigger('failure', [ data ]);
		},



		/*
		 * LOGIC INTERACTION
		 */

		spawn: function(construct, posarray, velarray, owner) {

			posarray = posarray instanceof Array ? posarray : null;
			velarray = velarray instanceof Array ? velarray : null;
			owner    = typeof owner === 'string' ? owner    : null;


			if (
				   posarray !== null
				&& velarray !== null
				&& posarray.length === velarray.length
			) {

				if (construct === _lazer) {

					if (this.game.settings.sound === true) {
						this.jukebox.play('ship-lazer');
					}


					var data = this.__level.data;
					for (var a = 0, al = posarray.length; a < al; a++) {
						data.points -= 10;
					}


					_process_update.call(this, data, true);

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

			if (this.__level !== null) {
				this.__level.unbind('failure');
				this.__level.unbind('success');
				this.__level.unbind('update');
			}

			this.__width  = width;
			this.__height = height;


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


			this.__background = new _background({
				width:  width,
				height: height
			});


			_process_update.call(this, this.__level.data, true);

			this.__isRunning = true;

		},

		leave: function() {

			this.__session.ships  = this.__level.ships;
			this.__session.stage  = this.__stage;
			this.__session.points = this.__level.data.points;

		},

		update: function(clock, delta) {

			var level = this.__level;
			if (level === null) return;


    		var ship = level.ships[0];
			var miny = -1/2 * this.__height;
			var maxy =  1/2 * this.__height;


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


					var owner = entity.owner;

					for (var e2 = 0; e2 < entities.length; e2++) {

						var oentity = entities[e2];
						var otype   = oentity.type;
						if (owner === otype) continue;


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


			this.__scrollOffset += config.scrolly;



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

