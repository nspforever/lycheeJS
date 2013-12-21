
lychee.define('lychee.net.remote.Chat').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _cache = {};

	var _on_sync = function(packet) {

		var data = packet.data;

		var user = data.user || null;
		var room = data.room || null;
		if (
			   user !== null
			&& room !== null
		) {


			var sync = false;


			// 1. Create Room
			var cache = _cache[room] || null;
			if (cache === null) {

				cache = _cache[room] = {
					messages: [],
					users:    [ user ]
				};

			// 2. Join Room
			} else {

				var users = cache.users;
				if (users.indexOf(user) === -1) {
					users.push(user);
					sync = true;
				}

			}


			// 3. Leave Room (only one at a time allowed)
			for (var rId in _cache) {

				if (rId === room) continue;

				var users = _cache[rId].users;
				var index = users.indexOf(user);
				if (index !== -1) {
					_cache[rId].users.splice(index, 1);
					sync = true;
				}

			}


			if (sync === true) {

				// TODO: Synchronize room users across all other members

			}

		}

	};

	var _on_message = function(packet) {

		var data = packet.data;

		var user    = data.user || null;
		var room    = data.room || null;
		var message = data.message || null;
		if (
			   user !== null
			&& room !== null
			&& message !== null
		) {

			var cache = _cache[room] || null;
			if (cache !== null) {


				var limit = this.limit;
				if (cache.messages.length > limit - 1) {
					cache.messages.splice(0, 1);
				}

				cache.messages.push({
					user:    user,
					message: message
				});


				// TODO: Synchronize room messages across all other members

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote, data) {

		var settings = lychee.extend({}, data);


		this.limit = 100;


		this.setLimit(settings.limit);

		delete settings.limit;


		settings.type      = lychee.net.Service.TYPE.remote;
		settings.broadcast = true;


		lychee.net.Service.call(this, 'chat', remote, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('broadcast', function(packet) {

			var type = this.type;
			if (type === Class.TYPE.remote) {

				var data = packet.data;
				if (data.type === 'sync') {
					_on_sync.call(this, packet);
				} else if (data.type === 'message') {
					_on_message.call(this, packet);
				}

			}

		}, this);


		settings = null;

	};


	Class.prototype = {

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

