
lychee.define('game.Controller').requires([
	'game.entity.Ship'
]).exports(function(lychee, game, global, attachments) {

	var _ship = game.entity.Ship;


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.ship = null;

		this.setShip(settings.ship);


		settings = null;

	};


	Class.prototype = {

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

