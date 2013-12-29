
lychee.define('lychee.net.client.Session').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _id = 0;



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client, data) {

		var settings = lychee.extend({}, data);


		this.sid   = 'session-' + _id++;
		this.limit = 4;


		this.setSid(settings.sid);
		this.setLimit(settings.limit);

		delete settings.sid;
		delete settings.limit;


		lychee.net.Service.call(this, 'session', client, lychee.net.Service.TYPE.client);



		/*
		 * INITIALIZATION
		 */

		this.bind('sync', function(data) {

			var type = data.type;
			if (type === 'update') {

				this.sid   = data.sid;
				this.limit = data.limit;

			}


			if (
				   type === 'update'
				|| type === 'start'
				|| type === 'stop'
			) {

				var args = [{
					userid: data.userid,
					users:  data.users,
					limit:  data.limit
				}];


				this.trigger(type, args);

			}

		}, this);


		if (lychee.debug === true) {

			this.bind('error', function(error) {
				console.error('lychee.net.client.Session: ' + error.message);
			}, this);

		}


		settings = null;

	};


	Class.prototype = {

		/*
		 * SERVICE API
		 */

		// plug: function() { },
		// unplug: function() { },

		setSid: function(sid) {

			sid = typeof sid === 'string' ? sid : null;


			if (sid !== null) {

				this.sid = sid;

				return true;

			}


			return false;

		},

		setLimit: function(limit) {

			limit = typeof limit === 'number' ? limit : null;


			if (limit !== null) {

				this.limit = limit;

				return true;

			}


			return false;

		},



		/*
		 * CUSTOM API
		 */

		join: function() {

			var sid = this.sid;
			if (sid !== null) {

				var limit = this.limit;

				if (this.tunnel !== null) {

					this.tunnel.send({
						sid:   sid,
						limit: limit
					}, {
						id:    this.id,
						event: 'join'
					});

				}

			}

		},

		leave: function() {

			var sid = this.sid;
			if (sid !== null) {

				if (this.tunnel !== null) {

					this.tunnel.send({
						sid:   sid
					}, {
						id:    this.id,
						event: 'leave'
					});

				}

			}

		}

	};


	return Class;

});

