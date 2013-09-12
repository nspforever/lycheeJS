
lychee.define('game.ar.data.Buffer').tags({
	platform: 'nodejs'
}).supports(function(lychee, global) {

	if (typeof Buffer !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		this.__offset = 0;

		if (Buffer.isBuffer(data)) {
			this.__buffer = data;
		} else {
			this.__buffer = new Buffer(data, 'binary');
		}

	};


	Class.prototype = {

		/*
		 * LOW LEVEL READ API
		 */

		int16: function() {
			this.__offset += 2;
			return this.__buffer.readInt16LE(this.__offset - 2);
		},

		uint16: function() {
			this.__offset += 2;
			return this.__buffer.readUInt16LE(this.__offset - 2);
		},

		int32: function() {
			this.__offset += 4;
			return this.__buffer.readInt32LE(this.__offset - 4);
		},

		uint32: function() {
			this.__offset += 4;
			return this.__buffer.readUInt32LE(this.__offset - 4);
		},

		float32: function() {
			this.__offset += 4;
			return this.__buffer.readFloatLE(this.__offset - 4);
		},



		/*
		 * HIGH LEVEL READ API
		 */

		extract: function(bytes) {

			this.__offset += bytes;


			var buffer = new Buffer(bytes);

			this.__buffer.copy(
				buffer,
				0,
				this.__offset - bytes,
				this.__offset
			);

			return buffer;

		},

		matrix3: function() {

			return {
				m11: this.float32(),
				m12: this.float32(),
				m13: this.float32(),
				m21: this.float32(),
				m22: this.float32(),
				m23: this.float32(),
				m31: this.float32(),
				m32: this.float32(),
				m33: this.float32()
			};

		},

		vector3: function() {

			return {
				x: this.float32(),
				y: this.float32(),
				z: this.float32()
			};

		},

		mask: function(value, mask) {

			var flags = {};

			for (var flag in mask) {
				flags[flag] = (value & mask[flag]) ? 1 : 0;
			}


			return flags;

		}

	};


	return Class;

});

