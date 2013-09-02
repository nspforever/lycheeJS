
lychee.define('game.logic.Controller').requires([
	'game.entity.Ship'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var _ship = game.entity.Ship;



	/*
	 * HELPERS
	 */

	var _validate_enum = function(enumobject, value) {

		if (typeof value !== 'number') return false;


		var found = false;

		for (var id in enumobject) {

			if (value === enumobject[id]) {
				found = true;
				break;
			}

		}


		return found;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(id, data) {

		var settings = lychee.extend({}, data);


		this.id = id || null;

		this.mode  = Class.MODE.local;
		this.ship  = null;

		this.setMode(settings.mode);
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

		control: function(data) {

			data.id     = typeof data.id === 'string'     ? data.id     : null;
			data.method = typeof data.method === 'string' ? data.method : null;
			data.args   = data.args instanceof Array      ? data.args   : null;


			if (
				   data.id !== null
				&& data.id === this.id
				&& data.method !== null
				&& data.args !== null
			) {

				var method = data.method;
				var args   = data.args;
				if (typeof this[method] === 'function') {
					this[method].apply(this, args);
				}

			}

		},



		/*
		 * LOGIC INTEGRATION
		 */

		processKey: function(key) {

			var ship = this.ship;
			if (ship !== null) {

				switch(key) {

					case 'left':  case 'a': ship.left();  break;
					case 'down':  case 's': ship.stop();  break;
					case 'right': case 'd': ship.right(); break;
					case 'up':    case 'w': ship.fire();  break;
					case 'space':           ship.fire();  break;

				}

			}


			if (this.mode === Class.MODE.online) {

				var data = {
					id:     this.id,
					method: 'processKey',
					args:   [ key ]
				};

				this.trigger('control', [ data ]);

			}

		},

		processTouch: function(position) {

			if (this.mode !== Class.MODE.local) return;


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

			}

		},



		/*
		 * CUSTOM API
		 */

		setMode: function(mode) {

			if (_validate_enum(Class.MODE, mode) === true) {

				this.mode = mode;

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

