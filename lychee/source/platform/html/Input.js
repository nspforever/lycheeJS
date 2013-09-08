
lychee.define('Input').tags({
	platform: 'html'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof global.addEventListener === 'function') {
		return true;
	}


	return false;

}).exports(function(lychee, global) {

	/*
	 * EVENTS
	 */

	var _instances = [];

	var _mouseactive = false;
	var _listeners = {

		keydown: function(event) {

			var handled = false;

			for (var i = 0, l = _instances.length; i < l; i++) {
				handled = _process_key.call(_instances[i], event.keyCode, event.ctrlKey, event.altKey, event.shiftKey) || handled;
			}


			if (handled === true) {
				event.preventDefault();
				event.stopPropagation();
			}

		},

		touchstart: function(event) {

			var handled = false;

			for (var i = 0, l = _instances.length; i < l; i++) {

				if (event.touches && event.touches.length) {

					for (var t = 0, tl = event.touches.length; t < tl; t++) {
						handled = _process_touch.call(_instances[i], t, event.touches[t].pageX, event.touches[t].pageY) || handled;
					}

				} else {
					handled = _process_touch.call(_instances[i], 0, event.pageX, event.pageY) || handled;
				}

			}


			// Prevent scrolling and swiping behaviour
			if (handled === true) {
				event.preventDefault();
				event.stopPropagation();
			}

		},

		touchmove: function(event) {

			for (var i = 0, l = _instances.length; i < l; i++) {

				if (event.touches && event.touches.length) {

					for (var t = 0, tl = event.touches.length; t < tl; t++) {
						_process_swipe.call(_instances[i], t, 'move', event.touches[t].pageX, event.touches[t].pageY);
					}

				} else {
					_process_swipe.call(_instances[i], 0, 'move', event.pageX, event.pageY);
				}

			}

		},

		touchend: function(event) {

			for (var i = 0, l = _instances.length; i < l; i++) {

				if (event.touches && event.touches.length) {

					for (var t = 0, tl = event.touches.length; t < tl; t++) {
						_process_swipe.call(_instances[i], t, 'end', event.touches[t].pageX, event.touches[t].pageY);
					}

				} else {
					_process_swipe.call(_instances[i], 0, 'end', event.pageX, event.pageY);
				}

			}

		},

		mousestart: function(event) {

			_mouseactive = true;


			var handled = false;

			for (var i = 0, l = _instances.length; i < l; i++) {
				handled = _process_touch.call(_instances[i], 0, event.pageX, event.pageY) || handled;
			}


			// Prevent drag of canvas as image
			if (handled === true) {
				event.preventDefault();
				event.stopPropagation();
			}

		},

		mousemove: function(event) {

			if (_mouseactive === false) return;


			var handled = false;

			for (var i = 0, l = _instances.length; i < l; i++) {
				handled = _process_swipe.call(_instances[i], 0, 'move', event.pageX, event.pageY) || handled;
			}


			// Prevent selection of canvas as content
			if (handled === true) {
				event.preventDefault();
				event.stopPropagation();
			}

		},

		mouseend: function(event) {

			if (_mouseactive === false) return;

			_mouseactive = false;

			for (var i = 0, l = _instances.length; i < l; i++) {
				_process_swipe.call(_instances[i], 0, 'end', event.pageX, event.pageY);
			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		var keyboard = 'onkeydown' in global;
		if (keyboard === true) {
			global.addEventListener('keydown', _listeners.keydown, true);
		}

		var touch = 'ontouchstart' in global;
		var mouse = 'onmousedown' in global;
		if (touch === true) {
			global.addEventListener('touchstart', _listeners.touchstart, true);
			global.addEventListener('touchmove',  _listeners.touchmove,  true);
			global.addEventListener('touchend',   _listeners.touchend,   true);
		} else if (mouse === true) {
			global.addEventListener('mousedown',  _listeners.mousestart, true);
			global.addEventListener('mousemove',  _listeners.mousemove,  true);
			global.addEventListener('mouseup',    _listeners.mouseend,   true);
			global.addEventListener('mouseout',   _listeners.mouseend,   true);
		}


		if (lychee.debug === true) {

			var methods = [];
			if (keyboard) methods.push('Keyboard');
			if (touch)    methods.push('Touch');
			if (mouse)    methods.push('Mouse');

			if (methods.length === 0) methods.push("NONE");

			console.log('lychee.Input: Supported input methods are ' + methods.join(', '));

		}

	})();



	/*
	 * HELPERS
	 */

	var _process_key = function(code, ctrl, alt, shift) {

		if (this.__fireKey === false) return false;


		// 1. Validate key event
		if (
			   Class.KEYMAP[code] === undefined
			&& Class.SPECIALMAP[code] === undefined
		) {
			return false;
		}


		ctrl  =  ctrl === true;
		alt   =   alt === true;
		shift = shift === true;


		// 2. Only fire after the enforced delay
		var delta = Date.now() - this.__clock.key;
		if (delta < this.__delay) {
			return true; // Don't fire native event
		}


		// 3. Check for current key being a modifier
		if (
			this.__fireModifiers === false
			&& (code === 16   || code === 17   ||  code === 18)
			&& (ctrl === true ||  alt === true || shift === true)
		) {
			return true; // Don't fire native event
		}


		var key  = null;
		var name = null;

		// 3a. Check for special characters (that can be shifted)
		if (Class.SPECIALMAP[code] !== undefined) {

			var tmp = Class.SPECIALMAP[code];

			key  = shift === true ? tmp[1] : tmp[0];
			name = '';

			if (ctrl  === true) name += 'ctrl-';
			if (alt   === true) name += 'alt-';
			if (shift === true) name += 'shift-';

			name += tmp[0];


		// 3b. Check for normal characters
		} else if (Class.KEYMAP[code] !== undefined) {

			key  = Class.KEYMAP[code];
			name = '';

			if (ctrl  === true && key !== 'ctrl')  name += 'ctrl-';
			if (alt   === true && key !== 'alt')   name += 'alt-';
			if (shift === true && key !== 'shift') name += 'shift-';

			if (
				   shift === true
				&& key !== 'ctrl'
				&& key !== 'alt'
				&& key !== 'shift'
			) {

				var tmp = String.fromCharCode(code);
				if (tmp !== '') {
					key = tmp;
				}

			}

			name += key.toLowerCase();

		}


		var handled = false;

		if (key !== null) {

			// bind('key') and bind('ctrl-a');
			// bind('!')   and bind('shift-1');

			handled = this.trigger('key', [ key, name, delta ]) || handled;
			handled = this.trigger(name, [ delta ])             || handled;

		}


		this.__clock.key = Date.now();


		return handled;

	};

	var _process_touch = function(id, x, y) {

		if (
			   this.__fireTouch === false
			&& this.__fireSwipe === true
		) {

			if (this.__swipes[id] === null) {
				_process_swipe.call(this, id, 'start', x, y);
			}

			return true;

		} else if (this.__fireTouch === false) {
			return false;
		}


		// 1. Only fire after the enforced delay
		var delta = Date.now() - this.__clock.touch;
		if (delta < this.__delay) {
			return true; // Don't fire native event
		}


		var handled = false;

		handled = this.trigger('touch', [ id, { x: x, y: y }, delta ]) || handled;


		this.__clock.touch = Date.now();


		// 2. Fire Swipe Start, but only for tracked touches
		if (this.__swipes[id] === null) {
			handled = _process_swipe.call(this, id, 'start', x, y) || handled;
		}


		return handled;

	};

	var _process_swipe = function(id, state, x, y) {

		if (this.__fireSwipe === false) return false;

		// 1. Only fire after the enforced delay
		var delta = Date.now() - this.__clock.swipe;
		if (delta < this.__delay) {
			return true; // Don't fire native event
		}


		var position = { x: x, y: y };
		var swipe    = { x: 0, y: 0 };

		if (this.__swipes[id] !== null) {

			// FIX for touchend events
			if (state === 'end' && x === 0 && y === 0) {
				position.x = this.__swipes[id].x;
				position.y = this.__swipes[id].y;
			}

			swipe.x = x - this.__swipes[id].x;
			swipe.y = y - this.__swipes[id].y;

		}


		var handled = false;


		if (state === 'start') {

			handled = this.trigger(
				'swipe',
				[ id, 'start', position, delta, swipe ]
			) || handled;

			this.__swipes[id] = {
				x: x, y: y
			};

		} else if (state === 'move') {

			handled = this.trigger(
				'swipe',
				[ id, 'move', position, delta, swipe ]
			) || handled;

		} else if (state === 'end') {

			handled = this.trigger(
				'swipe',
				[ id, 'end', position, delta, swipe ]
			) || handled;

			this.__swipes[id] = null;

		}


		this.__clock.swipe = Date.now();


		return handled;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);

		settings.fireKey      = !!settings.fireKey;
		settings.fireModifier = !!settings.fireModifier;
		settings.fireTouch    = !!settings.fireTouch;
		settings.fireSwipe    = !!settings.fireSwipe;
		settings.delay        = typeof settings.delay === 'number' ? settings.delay : 0;


		this.__fireKey      = settings.fireKey;
		this.__fireModifier = settings.fireModifier;
		this.__fireTouch    = settings.fireTouch;
		this.__fireSwipe    = settings.fireSwipe;
		this.__delay        = settings.delay;

		this.reset();


		lychee.event.Emitter.call(this);

		_instances.push(this);


		settings = null;

	};


	Class.KEYMAP = {

		 8:  'backspace',
		 9:  'tab',
		13:  'enter',
		16:  'shift',
		17:  'ctrl',
		18:  'alt',
		19:  'pause',
//		20:  'capslock',

		27:  'escape',
		32:  'space',
		33:  'page-up',
		34:  'page-down',
		35:  'end',
		36:  'home',

		37:  'arrow-left',
		38:  'arrow-up',
		39:  'arrow-right',
		40:  'arrow-down',

		45:  'insert',
		46:  'delete',

		65:  'a',
		66:  'b',
		67:  'c',
		68:  'd',
		69:  'e',
		70:  'f',
		71:  'g',
		72:  'h',
		73:  'i',
		74:  'j',
		75:  'k',
		76:  'l',
		77:  'm',
		78:  'n',
		79:  'o',
		80:  'p',
		81:  'q',
		82:  'r',
		83:  's',
		84:  't',
		85:  'u',
		86:  'v',
		87:  'w',
		88:  'x',
		89:  'y',
		90:  'z',

		96:  '0',
		97:  '1',
		98:  '2',
		99:  '3',
		100: '4',
		101: '5',
		102: '6',
		103: '7',
		104: '8',
		105: '9',
		106: '*',
		107: '+',
		109: '-',
		110: '.',
		111: '/',

		112: 'f1',
		113: 'f2',
		114: 'f3',
		115: 'f4',
		116: 'f5',
		117: 'f6',
		118: 'f7',
		119: 'f8',
		120: 'f9',
		121: 'f10',
		122: 'f11',
		123: 'f12',

//		144: 'numlock',
		145: 'scroll'

	};

	Class.SPECIALMAP = {

		48:  [ '0', ')' ],
		49:  [ '1', '!' ],
		50:  [ '2', '@' ],
		51:  [ '3', '#' ],
		52:  [ '4', '$' ],
		53:  [ '5', '%' ],
		54:  [ '6', '^' ],
		55:  [ '7', '&' ],
		56:  [ '8', '*' ],
		57:  [ '9', '(' ],

		186: [ ';', ':' ],
		187: [ '=', '+' ],
		188: [ ',', '<' ],
		189: [ '-', '_' ],
		190: [ '.', '>' ],
		191: [ '/', '?' ],
		192: [ '`', '~' ],

		219: [ '[',  '{' ],
		220: [ '\\', '|' ],
		221: [ ']',  '}' ],
		222: [ '\'', '"' ]

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		reset: function() {

			this.__swipes = null; // GC hint
			this.__swipes = {
				0: null, 1: null,
				2: null, 3: null,
				4: null, 5: null,
				6: null, 7: null,
				8: null, 9: null
			};

			this.__clock = null; // GC hint
			this.__clock = {
				key:   Date.now(),
				touch: Date.now(),
				swipe: Date.now()
			};

		}

	};


	return Class;

});

