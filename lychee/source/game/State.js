
lychee.define('lychee.game.State').requires([
	'lychee.game.Layer',
	'lychee.ui.Layer'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global) {


	/*
	 * HELPERS
	 */

	var _processSwipe_recursive = function(search, entity, offset, offsetX, offsetY) {

		if (offsetX === undefined || offsetY === undefined) {

			offset.x = 0;
			offset.y = 0;
			offsetX  = 0;
			offsetY  = 0;

		}


		if (search === entity) {

			offset.x = offsetX;
			offset.y = offsetY;

			return true;


		} else if (entity.entities !== undefined) {

			var entities = entity.entities;
			for (var e = entities.length - 1; e >= 0; e--) {

				var position = entities[e].position;

				var result = _processSwipe_recursive.call(
					this,
					search,
					entities[e],
					offset,
					offsetX + position.x,
					offsetY + position.y
				);

				if (result === true) {
					return true;
				}

			}

		}


		return false;

	};

	var _processTouch_recursive = function(entity, originX, originY, args) {

		var triggered = null;
		var position  = entity.position;


		if (_is_entity_at_position(entity, originX, originY) === true) {

			if (typeof entity.trigger === 'function') {

				args[1].x = originX - position.x;
				args[1].y = originY - position.y;

				var result = entity.trigger('touch', args);
				if (result === true && triggered === null) {
					triggered = entity;
				}

			}

		}


		if (entity.entities !== undefined) {

			var entities = entity.entities;
			for (var e = entities.length - 1; e >= 0; e--) {

				var result = _processTouch_recursive.call(
					this,
					entities[e],
					originX - position.x,
					originY - position.y,
					args
				);


				if (result !== null) {
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

	var Class = function(game) {

		this.game     = game          || null;
		this.input    = game.input    || null;
		this.jukebox  = game.jukebox  || null;
		this.loop     = game.loop     || null;
		this.renderer = game.renderer || null;


		this.__layers        = {};
		this.__focusEntity   = null;

		this.__touchEntities = [];
		this.__touchLayers   = [];
		this.__touchOffsets  = [];

		for (var i = 0; i < 10; i++) {
			this.__touchEntities.push(null);
			this.__touchLayers.push(null);
			this.__touchOffsets.push({
				x: 0, y: 0
			});
		}


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		deserialize: function(blob) {

			var env = lychee.getEnvironment();

			lychee.setEnvironment(this);

			for (var id in blob.layers) {
				this.setLayer(id, lychee.deserialize(blob.layers[id]));
			}

			lychee.setEnvironment(env);

		},

		serialize: function() {

			var blob = {};


			blob.layers = {};

			for (var id in this.__layers) {
				blob.layers[id] = this.__layers[id].serialize();
			}


			var game = null;
			if (this.game !== null) {
				game = '#lychee.game.Main';
			}


			return {
				'constructor': 'lychee.game.State',
				'arguments':   [ game ],
				'blob':        blob
			};

		},

		reshape: function() {

			var renderer = this.renderer;
			if (renderer !== null) {

				var position = {
					x: 1/2 * renderer.width,
					y: 1/2 * renderer.height
				};

				for (var id in this.__layers) {
					this.__layers[id].setPosition(position);
				}

			}

		},

		enter: function() {

			this.trigger('enter');

			var input = this.input;
			if (input !== null) {
				input.bind('key',   this.processKey,   this);
				input.bind('touch', this.processTouch, this);
				input.bind('swipe', this.processSwipe, this);
			}

		},

		leave: function() {

			var input = this.input;
			if (input !== null) {
				input.unbind('swipe', this.processSwipe, this);
				input.unbind('touch', this.processTouch, this);
				input.unbind('key',   this.processKey,   this);
			}

			this.trigger('leave');

		},

		show: function() {
		},

		hide: function() {
		},

		update: function(clock, delta) {

			for (var id in this.__layers) {

				var layer = this.__layers[id];
				if (layer.visible === false) continue;

				layer.update(clock, delta);

			}

		},

		render: function(clock, delta, custom) {

			custom = custom === true;


			var renderer = this.renderer;
			if (renderer !== null) {

				if (custom === false) {
					renderer.clear();
				}


				for (var id in this.__layers) {

					var layer = this.__layers[id];
					if (layer.visible === false) continue;

					layer.render(
						renderer,
						0,
						0
					);

				}


				if (custom === false) {
					renderer.flush();
				}

			}

		},



		/*
		 * LAYER API
		 */

		setLayer: function(id, layer) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				if (
					   lychee.interfaceof(lychee.game.Layer, layer) === true
					|| lychee.interfaceof(lychee.ui.Layer, layer) === true
				) {

					this.__layers[id] = layer;

					return true;

				}

			}


			return false;

		},

		getLayer: function(id) {

			id = typeof id === 'string' ? id : null;


			if (
				   id !== null
				&& this.__layers[id] !== undefined
			) {

				return this.__layers[id];

			}


			return null;

		},

		queryLayer: function(id, query) {

			id    = typeof id === 'string'    ? id    : null;
			query = typeof query === 'string' ? query : null;


			if (
				   id !== null
				&& query !== null
			) {

				var layer = this.getLayer(id);
				if (layer !== null) {

					var entity = layer;
					var ids    = query.split(' > ');

					for (var i = 0, il = ids.length; i < il; i++) {

						entity = entity.getEntity(ids[i]);

						if (entity === null) {
							break;
						}

					}


					return entity;

				}

			}


			return null;

		},

		removeLayer: function(id) {

			id = typeof id === 'string' ? id : null;


			if (
				   id !== null
				&& this.__layers[id] !== undefined
			) {

				delete this.__layers[id];

				return true;

			}


			return false;

		},

		processKey: function(key, name, delta) {

			if (this.__focusEntity !== null) {

				var result = this.__focusEntity.trigger('key', [ key, name, delta ]);
				if (
					key === 'return'
					&& result === true
				) {

					if (this.__focusEntity.state === 'default') {
						this.__focusEntity = null;
					}

				}

			}

		},

		processTouch: function(id, position, delta) {

			var renderer = this.renderer;
			if (renderer !== null) {

				position.x -= renderer.width  / 2;
				position.y -= renderer.height / 2;

			}


			var triggered = null;
			var args      = [ id, {
				x: position.x,
				y: position.y
			}, delta ];


			for (var id in this.__layers) {

				var layer = this.__layers[id];
				if (layer instanceof lychee.ui.Layer) {

					var result = layer.trigger('touch', args);
					if (result === true) {
						triggered = layer;
						break;
					} else if (result !== false) {

						triggered = result;

						if (triggered !== null) {
							break;
						}

					}

				}

			}


			console.log(triggered);


		},

		processSwipe__OLD: function(id, type, position, delta, swipe) {

			var entity = this.__touchEntities[id];
			var layer  = this.__touchLayers[id];
			var offset = this.__touchOffsets[id];


			if (entity !== undefined && entity !== null) {

				var renderer = this.renderer;
				if (renderer !== null) {

					position.x -= renderer.offset.x;
					position.y -= renderer.offset.y;

					position.x -= renderer.width  / 2;
					position.y -= renderer.height / 2;

				}


				if (type === 'start') {

					_processSwipe_recursive.call(
						this,
						entity,
						layer,
						offset
					);


					position.x -= offset.x;
					position.y -= offset.y;


					var result = entity.trigger('swipe', [
						id, type, position, delta, swipe
					]);

					if (result === false) {
						this.__touchEntities[id] = null;
					}

				} else if (type === 'move') {

					position.x -= offset.x;
					position.y -= offset.y;

					entity.trigger('swipe', [
						id, type, position, delta, swipe
					]);

				} else if (type === 'end') {

					position.x -= offset.x;
					position.y -= offset.y;

					entity.trigger('swipe', [
						id, type, position, delta, swipe
					]);

					this.__touchEntities[id] = null;

				}

			}

		},

		processTouch__OLD: function(id, position, delta) {

			var renderer = this.renderer;
			if (renderer !== null) {

				position.x -= renderer.offset.x;
				position.y -= renderer.offset.y;

				position.x -= renderer.width  / 2;
				position.y -= renderer.height / 2;

			}


			var args = [ id, {
				x: position.x,
				y: position.y
			}, delta ];


			var oldFocusEntity = this.__focusEntity;
			var newFocusEntity = null;


			for (var layerId in this.__layers) {

				var layer = this.__layers[layerId];

				var entities = layer.entities;

				for (var e = entities.length - 1; e >= 0; e--) {

					var triggered = _processTouch_recursive.call(
						this,
						entities[e],
						position.x,
						position.y,
						args
					);

					if (triggered !== null) {

						this.__touchEntities[id] = triggered;
						this.__touchLayers[id]   = layer;
						newFocusEntity           = triggered;

						break;

					}

				}

			}


			// 1. Reset Touch trace data if no Entity was touched
			if (newFocusEntity === null) {
				this.__touchEntities[id] = null;
				this.__touchLayers[id]   = null;
			}


			// 2. Change Focus State Interaction
			if (newFocusEntity !== oldFocusEntity) {

				if (oldFocusEntity !== null) {

					if (oldFocusEntity.state !== 'default') {
						oldFocusEntity.trigger('blur');
					}

				}

				if (newFocusEntity !== null) {

					if (newFocusEntity.state === 'default') {
						newFocusEntity.trigger('focus');
					}

				}

				this.__focusEntity = newFocusEntity;

			}

		},

		simulateTouch: function(id, position, delta) {

			id       = typeof id === 'number'     ? id       : 0;
			position = position instanceof Object ? position : { x: 0, y: 0 };
			delta    = typeof delta === 'number'  ? delta    : 0;


			var renderer = this.renderer;
			if (renderer !== null) {

				position.x += renderer.width  / 2;
				position.y += renderer.height / 2;

				position.x += renderer.offset.x;
				position.y += renderer.offset.y;

			}


			this.processTouch(id, position, delta);

		}

	};


	return Class;

});

