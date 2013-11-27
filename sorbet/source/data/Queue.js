
lychee.define('sorbet.data.Queue').requires([
	'lychee.game.Loop'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * EVENTS
	 */

	var _instances = [];

	var _listeners = {

		interval: function() {

			var handled = false;

			for (var i = 0, l = _instances.length; i < l; i++) {
				handled = _process_update.call(_instances[i]) || handled;
			}

		}

	};

	(function() {

		var loop = new lychee.game.Loop({
			render: 0,
			update: 2
		});

		loop.interval(1000, _listeners.interval, this);

	})();



	/*
	 * HELPERS
	 */

	var _process_update = function() {

		if (
			   this.__flush === true
			&& this.__buffer.length > 0
		) {

			var entry = this.__buffer.splice(0, 1)[0] || null;
			if (entry !== null) {

				this.__flush = false;
				this.trigger('update', [ entry ]);

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.__buffer = [];
		this.__flush  = true;


		lychee.event.Emitter.call(this);

		_instances.push(this);


		settings = null;

	};


	Class.prototype = {

		add: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				this.__buffer.push(data);

				return true;

			}


			return false;

		},

		flush: function() {

			this.__flush = true;

		}

	};


	return Class;

});

