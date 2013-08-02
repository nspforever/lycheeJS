
lychee.define('sorbet.data.Map').exports(function(lychee, sorbet, global, attachments) {

	var Class = function() {
		this.__map = {};
	};


	Class.prototype = {

		get: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				if (this.__map[id] !== undefined) {
					return this.__map[id];
				}

			}


			return null;

		},

		set: function(id, data) {

			id   = typeof id === 'string' ? id   : null;
			data = data !== undefined     ? data : null;


			if (
				   id !== null
				&& data !== null
			) {

				this.__map[id] = data;

				return true;

			}


			return false;

		},

		alias: function(id, alias) {

			id    = typeof id === 'string'    ? id    : null;
			alias = typeof alias === 'string' ? alias : null;

			var from = this.get(id);
			var to   = this.get(alias);
			if (
				   from !== null
				&& to === null
			) {

				this.__map[alias] = from;

				return true;

			}


			return false;

		},

		remove: function(id, deep) {

			id   = typeof id === 'string' ? id : null;
			deep = deep === true;


			if (this.__map[id] !== undefined) {

				if (deep === true) {

					var data = this.__map[id];

					for (var mid in this.__map) {

						if (this.__map[mid] === data) {
							delete this.__map[mid];
						}

					}

				} else {

					delete this.__map[id];

				}

				return true;

			}


			return false;

		}

	};


	return Class;

});

