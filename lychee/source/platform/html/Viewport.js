
lychee.define('Viewport').tags({
	platform: 'html'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (
		   typeof global.addEventListener === 'function'
		&& typeof global.innerWidth === 'number'
		&& typeof global.innerHeight === 'number'
		&& typeof global.document !== 'undefined'
		&& typeof global.document.getElementsByClassName === 'function'
	) {
		return true;
	}


	return false;

}).exports(function(lychee, global) {

	/*
	 * EVENTS
	 */

	var _clock  = {
		orientationchange: null,
		resize:            0
	};

	var _focusactive   = true;
	var _reshapeactive = false;
	var _reshapewidth  = global.innerWidth;
	var _reshapeheight = global.innerHeight;

	var _reshape_viewport = function() {

		if (
			_reshapeactive === true
			|| (
				   _reshapewidth === global.innerWidth
				&& _reshapeheight === global.innerHeight
			)
		) {
			 return false;
		}


		_reshapeactive = true;



		/*
		 * ISSUE in Mobile WebKit:
		 *
		 * An issue occurs if width of viewport is higher than
		 * the width of the viewport of future rotation state.
		 *
		 * This bugfix prevents the viewport to scale higher
		 * than 1.0, even if the meta tag is correctly setup.
		 */

		var elements = global.document.getElementsByClassName('lychee-Renderer-canvas');
		for (var e = 0, el = elements.length; e < el; e++) {

			var element = elements[e];

			element.style.width  = '1px';
			element.style.height = '1px';

		}



		/*
		 * ISSUE in Mobile Firefox and Mobile WebKit
		 *
		 * The reflow is too slow for an update, so we have
		 * to lock the heuristic to only be executed once,
		 * waiting for a second to let the reflow finish.
		 */

		setTimeout(function() {

			for (var i = 0, l = _instances.length; i < l; i++) {
				_process_reshape.call(_instances[i], global.innerWidth, global.innerHeight);
			}

			_reshapewidth  = global.innerWidth;
			_reshapeheight = global.innerHeight;
			_reshapeactive = false;

		}, 1000);

	};


	var _instances = [];
	var _listeners = {

		orientationchange: function() {

			for (var i = 0, l = _instances.length; i < l; i++) {
				_process_orientation.call(_instances[i], global.orientation);
			}

			_clock.orientationchange = Date.now();
			_reshape_viewport();

		},

		resize: function() {

			if (
				_clock.orientationchange === null
				|| (
					   _clock.orientationchange !== null
					&& _clock.orientationchange > _clock.resize
				)
			) {

				_clock.resize = Date.now();
				_reshape_viewport();

			}

		},

		focus: function() {

			if (_focusactive === false) {

				for (var i = 0, l = _instances.length; i < l; i++) {
					_instances[i].trigger('show', []);
				}

				_focusactive = true;

			}

		},

		blur: function() {

			if (_focusactive === true) {

				for (var i = 0, l = _instances.length; i < l; i++) {
					_instances[i].trigger('hide', []);
				}

				_focusactive = false;

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
								document[prefix + 'CancelFullScreen']();
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


		this.width    = width;
		this.height   = height;

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
		this.width      = global.innerWidth;
		this.height     = global.innerHeight;

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

		setFullscreen: function(fullscreen) {

			if (
				   fullscreen === true
				&& _enterFullscreen !== null
			) {

				_enterFullscreen();
				this.fullscreen = true;

				return true;

			} else if (
				   fullscreen === false
				&& _leaveFullscreen !== null
			) {

				_leaveFullscreen();
				this.fullscreen = false;

				return true;

			}


			return false;

		}

	};


	return Class;

});

