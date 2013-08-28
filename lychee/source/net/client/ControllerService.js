
lychee.define('lychee.net.client.ControllerService').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global) {

	var Class = function(client) {

		this.id      = 'controller';
		this.client  = client;
		this.session = null;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * SERVICE API
		 */

		init: function() {
			this.trigger('init', []);
		},



		/*
		 * CUSTOM API
		 */

		enter: function(data) {

			if (typeof data.code === 'number') {

				this.client.send({
					code: data.code,
					type: data.type || null
				}, {
					id:     this.id,
					method: 'enter'
				});

			}

		}

	};


	return Class;

});

