
lychee.define('game.entity.ui.Sidebar').requires([
	'game.entity.ui.Widget'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var _widget = game.entity.ui.Widget;


	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		this.margin = 10;

		this.__offsetX = 0;
		this.__offsetY = 0;


		this.setMargin(settings.margin);

		delete settings.margin;


		lychee.ui.Layer.call(this, settings);


		this.relayout()

		settings = null;


	};


	Class.prototype = {

		/*
		 * GAME UI API
		 */

		relayout: function() {

			var margin = this.margin;
			var width  = this.width;
			var height = this.height;


			// 3. Reset the offsets and positions
			this.__offsetX = 0;
			this.__offsetY = -1/2 * height + margin;

			var posx = this.__offsetX;
			var posy = this.__offsetY;


			// 4. Relayout the entities
			for (var e = 0, el = this.entities.length; e < el; e++) {

				var entity = this.entities[e];

				posy += entity.height / 2;

				entity.setPosition({
					x: posx,
					y: posy
				});

				posy += entity.height / 2
				posy += margin;

			}

			this.__offsetX = posx;
			this.__offsetY = posy;

		},



		/*
		 * ENTITY API
		 */

		render: function(renderer, offsetX, offsetY) {

			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;


			var hwidth  = this.width / 2;
			var hheight = this.height / 2;

			renderer.drawBox(
				x - hwidth,
				y - hheight,
				x + hwidth,
				y + hheight,
				'#282828',
				true
			);


			for (var e = 0, el = this.entities.length; e < el; e++) {

				var widget   = this.entities[e];
				var entities = widget.entities;

				var whw = widget.width / 2;
				var whh = widget.height / 2;
				var wpx = x + widget.position.x;
				var wpy = y + widget.position.y;


				if (lychee.debug === true) {

					renderer.drawBox(
						wpx - whw,
						wpy - whh,
						wpx + whw,
						wpy + whh,
						'#ff00ff',
						false,
						1
					);

				}

				for (var e2 = 0, e2l = entities.length; e2 < e2l; e2++) {

					entities[e2].render(
						renderer,
						wpx,
						wpy
					);

				}

			}

		},



		/*
		 * CUSTOM API
		 */

		addEntity: function(entity) {

			if (entity instanceof _widget) {

				var result = lychee.ui.Layer.prototype.addEntity.call(this, entity);
				if (result === true) {

					entity.sidebar = this;

					this.relayout();
					return true;

				}

			}


			return false;

		},

		removeEntity: function(entity) {

			var result = lychee.ui.Layer.prototype.removeEntity.call(this, entity);
			if (result === true) {

				entity.sidebar = null;

				this.relayout();
				return true;

			}


			return false;

		},

		setMargin: function(margin) {

			margin = typeof margin === 'number' ? margin : null;


			if (margin !== null) {

				this.margin = margin;
				return true;

			}


			return false;

		}

	};


	return Class;

});

