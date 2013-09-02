
lychee.define('game.net.client.Multiplayer').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(client) {

		this.id      = 'multiplayer';
		this.client  = client;
		this.session = null;


		lychee.event.Emitter.call(this);


		this.bind('session', function(data) {

			if (data.session !== null) {
				this.session = data.session;
			}

		}, this);

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
					code: data.code
				}, {
					id:     this.id,
					method: 'enter'
				});

			}

		},

		leave: function() {

			if (this.session !== null) {

				this.client.send({
					code: this.session
				}, {
					id:     this.id,
					method: 'leave'
				});


				this.session = null;

			}

		},

		control: function(data) {

			if (
				   this.session !== null
				&& typeof data.id === 'string'
			) {

				data.code = this.session;

				this.client.send(data, {
					id:     this.id,
					method: 'control'
				});

			}

		}

	};


	return Class;

});

