
lychee.define('game.logic.Level').requires([
	'game.entity.Blackhole',
	'game.entity.Enemy',
	'game.entity.Lazer',
	'game.entity.Meteor',
	'game.entity.Ship'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var _config    = attachments["json"];

	var _blackhole = game.entity.Blackhole;
	var _bomb      = game.entity.Bomb;
	var _enemy     = game.entity.Enemy;
	var _lazer     = game.entity.Lazer;
	var _meteor    = game.entity.Meteor;
	var _ship      = game.entity.Ship;


	(function(stages) {

		if (lychee.debug === true) {

			for (var id in stages) {
				console.log('game.Level: Stage "' + id + '": ' + stages[id].length);
			}

		}

	})(_config);



	/*
	 * HELPERS
	 */

	var _data = function() {

		this.health    = 100;
		this.points    = 0;
		this.destroyed = 0;
		this.missed    = 0;

	};

	var _translate_to_position = function(x, y) {

		var position = this.__cache;

		position.x  = 0;
		position.y  = 1/2 * this.__boundY * 80;

		position.x += 80 * x;
		position.y -= 80 * y;

		return position;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(logic, settings) {

		this.logic = logic || null;


		this.data     = [ null, null, null, null ];
		this.distance = 0;
		this.enemies  = [];
		this.entities = [];
		this.ships    = [];
		this.stage    = 'stage1';
		this.width    = 0;
		this.height   = 0;

		this.__cache  = { x: 0, y: 0 };
		this.__boundY = 0;
		this.__goalY  = 0;


		lychee.event.Emitter.call(this);

		this.reset(settings);

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		reset: function(stage) {

			this.data     = [ null, null, null, null ];
			this.enemies  = [];
			this.entities = [];
			this.ships    = [ null, null, null, null ];

			this.height   = stage.height;
			this.__boundY = ((this.height / 80) | 0);


			var ship, data;

			if (typeof stage.ships === 'number') {

				for (var s = 0; s < stage.ships; s++) {

					data = new _data();
					data.points = typeof stage.points === 'number' ? stage.points : 0;

					ship = new _ship({}, this.logic);
					ship.setData(data);
					ship.setState('default');
					ship.setHealth(data.health);
					ship.setPosition(_translate_to_position.call(this, -4 + 2 * s, 1));

					this.data[s]  = data;
					this.ships[s] = ship;
					this.entities.push(ship);

				}

			} else if (
				   stage.ships instanceof Array
				&& stage.ships[0] instanceof _ship
			) {

				for (var s = 0, sl = stage.ships.length; s < sl; s++) {

					if (stage.ships[s] === null) break;

					data = new _data();
					data.points = typeof stage.points === 'number' ? stage.points : 0;

					ship = stage.ships[s];
					ship.setData(data);
					ship.setHealth(data.health);
					ship.setPosition(_translate_to_position.call(this, 0, 1));

					this.data[s]  = data;
					this.ships[s] = ship;
					this.entities.push(ship);

				}

			}


			this.setStage(stage.level);

		},



		/*
		 * LOGIC INTEGRATION API
		 */

		addEntity: function(entity) {

			var found = false;

			for (var e = 0, el = this.entities.length; e < el; e++) {
				if (this.entities[e] === entity) {
					found = true;
				}
			}


			if (found === false) {

				this.entities.push(entity);

				if (entity instanceof _enemy) {
					this.enemies.push(entity);
				}

			}

		},

		removeEntity: function(entity) {

			for (var e = 0, el = this.entities.length; e < el; e++) {

				if (this.entities[e] === entity) {
					this.entities.splice(e, 1);
					el--;
					e--;
				}

			}


			if (entity instanceof _enemy) {

				for (var e = 0, el = this.enemies.length; e < el; e++) {

					if (this.enemies[e] === entity) {
						this.enemies.splice(e, 1);
						el--;
						e--;
					}

				}

			}

		},

		destroy: function(entity, ship, data) {


			this.removeEntity(entity);


			if (
				   entity instanceof _enemy
				|| entity instanceof _meteor
			) {

				if (ship instanceof _ship) {

					data.points += entity.points;
					data.destroyed++;

					this.trigger('update', this.data);
					this.trigger('explosion', [ entity.position.x, entity.position.y ]);

				} else {

					data.missed++;

				}

			} else if (entity instanceof _ship) {

				data.missed += this.entities.length;
				this.trigger('failure', this.data);

			}

		},

		collide: function(active, passive) {

			var health = 0;
			var diff   = 0;


			if (
				   active instanceof _lazer
				&& passive instanceof _lazer
			) {

				this.destroy(active);
				this.destroy(passive);
				diff -= 2;

			} else if (
				active instanceof _lazer
				&& (
					   passive instanceof _enemy
					|| passive instanceof _meteor
				)
			) {

				health  = passive.health;
				health -= 50;
				passive.setHealth(health);


				if (health < 0) {
					this.destroy(active);
					this.destroy(passive, active.owner, active.owner.data);
					diff -= 2;
				} else {
					this.destroy(active);
					diff -= 1;
				}

			} else if (
				(
					   active instanceof _enemy
					|| active instanceof _lazer
					|| active instanceof _meteor
				)
				&& passive instanceof _ship
			) {

				health  = passive.health;
				health -= 10;
				passive.setHealth(health);


				if (health >= 0) {

					this.destroy(active, passive, passive.data);
					diff -= 1;

					passive.data.health = health;
					this.trigger('update', this.data);

				} else {

					this.destroy(active,  passive, passive.data);
					this.destroy(passive, passive, passive.data);
					diff -= 2;

				}

			} else if (
				active instanceof _bomb
				&& (
					   passive instanceof _enemy
					|| passive instanceof _meteor
				)
			) {

				var x     = active.position.x;
				var y     = active.position.y;
				var rdist = 400;


				this.destroy(active);
				diff -= 1;


				for (var e = 0, el = this.entities.length; e < el; e++) {

					var entity   = this.entities[e];
					var position = entity.position;

					if (entity.type === 'meteor') {

						var dist = Math.sqrt(Math.pow(position.x - x, 2) + Math.pow(position.y - y, 2));
						if (dist <= rdist) {
							this.destroy(entity, active.owner, active.owner.data);
							diff -= 1;
							el--;
							e--;
						}

					}

				}

			}


			return diff;

		},

		setStage: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				var stage = _config[id] || null;
				if (stage === null) {
					return false;
				}


				var distance = 0;
				var offsetX  = (-1 * stage[0].length / 2) | 0;
				var offsetY  = this.__boundY;

				for (var y = 0, yl = stage.length; y < yl; y++) {

					for (var x = 0, xl = stage[y].length; x < xl; x++) {

						var pos = _translate_to_position.call(this, offsetX + x, offsetY + y);

						var raw = stage[y][x];
						if (raw === 1) {
							this.spawn(_meteor,    pos.x, pos.y);
						} else if (raw === 2) {
							this.spawn(_blackhole, pos.x, pos.y);
						} else if (raw === 3) {
							this.spawn(_enemy,     pos.x, pos.y);
						}

					}


					distance = Math.max(distance, -1 * pos.y);

				}


				this.width    = stage[0].length * 80;
				this.distance = distance + this.height;
				this.stage    = id;


				return true;

			}


			return false;

		},

		spawn: function(construct, posx, posy, velx, vely, owner) {

			construct = construct instanceof Function ? construct : null;
			posx      = posx || 0;
			posy      = posy || 0;
			velx      = velx || 0;
			vely      = vely || 0;
			owner     = owner !== undefined ? owner : null;


			if (construct !== null) {

				var entity = new construct({}, this.logic);

				entity.setPosition({
					x: posx,
					y: posy
				})

				entity.setVelocity({
					x: velx,
					y: vely
				});


				if (
					   owner !== null
					&& typeof entity.setOwner === 'function'
				) {
					entity.setOwner(owner);
				}


				this.addEntity(entity);

			}

		}

	};


	return Class;

});

