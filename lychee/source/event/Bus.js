
lychee.define('lychee.event.Bus').requires([
	'lychee.event.Emitter'
]).exports(function(lychee, global) {



	/*
	 * HELPERS
	 */

	var _roots = [];

	var _trigger_channel = function(type, root) {

		var index = _roots.indexOf(root);
		if (index === -1) {

			this.unbindChannel(type, root);

			return false;

		}


		var args = [].splice.call(arguments, 1);

		if (
			   this.__channels[type] !== undefined
			&& this.__channels[type][index] !== undefined
		) {

			var channel = this.__channels[type][index];
			for (var c = 1, cl = channel.length; c < cl; c++) {
				channel[c].trigger(type, args);
			}


			return true;

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function() {

		this.__channels = {};

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		bindChannel: function(type, emitters) {

			type     = typeof type === 'string'  ? type     : null;
			emitters = emitters instanceof Array ? emitters : null;


			if (type !== null && type.charAt(0) === '@') {
				return false;
			}


			if (
				   type !== null
				&& emitters !== null
			) {

				if (this.__channels[type] === undefined) {
					this.__channels[type] = {};
				}


				var channel = [];

				for (var e = 0, el = emitters.length; e < el; e++) {

					var emitter = emitters[e];
					if (lychee.interfaceof(lychee.event.Emitter, emitter) === true) {
						channel.push(emitter);
					}

				}


				if (channel.length > 0) {

					var root  = channel[0];
					var index = _roots.indexOf(root);
					if (index === -1) {

						index = _roots.length;
						_roots.push(root);

						root.bind('@' + type, _trigger_channel, this);
						this.__channels[type][index] = channel;


						return true;

					}

				}

			}


			return false;

		},

		unbindChannel: function(type, root) {

			type = typeof type === 'string'                       ? type : null;
			root = lychee.interfaceof(lychee.event.Emitter, root) ? root : null;


			if (
				   type !== null
				&& root !== null
			) {

				var index = _roots.indexOf(root);
				if (index !== -1) {

					if (this.__channels[type][index] !== undefined) {

						_roots.splice(index, 1);

						root.unbind('@' + type, _trigger_channel, this);
						delete this.__channels[type][index];


						return true;

					}

				}

			}


			return false;

		}

	};


	return Class;

});

