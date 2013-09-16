
lychee.define('lychee.ui.Font').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _parse_attachments = function(attachments) {

		var map = {};

		for (var file in attachments) {

			var tmp  = file.split('.');
			var name = tmp[0];
			var ext  = tmp[1] || '';

			if (ext === 'fnt') {
				map[name] = attachments[file];
			}

		}


		return map;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(attachments) {

		this.__attachments = _parse_attachments(attachments);

	};




	Class.prototype = {

		deserialize: function(name) {

			name = typeof name === 'string' ? name : null;


			var font = this.__attachments[name] || null;
			if (font !== null) {

				var that = this;
				font.serialize = function() {
					return that.serialize(name);
				};

			}


			return font;

		},

		serialize: function(name) {

			return {
				'constructor': 'lychee.ui.Font',
				'arguments':   [ name ]
			};

		}

	};


	return Class;

});

