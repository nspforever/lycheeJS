
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

	var Class = function(id, client, data) {

		id = typeof id === 'string' ? id : 'session';


		var settings = lychee.extend({}, data);


		this.autostar = true;
		this.sid      = 'session-' + _id++;
		this.limit    = 4;


		this.setAutostart(settings.autostart);
		this.setSid(settings.sid);
		this.setLimit(settings.limit);

		delete settings.autostart;
		delete settings.sid;
		delete settings.limit;


		lychee.net.Service.call(this, id, client, lychee.net.Service.TYPE.client);



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
					sid:     this.sid,
					limit:   this.limit,
					tid:     data.tid,
					tunnels: data.tunnels
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
		 * CUSTOM API
		 */

		join: function() {

			if (this.sid !== null) {

				if (this.tunnel !== null) {

					if (lychee.debug === true) {
						console.log('lychee.net.client.Session: Joining session "' + this.sid + '"');
					}


					this.tunnel.send({
						autostart: this.autostart,
						sid:       this.sid,
						limit:     this.limit
					}, {
						id:    this.id,
						event: 'join'
					});

				}

			}

		},

		start: function() {

			if (this.sid !== null) {

				if (this.tunnel !== null) {

					this.tunnel.send({
						sid: this.sid
					}, {
						id:    this.id,
						event: 'start'
					});

				}

			}

		},

		stop: function() {

			if (this.sid !== null) {

				if (this.tunnel !== null) {

					this.tunnel.send({
						sid: this.sid
					}, {
						id:    this.id,
						event: 'stop'
					});

				}

			}

		},

		leave: function() {

			if (this.sid !== null) {

				if (this.tunnel !== null) {

					if (lychee.debug === true) {
						console.log('lychee.net.client.Session: Leaving session "' + this.sid + '"');
					}


					this.tunnel.send({
						sid:   this.sid
					}, {
						id:    this.id,
						event: 'leave'
					});

				}

			}

		},

		setAutostart: function(autostart) {

			if (autostart === true || autostart === false) {

				this.autostart = autostart;

				return true;

			}


			return false;

		},

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

		}

	};


	return Class;

});

