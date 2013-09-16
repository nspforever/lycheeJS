
lychee.define('game.entity.Font').includes([
	'lychee.ui.Font'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(name) {

		name = typeof name === 'string' ? name : null;


		lychee.ui.Font.call(this, attachments);


		return this.deserialize(name);

	};


	Class.prototype = {

		serialize: function(name) {

			return {
				'constructor': 'game.entity.Font',
				'arguments':   [ name ]
			}

		}

	};


	return Class;

});

