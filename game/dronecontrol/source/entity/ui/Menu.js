
lychee.define('game.entity.ui.Menu').requires([
	'lychee.ui.Select'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _process_drone_change = function(value) {

		var drones = this.game.settings.drones;
		if (drones !== null) {

			var ip = null;

			for (var d = 0; d < drones.length; d++) {

				var drone = drones[d];
				if (drone.id === value.substr(0, drone.id.length)) {
					ip = drones[d].ip;
					break;
				}

			}


			var controller = this.game.controller;
			if (
				   controller !== null
				&& ip !== null
			) {

				controller.setIP(ip);

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(state, settings) {

		this.state = state;
		this.game  = state.game;


		if (settings === undefined) {
			settings = {};
		}


		settings.height = 64;
		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;


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


			var options = [];
			var drones  = this.game.settings.drones;
			if (drones !== null) {

				for (var d = 0; d < drones.length; d++) {
					options.push(drones[d].id + ' (' + drones[d].ip + ')');
				}

			}


			entity = new lychee.ui.Select({
				width:    420,
				font:     this.game.fonts.normal,
				options:  options,
				value:    options[0],
				position: {
					x: 0,
					y: 0
				}
			});

			entity.bind('change', _process_drone_change, this);

			this.addEntity(entity);

		}

	};


	return Class;

});

