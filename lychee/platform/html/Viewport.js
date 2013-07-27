
lychee.define('Viewport').tags({
	platform: 'html'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (
		   typeof global.addEventListener === 'function'
		&& typeof global.innerWidth === 'number'
		&& typeof global.innerHeight === 'number'
		&& typeof document !== 'undefined'
		&& typeof document.getElementsByClassName === 'function'
	) {
		return true;
	}


	return false;

}).exports(function(lychee, global) {

	/*
	 * EVENTS
	 */

	var _active = true;
	var _clock = {
		orientationchange: null,
		resize:            0
	};


	var _webkit_hack = function() {

		var elements = document.getElementsByClassName('lychee-Renderer-canvas');
		for (var e = 0, el = elements.length; e < el; e++) {

			var element = elements[e];

			element.style.width  = '1px';
			element.style.height = '1px';

		}

	};


	var _instances = [];
	var _listeners = {

		orientationchange: function() {

			_clock.orientationchange = Date.now();

			for (var i = 0, l = _instances.length; i < l; i++) {
				_process_orientation.call(_instances[i], global.orientation);
			}

		},

		resize: function() {

			// TODO: Evaluate when this hack can be removed
			_webkit_hack();


			if (
				_clock.orientationchange === null
				|| (
					   _clock.orientationchange !== null
					&& _clock.orientationchange > _clock.resize
				)
			) {

				_clock.resize = Date.now();


				for (var i = 0, l = _instances.length; i < l; i++) {

					(function(instance) {
						setTimeout(function() {
							_process_reshape.call(instance, global.innerWidth, global.innerHeight);
						}, 1000);
					})(_instances[i]);

				}

			}

		},

		focus: function() {

			if (_active === false) {

				for (var i = 0, l = _instances.length; i < l; i++) {
					_instances[i].trigger('show', []);
				}

				_active = true;

			}

		},

		blur: function() {

			if (_active === true) {

				for (var i = 0, l = _instances.length; i < l; i++) {
					_instances[i].trigger('hide', []);
				}

				_active = false;

			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	var _enterFullscreen = null;
	var _leaveFullscreen = null;

	(function() {

		var methods = [];

		if (typeof global.onorientationchange !== 'undefined') {
			methods.push('Orientation');
			global.addEventListener('orientationchange', _listeners.orientationchange, true);
		}

		if (typeof global.onfocus !== 'undefined') {
			methods.push('Focus');
			global.addEventListener('focus', _listeners.focus, true);
		}

		if (typeof global.onblur !== 'undefined') {
			methods.push('Blur');
			global.addEventListener('blur', _listeners.blur, true);
		}


		global.addEventListener('resize', _listeners.resize, true);


		if (global.document && global.document.documentElement) {

			var element = global.document.documentElement;

			if (
				   typeof element.requestFullscreen === 'function'
				&& typeof element.exitFullscreen === 'function'
			) {

				_enterFullscreen = function() {
					element.requestFullscreen();
				};

				_leaveFullscreen = function() {
					element.exitFullscreen();
				};

			}


			if (_enterFullscreen === null || _leaveFullscreen === null) {

				var prefixes = [ 'moz', 'ms', 'webkit' ];

				for (var p = 0, pl = prefixes.length; p < pl; p++) {

					if (
						typeof element[prefixes[p] + 'RequestFullScreen'] === 'function'
						&& typeof document[prefixes[p] + 'CancelFullScreen'] === 'function'
					) {

						(function(document, element, prefix) {

							_enterFullscreen = function() {
								element[prefix + 'RequestFullScreen']();
							};

							_leaveFullscreen = function() {
								document[prefix + 'LeaveFullScreen']();
							};

						})(global.document, element, prefixes[p]);

						break;

					}

				}

			}

		}


		if (_enterFullscreen !== null && _leaveFullscreen !== null) {
			methods.push('Fullscreen');
		}


		if (lychee.debug === true) {
			console.log('lychee.Viewport: Supported methods are ' + methods.join(', '));
		}

	})();



	/*
	 * HELPERS
	 */

	var _process_orientation = function(orientation) {

		orientation = typeof orientation === 'number' ? orientation : null;

		if (orientation !== null) {
			this.__orientation = orientation;
		}

	};

	var _process_reshape = function(width, height) {

		if (
			   width === this.__width
			&& height === this.__height
		) {
			return;
		}


		this.__width  = width;
		this.__height = height;



		//    TOP
		//  _______
		// |       |
		// |       |
		// |       |
		// |       |
		// |       |
		// [X][X][X] <- buttons
		//
		//  BOTTOM

		if (this.__orientation === 0) {

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



		//  BOTTOM
		//
		// [X][X][X] <- buttons
		// |       |
		// |       |
		// |       |
		// |       |
		// |_______|
		//
		//    TOP

		} else if (this.__orientation === 180) {

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



		//    ____________    B
		// T |            [x] O
		// O |            [x] T
		// P |____________[x] T
		//                    O
		//                    M

		} else if (this.__orientation === 90) {

			if (width > height) {
				this.trigger('reshape', [
					'portrait',
					'landscape',
					this.__width,
					this.__height
				]);
			} else {
				this.trigger('reshape', [
					'landscape',
					'portrait',
					this.__width,
					this.__height
				]);
			}



		// B    ____________
		// O [x]            | T
		// T [x]            | O
		// T [x]____________| P
		// O
		// M

		} else if (this.__orientation === -90) {

			if (width > height) {
				this.trigger('reshape', [
					'portrait',
					'landscape',
					this.__width,
					this.__height
				]);
			} else {
				this.trigger('reshape', [
					'landscape',
					'portrait',
					this.__width,
					this.__height
				]);
			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function() {

		this.fullscreen = false;

		this.__orientation = typeof global.orientation === 'number' ? global.orientation : 0;
		this.__width       = global.innerWidth;
		this.__height      = global.innerHeight;


		lychee.event.Emitter.call(this);

		_instances.push(this);

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		enterFullscreen: function() {

			if (_enterFullscreen !== null) {

				this.fullscreen = true;
				_enterFullscreen();

				return true;

			}


			return false;

		},

		leaveFullscreen: function() {

			if (_leaveFullscreen !== null) {

				this.fullscreen = false;
				_leaveFullscreen();

				return true;

			}


			return false;

		}

	};


	return Class;

});

