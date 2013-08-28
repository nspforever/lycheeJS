
lychee.define('lychee.game.Controller').requires([
	'lychee.net.client.ControllerService'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _unbind_client = function(client) {

		if (client === null) return;

	};


	var _bind_client = function(client) {

		if (client === null) return;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.client = null;
		this.entity = null;


		this.setClient(settings.client);
		this.setEntity(settings.entity);


		settings = null;

	};


	Class.prototype = {

		setClient: function(client) {

			if (
				   client instanceof Object
				&& typeof client.send === 'method'
			) {

				_unbind_client.call(this, this.client);

				this.client = client;

				_bind_client.call(this, this.client);

			}

		},

		setEntity: function(entity) {

			if (
				   entity instanceof Object
				&& typeof entity.serialize === 'function'
			) {

				this.entity = entity;

			}

		}

	};


	return Class;

});

