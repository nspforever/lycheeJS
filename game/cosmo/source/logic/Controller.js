
lychee.define('game.logic.Controller').requires([
	'game.entity.Ship'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var _service = game.net.client.Multiplayer;
	var _ship    = game.entity.Ship;



	/*
	 * HELPERS
	 */

	var _on_control = function(data) {

		if (data.id === this.id) {

			var key   = data.key   || null;
			var touch = data.touch || null;

			if (key !== null)   this.processKey(key,     true);
			if (touch !== null) this.processTouch(touch, true);

		}

	};

	var _on_sync = function(data) {

		if (data.id === this.id) {

			var ship = this.ship;
			if (ship !== null) {

				ship.position.x = data.px;
				ship.position.y = data.py;

				ship.velocity.x = data.vx;
				ship.velocity.y = data.vy;

			}

		}

	};

	var _service_control = function(data) {

		data.id    = this.id;
		data.key   = data.key   || null;
		data.touch = data.touch || null;


		if (this.service !== null) {
			this.service.control(data);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(id, data) {

		var settings = lychee.extend({}, data);


		this.id = id || null;

		this.mode    = Class.MODE.local;
		this.service = null;
		this.ship    = null;

		this.setMode(settings.mode);
		this.setService(settings.service);
		this.setShip(settings.ship);


		lychee.event.Emitter.call(this);

		settings = null;

	};


	Class.MODE = {
		local:  0,
		online: 1
	};


	Class.prototype = {

		/*
		 * SERVICE INTEGRATION
		 */

		sync: function() {

			var ship = this.ship;
			if (ship !== null) {

				var data = {
					id: this.id,
					update: {
						px: ship.position.x | 0,
						py: ship.position.y | 0,
						vx: ship.velocity.x | 0,
						vy: ship.velocity.y | 0
					}
				};


				var service = this.service;
				if (service !== null) {
					service.sync(data);
				}

			}

		},



		/*
		 * LOGIC INTEGRATION
		 */

		processKey: function(key, silent) {

			silent = silent === true;


			var processed = false;

			var ship = this.ship;
			if (ship !== null) {

				switch(key) {

					case 'arrow-left':  case 'a': ship.left();  processed = true; break;
					case 'arrow-down':  case 's': ship.stop();  processed = true; break;
					case 'arrow-right': case 'd': ship.right(); processed = true; break;
					case 'arrow-up':    case 'w': ship.fire();  processed = true; break;
					case 'space':                 ship.fire();  processed = true; break;

				}

			}


			if (
				   silent === false
				&& processed === true
				&& this.mode === Class.MODE.online
			) {

				_service_control.call(this, {
					key: key
				});

			}

		},

		processTouch: function(position, silent) {

			silent = silent === true;


			var processed = false;

			var ship = this.ship;
			if (ship !== null) {

				var hwidth  = ship.width / 2;
				var centerx = ship.position.x;

				if (
					   position.x > centerx - hwidth
					&& position.x < centerx + hwidth
				) {

					ship.fire();

				} else {

					if (position.x > centerx) {
						ship.right();
					} else {
						ship.left();
					}

				}

				processed = true;

			}


			if (
				   silent === false
				&& processed === true
				&& this.mode === Class.MODE.online
			) {

				_service_control.call(this, {
					touch: {
						x: position.x,
						y: position.y
					}
				});

			}

		},



		/*
		 * CUSTOM API
		 */

		setMode: function(mode) {

			if (lychee.validate(Class.MODE, mode) === true) {

				this.mode = mode;

				return true;

			}


			return false;

		},

		setService: function(service) {

			if (service instanceof _service) {

				this.service = service;
				this.service.bind('control', _on_control, this);
				this.service.bind('sync',    _on_sync,    this);

				return true;

			} else if (service === null) {

				this.service.unbind('sync',    _on_sync,    this);
				this.service.unbind('control', _on_control, this);
				this.service = null;

				return true;

			}


			return false;

		},

		setShip: function(ship) {

			if (ship instanceof _ship) {

				this.ship = ship;

				return true;

			}


			return false;

		}

	};


	return Class;

});

