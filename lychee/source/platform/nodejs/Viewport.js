
lychee.define('Viewport').tags({
	platform: 'nodejs'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (
		typeof process !== 'undefined'
		&& process.stdout
		&& typeof process.stdout.on === 'function'
	) {
		return true;
	}

	return false;

}).exports(function(lychee, global) {

	/*
	 * EVENTS
	 */

	var _instances = [];

	var _listeners = {

		resize: function() {

			for (var i = 0, l = _instances.length; i < l; i++) {
				_process_reshape.call(_instances[i], process.stdout.columns, process.stdout.rows);
			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		process.stdout.on('resize', _listeners.resize);


		if (lychee.debug === true) {
			console.log('lychee.Viewport: Supported methods are resize');
		}

	})();



	/*
	 * HELPERS
	 */

	var _process_reshape = function(width, height) {

		this.__width  = width;
		this.__height = height;


		if (width > height) {

			this.trigger('reshape', [
				'landscape',
				'landscape',
				this.__width,
				this.__height
			]);

		} else {

			this.trigger('reshape', [
				'portrait',
				'portrait',
				this.__width,
				this.__height
			]);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function() {

		this.__orientation = null; // Unsupported
		this.__width  = process.stdout.columns;
		this.__height = process.stdout.rows;


		lychee.event.Emitter.call(this);

		_instances.push(this);

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		enterFullscreen: function() {
			// TODO: Evaluate if Fullscreen can be implemented in a TTY
			return false;
		},

		leaveFullscreen: function() {
			return true;
		}

	};


	return Class;

});

