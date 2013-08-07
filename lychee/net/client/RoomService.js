
lychee.define('lychee.net.client.RoomService').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global) {

	var Class = function(client) {

		this.__userId   = null;
		this.__roomId   = null;
		this.__users    = [];
		this.__messages = [];


		this.id     = 'RoomService';
		this.client = client;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		enter: function(userId, roomId) {

			if (
				   typeof userId === 'string'
				&& typeof roomId === 'number'
			) {

				this.client.send({
					userId: userId,
					roomId: roomId
				}, {
					id:     this.id,
					method: 'enter'
				});

			}

		},

		leave: function(roomId) {

			if (typeof roomId === 'number') {

				this.client.send({
					userId: this.__userId,
					roomId: roomId
				}, {
					id:     this.id,
					method: 'leave'
				});

			}

		},

		message: function(message) {

			if (typeof message === 'string') {

				this.client.send({
					userId:  this.__userId,
					roomId:  this.__roomId,
					message: message
				}, {
					id:     this.id,
					method: 'message'
				});

			}

		},

		update: function(data) {

			if (data.userId != null) {
				this.__userId = data.userId;
			}

			if (data.roomId != null) {
				this.__roomId = data.roomId;
			}

			if (data.messages != null) {

				for (var m = 0, ml = data.messages.length; m < ml; m++) {
					this.__messages.push(data.messages[m]);
				}

			} else if (data.message != null) {
				this.__messages.push(data.message);
			}

			if (data.users != null) {

				for (var u = 0, ul = data.users.length; u < ul; u++) {
					this.__users.push(data.users[u]);
				}

			}


			this.trigger('refresh', [
				this.__userId,
				this.__roomId,
				this.__users,
				this.__messages
			]);

		}

	};


	return Class;

});

