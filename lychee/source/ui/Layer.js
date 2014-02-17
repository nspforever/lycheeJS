
lychee.define('lychee.ui.Layer').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _validate_entity = function(entity) {

		if (
			entity instanceof Object
			&& typeof entity.shape === 'number'
			&& typeof entity.update === 'function'
			&& typeof entity.render === 'function'
			&& typeof entity.isAtPosition === 'function'
		) {

			return true;

		}

	};

	var _process_touch = function(id, position, delta) {

		var triggered = null;
		var args      = [ id, {
			x: position.x - this.position.x - this.offset.x,
			y: position.y - this.position.y - this.offset.y
		}, delta ];


		for (var e = this.entities.length - 1; e >= 0; e--) {

			var entity = this.entities[e];
			if (entity.visible === false) continue;

			if (
				   typeof entity.trigger === 'function'
				&& entity.isAtPosition(args[1]) === true
			) {

				var result = entity.trigger('touch', args);
				if (result === true) {
					triggered = entity;
					break;
				} else if (result !== false) {
					triggered = result;
					break;
				}

			}

		}


		return triggered;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.entities = [];
		this.offset   = { x: 0, y: 0 };
		this.visible  = true;

		this.__map    = {};


		this.setEntities(settings.entities);
		this.setOffset(settings.offset);
		this.setVisible(settings.visible);

		delete settings.entities;
		delete settings.offset;
		delete settings.visible;


		settings.shape = lychee.ui.Entity.SHAPE.rectangle;


		lychee.ui.Entity.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', _process_touch, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var entities = [];
			for (var e = 0, el = blob.entities.length; e < el; e++) {
				entities.push(lychee.deserialize(blob.entities[e]));
			}

			var map = {};
			for (var id in blob.map) {

				var index = blob.map[id];
				if (typeof index === 'number') {
					map[id] = index;
				}

			}

			for (var e = 0, el = entities.length; e < el; e++) {

				var id = null;
				for (var mid in map) {

					if (map[mid] === e) {
						id = mid;
					}

				}


				if (id !== null) {
					this.setEntity(id, entities[e]);
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

			if (this.visible !== true)   settings.visible  = this.visible;


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


			var position = this.position;
			var offset   = this.offset;


			var ox = position.x + offsetX + offset.x;
			var oy = position.y + offsetY + offset.y;


			var entities = this.entities;
			for (var e = 0, el = entities.length; e < el; e++) {

				entities[e].render(
					renderer,
					ox,
					oy
				);

			}


			if (lychee.debug === true) {

				ox = position.x + offsetX;
				oy = position.y + offsetY;


				var hwidth   = this.width  / 2;
				var hheight  = this.height / 2;


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

		},



		/*
		 * CUSTOM API
		 */

		reshape: function() {

			var hwidth  = this.width  / 2;
			var hheight = this.height / 2;


			for (var e = 0, el = this.entities.length; e < el; e++) {

				var entity = this.entities[e];
				var boundx = Math.abs(entity.position.x + this.offset.x);
				var boundy = Math.abs(entity.position.y + this.offset.y);

				if (entity.shape === lychee.ui.Entity.SHAPE.circle) {
					boundx += entity.radius;
					boundy += entity.radius;
				} else if (entity.shape === lychee.ui.Entity.SHAPE.rectangle) {
					boundx += entity.width  / 2;
					boundy += entity.height / 2;
				}

				hwidth  = Math.max(hwidth,  boundx);
				hheight = Math.max(hheight, boundy);

			}


			this.width  = hwidth  * 2;
			this.height = hheight * 2;

		},

		addEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


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
					this.reshape();

					return true;

				}

			}


			return false;

		},

		setEntity: function(id, entity) {

			id     = typeof id === 'string'            ? id     : null;
			entity = _validate_entity(entity) === true ? entity : null;


			if (
				   id !== null
				&& entity !== null
				&& this.__map[id] === undefined
			) {

				this.__map[id] = entity;

				var result = this.addEntity(entity);
				if (result === true) {

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

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				var found = false;

				for (var e = 0, el = this.entities.length; e < el; e++) {

					if (this.entities[e] === entity) {
						this.entities.splice(e, 1);
						found = true;
						el--;
						e--;
					}

				}


				for (var id in this.__map) {

					if (this.__map[id] === entity) {
						delete this.__map[id];
						found = true;
					}

				}


				if (found === true) {
					this.reshape();
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

		setOffset: function(offset) {

			if (offset instanceof Object) {

				this.offset.x = typeof offset.x === 'number' ? offset.x : this.offset.x;
				this.offset.y = typeof offset.y === 'number' ? offset.y : this.offset.y;

				this.reshape();

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

