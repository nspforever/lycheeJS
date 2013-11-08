
lychee.define('game.net.client.Entity').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(client) {

		this.id     = 'entity';
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

		update: function(data) {

			data.projectroot = typeof data.projectroot === 'string' ? data.projectroot : null;


			this.client.send({
				projectroot: data.projectroot
			}, {
				id:     this.id,
				method: 'update'
			});

		}

	};


	return Class;

});

