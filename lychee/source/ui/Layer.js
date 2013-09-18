
lychee.define('lychee.ui.Layer').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.entities = [];
		this.offset   = { x: 0, y: 0, z: 0 };
		this.overflow = true;
		this.visible  = true;

		this.__buffer = null;
		this.__map    = {};


		this.setEntities(settings.entities);
		this.setMap(settings.map);
		this.setOffset(settings.offset);
		this.setOverflow(settings.overflow);
		this.setVisible(settings.visible);

		delete settings.entities;
		delete settings.map;
		delete settings.offset;
		delete settings.overflow;
		delete settings.visible;


		lychee.ui.Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		reset: function() {

			this.entities = [];
			this.visible  = true;

			this.__map = {};

		},

		deserialize: function(blob) {

			var entities = [];
			for (var e = 0, el = blob.entities.length; e < el; e++) {

				var entity = lychee.deserialize(blob.entities[e]);

				entities.push(entity);

			}

			var map = [];
			for (var id in blob.map) {
				var index  = blob.map[id];
				map[index] = id;
			}

			for (var e = 0, el = entities.length; e < el; e++) {

				if (typeof map[e] === 'number') {
					this.setEntity(map[e], entities[e]);
				} else {
					this.addEntity(entities[e]);
				}

			}

		},

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.Layer';

			var settings = data['arguments'][0];
			var blob     = data['blob'] = (data['blob'] || {});


			if (this.visible !== true) settings.visible = this.visible;

			if (
				   this.offset.x !== 0
				|| this.offset.y !== 0
				|| this.offset.z !== 0
			) {

				settings.offset = {};

				if (this.offset.x !== 0) settings.offset.x = this.offset.x;
				if (this.offset.y !== 0) settings.offset.y = this.offset.y;
				if (this.offset.z !== 0) settings.offset.z = this.offset.z;

			}


			var entities = [];

			if (this.entities.length > 0) {

				blob.entities = [];

				for (var e = 0, el = this.entities.length; e < el; e++) {

					var entity = this.entities[e];

					blob.entities.push(lychee.serialize(entity));
					entities.push(entity);

				}

			}


			if (Object.keys(this.__map).length > 0) {

				blob.map = {};

				for (var id in this.__map) {

					var index = entities.indexOf(this.__map[id]);
					if (index !== -1) {
						blob.map[id] = index;
					}

				}

			}


			return data;

		},

		update: function(clock, delta) {

			lychee.ui.Entity.prototype.update.call(this, clock, delta);


			var entities = this.entities;
			for (var e = 0, el = entities.length; e < el; e++) {
				entities[e].update(clock, delta);
			}

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var buffer = this.__buffer;
			if (buffer === null) {

				buffer = renderer.createBuffer(
					this.width,
					this.height
				);

				this.__buffer = buffer;

			}


			var position = this.position;

			var ox = position.x + offsetX;
			var oy = position.y + offsetY;


			if (lychee.debug === true) {

				var hwidth  = this.width / 2;
				var hheight = this.height / 2;

				renderer.drawBox(
					ox - hwidth,
					oy - hheight,
					ox + hwidth,
					oy + hheight,
					'#ff00ff',
					false,
					1
				);

			}


			var overflow = this.overflow;
			if (overflow === false) {

				ox = this.width / 2;
				oy = this.height / 2;

				renderer.clearBuffer(buffer);
				renderer.setBuffer(buffer);

			}


			var entities = this.entities;
			for (var e = 0, el = entities.length; e < el; e++) {

				renderer.renderEntity(
					entities[e],
					ox,
					oy
				);

			}


			if (overflow === false) {

				renderer.setBuffer(null);

				renderer.drawBuffer(
					position.x + offsetX - hwidth,
					position.y + offsetY - hheight,
					buffer
				);

			}

		},



		/*
		 * CUSTOM API
		 */

		addEntity: function(entity) {

			entity = (entity != null && typeof entity.update === 'function') ? entity : null;


			if (entity !== null) {

				var found = false;

				for (var e = 0, el = this.entities.length; e < el; e++) {

					if (this.entities[e] === entity) {
						found = true;
						break;
					}

				}


				if (found === false) {

					this.entities.push(entity);

					return true;

				}

			}


			return false;

		},

		setEntity: function(id, entity, force) {

			id     = typeof id === 'string'                                  ? id     : null;
			entity = (entity != null && typeof entity.update === 'function') ? entity : null;
			force  = force === true;


			if (
				   id !== null
				&& entity !== null
				&& this.__map[id] === undefined
			) {

				this.__map[id] = entity;

				var result = this.addEntity(entity);
				if (result === true) {

					return true;

				} else if (force === true) {

					return true;

				} else {

					delete this.__map[id];

				}

			}


			return false;

		},

		getEntity: function(id) {

			id = typeof id === 'string' ? id : null;


			if (
				   id !== null
				&& this.__map[id] !== undefined
			) {

				return this.__map[id];

			}


			return null;

		},

		removeEntity: function(entity) {

			entity = (entity != null && typeof entity.update === 'function') ? entity : null;


			if (entity !== null) {

				var found = false;

				for (var e = 0, el = this.entities.length; e < el; e++) {

					if (this.entities[e] === entity) {
						this.entities.splice(e, 1);
						found = true;
						el--;
					}

				}


				for (var id in this.__map) {

					if (this.__map[id] === entity) {
						delete this.__map[id];
						found = true;
					}

				}


				return found;

			}


			return false;

		},

		setEntities: function(entities) {

			var all = true;

			if (entities instanceof Array) {

				this.entities = [];

				for (var e = 0, el = entities.length; e < el; e++) {

					var result = this.addEntity(entities[e]);
					if (result === false) {
						all = false;
					}

				}

			}


			return all;

		},

		setMap: function(map) {

			var all = true;

			if (map instanceof Object) {

				this.__map = {};

				for (var id in map) {

					var entity = this.entities[map[id]] || null;
					if (entity !== null) {

						var result = this.setEntity(id, entity, true);
						if (result === false) {
							all = false;
						}

					} else {
						all = false;
					}

				}

			}


			return all;

		},

		setOffset: function(offset) {

			if (offset instanceof Object) {

				this.offset.x = typeof offset.x === 'number' ? offset.x : this.offset.x;
				this.offset.y = typeof offset.y === 'number' ? offset.y : this.offset.y;
				this.offset.z = typeof offset.z === 'number' ? offset.z : this.offset.z;

				return true;

			}


			return false;

		},

		setOverflow: function(overflow) {

			if (overflow === true || overflow === false) {

				this.overflow = overflow;

				return true;

			}


			return false;

		},

		setVisible: function(visible) {

			if (visible === true || visible === false) {

				this.visible = visible;

				return true;

			}


			return false;

		}

	};


	return Class;

});

