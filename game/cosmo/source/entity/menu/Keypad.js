
lychee.define('game.entity.menu.Keypad').includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var _config = attachments['json'];


	/*
	 * HELPERS
	 */

	var _refresh_label = function(code) {

		var label = this.getEntity('label');
		if (label !== null) {
			label.setLabel(this.__keys.join(' '));
		}

		var cursor = this.getEntity('cursor');
		if (cursor !== null) {

			var str   = [ ' ', ' ', ' ', ' ' ];
			var index = this.__keyindex;

			str[index] = '_';

			cursor.setLabel(str.join(' '));

		}

	};

	var _validate_code = function(code) {

		code = typeof code === 'string' ? code : null;


		if (code !== null) {

			var valid = true;

			for (var c = 0, cl = code.length; c < cl; c++) {

				if (code[c] === '*') {
					valid = false;
					break;
				}

			}


			return valid;

		}


		return false;

	};

	var _enter_key = function(key) {

		if (typeof key.label === 'string') {

			var keys  = this.__keys;
			var index = this.__keyindex;

			keys[index] = key.label;
			index++;

			if (index >= keys.length) {

				this.__keyindex = 0;
				this.setCode(keys.join(''));

			} else {

				this.__keyindex = index;

			}


			_refresh_label.call(this);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, _config.arguments[0], data);


		this.code = '****';

		this.__keys     = [ '*', '*', '*', '*' ];
		this.__keyindex = 0;


		lychee.ui.Layer.call(this, settings);


		this.deserialize(_config.blob);


		this.setCode(settings.code);
		this.setCode('1234');

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			lychee.ui.Layer.prototype.deserialize.call(this, blob);


			var font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}


			for (var e = 2, el = this.entities.length; e < el; e++) {
				this.entities[e].bind('#touch', _enter_key, this);
			}

		},


		/*
		 * CUSTOM API
		 */

		setCode: function(code) {

			if (_validate_code(code) === true) {

				this.__keys[0] = code[0];
				this.__keys[1] = code[1];
				this.__keys[2] = code[2];
				this.__keys[3] = code[3];

				_refresh_label.call(this, code);

				this.code = code;
				this.trigger('code', [ code ]);

				return true;

			}


			return false;

		},

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.font = font;

				for (var e = 0, el = this.entities.length; e < el; e++) {
					this.entities[e].setFont(this.font);
				}

				return true;

			}


			return false;

		}

	};


	return Class;

});

