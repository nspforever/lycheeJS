
lychee.define('game.net.client.Project').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(client) {

		this.id     = 'project';
		this.client = client;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * SERVICE API
		 */

		init: function() {
			this.trigger('init', []);
		},

		plug: function() {

		},

		unplug: function() {

		},



		/*
		 * CUSTOM API
		 */

		update: function() {

			this.client.send({
			}, {
				id:     this.id,
				method: 'update'
			});

		}

	};


	return Class;

});

