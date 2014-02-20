
lychee.define('lychee.game.State').requires([
	'lychee.game.Layer',
	'lychee.ui.Layer'
]).exports(function(lychee, global) {


	/*
	 * HELPERS
	 */

	var _trace_entity_offset = function(entity, layer, offsetX, offsetY) {

		if (offsetX === undefined || offsetY === undefined) {

			this.x  = 0;
			this.y  = 0;
			offsetX = layer.position.x;
			offsetY = layer.position.y;

		}


		if (layer === entity) {

			this.x = offsetX;
			this.y = offsetY;

			return true;

		} else if (layer.entities !== undefined) {

			var entities = layer.entities;
			for (var e = entities.length - 1; e >= 0; e--) {

				var dx = layer.offset.x + entities[e].position.x;
				var dy = layer.offset.y + entities[e].position.y;


				var result = _trace_entity_offset.call(
					this,
					entity,
					entities[e],
					offsetX + dx,
					offsetY + dy
				);

				if (result === true) {
					return true;
				}

			}

		}


		return false;

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


		this.__layers  = {};
		this.__focus   = null;
		this.__touches = [
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } }
		];

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
					this.__layers[id].reshape();
				}

			}

		},

		enter: function() {

			var input = this.input;
			if (input !== null) {
				input.bind('key',   this.processKey,   this);
				input.bind('touch', this.processTouch, this);
				input.bind('swipe', this.processSwipe, this);
			}

		},

		leave: function() {

			var focus = this.__focus;
			if (focus !== null) {
				focus.trigger('blur');
			}


			for (var t = 0, tl = this.__touches.length; t < tl; t++) {

				var touch = this.__touches[t];
				if (touch.entity !== null) {
					touch.entity = null;
					touch.layer  = null;
				}

			}


			this.__focus = null;


			var input = this.input;
			if (input !== null) {
				input.unbind('swipe', this.processSwipe, this);
				input.unbind('touch', this.processTouch, this);
				input.unbind('key',   this.processKey,   this);
			}

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

			var focus = this.__focus;
			if (focus !== null) {

				var result = focus.trigger('key', [ key, name, delta ]);
				if (
					   result === true
					&& key === 'return'
					&& focus.state === 'default'
				) {

					this.__focus = null;

				}

			}

		},

		processTouch: function(id, position, delta) {

			var args = [ id, {
				x: 0,
				y: 0
			}, delta ];


			var x = position.x;
			var y = position.y;


			var renderer = this.renderer;
			if (renderer !== null) {

				x -= renderer.offset.x;
				y -= renderer.offset.y;

			}


			var touch_layer  = null;
			var touch_entity = null;

			for (var lid in this.__layers) {

				var layer = this.__layers[lid];
				if (layer.visible === false) continue;

				if (layer instanceof lychee.ui.Layer) {

					args[1].x = x - layer.position.x;
					args[1].y = y - layer.position.y;


					var result = layer.trigger('touch', args);
					if (
						   result !== true
						&& result !== false
						&& result !== null
					) {

						touch_entity = result;
						touch_layer  = layer;

						break;

					}

				}

			}


			var old_focus = this.__focus;
			var new_focus = touch_entity;

			// 1. Reset Touch trace data if no Entity was touched
			if (new_focus === null) {
				this.__touches[id].entity = null;
				this.__touches[id].layer  = null;
			}


			// 2. Change Focus State Interaction
			if (new_focus !== old_focus) {

				if (old_focus !== null) {

					if (old_focus.state !== 'default') {
						old_focus.trigger('blur');
					}

				}

				if (new_focus !== null) {

					if (new_focus.state === 'default') {
						new_focus.trigger('focus');
					}

				}


				this.__focus = new_focus;

			}


			// 3. Prepare UI Swipe event
			if (touch_entity !== null) {

				var touch = this.__touches[id];

				touch.entity   = new_focus;
				touch.layer    = touch_layer;


				// TODO: Fix intelligent reshape() calls for resizing entities on touch events
				this.loop.setTimeout(300, function() {
					this.reshape();
				}, touch.layer);


				_trace_entity_offset.call(
					touch.offset,
					touch.entity,
					touch.layer
				);

			}

		},

		processSwipe: function(id, type, position, delta, swipe) {

			var touch = this.__touches[id];
			if (touch.entity !== null) {

				if (touch.layer.visible === false) return;


				var args = [ id, type, position, delta, swipe ];

				var renderer = this.renderer;
				if (renderer !== null) {

					args[2].x -= renderer.offset.x;
					args[2].y -= renderer.offset.y;

				}


				if (type === 'start') {

					_trace_entity_offset.call(
						touch.offset,
						touch.entity,
						touch.layer
					);


					args[2].x -= touch.offset.x;
					args[2].y -= touch.offset.y;

					var result = touch.entity.trigger('swipe', args);
					if (result === false) {
						touch.entity = null;
						touch.layer  = null;
					}

				} else if (type === 'move') {

					args[2].x -= touch.offset.x;
					args[2].y -= touch.offset.y;

					var result = touch.entity.trigger('swipe', args);
					if (result === false) {
						touch.entity = null;
						touch.layer  = null;
					}

				} else if (type === 'end') {

					args[2].x -= touch.offset.x;
					args[2].y -= touch.offset.y;

					var result = touch.entity.trigger('swipe', args);
					if (result === false) {
						touch.entity = null;
						touch.layer  = null;
					}

				}

			}

		},

		// TODO: Remove legacy API simulateTouch(), not necessary anymore

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

