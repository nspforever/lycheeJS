
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
					users:    [ user ],
					tunnels:  [ this.tunnel ]
				};

			// 2. Join Room
			} else {

				if (cache.users.indexOf(user) === -1) {
					cache.users.push(user);
					cache.tunnels.push(this.tunnel);
				}


				_sync_room.call(this, cache);

			}


			// 3. Leave Room (only one at a time allowed)
			for (var rId in _cache) {

				if (rId === room) continue;

				var index = _cache[rId].users.indexOf(user);
				if (index !== -1) {
					_cache[rId].users.splice(index, 1);
					_cache[rId].tunnels.splice(index, 1);
					_sync_room.call(this, _cache[rId]);
				}

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


				_sync_room.call(this, cache);

			}

		}

	};

	var _sync_room = function(room) {

		var data = {
			messages: cache.messages,
			users:    cache.users
		};


		for (var t = 0, tl = cache.tunnels.length; t < tl; t++) {

			var tunnel = cache.tunnels[t];
			if (tunnel !== null) {

				tunnel.send(data, {
					id:    this.id,
					event: 'sync'
				});

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


		lychee.net.Service.call(this, 'chat', remote, lychee.net.Service.TYPE.remote);



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

