
lychee.define('game.entity.ui.Widget').includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		this.sidebar = null;

		this.margin = 24;
		this.reflow = {
			x: true,
			y: true
		};


		this.setMargin(settings.margin);
		this.setReflow(settings.reflow);

		delete settings.margin;
		delete settings.reflow;


		lychee.ui.Layer.call(this, settings);


		this.relayout();

		settings = null;

	};


	Class.prototype = {

		/*
		 * GAME UI API
		 */

		relayout: function(shiftposition) {

			shiftposition = shiftposition === true;


			var margin = this.margin;


			// 1. Determine the approximate width and height
			var width  = 0;
			var height = 0;

			for (var e = 0, el = this.entities.length; e < el; e++) {

				var entity = this.entities[e];

				width   = Math.max(width, entity.width);
				height += entity.height + margin;

			}

			height += margin;


			// 2. Reflow the calculated width/height if required
			if (this.reflow.x === false) width  = this.width;
			if (this.reflow.y === false) height = this.height;


			// 3. Reset the offsets and positions
			var posx = 0;
			var posy = -1/2 * height + margin;


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


			// 6. Relayout this widget (if reflow is wanted)
			if (this.reflow.x === true) {

				if (shiftposition === true) {
					this.position.x += (width - this.width) / 2;
				}

				this.width = width;

			}

			if (this.reflow.y === true) {

				if (shiftposition === true) {
					this.position.y += (height - this.height) / 2;
				}

				this.height = height;

			}


			// 7. Relayout the Sidebar (if given)
			if (
				   shiftposition === true
				&& this.sidebar !== null
			) {
				this.sidebar.relayout();
			}

		},



		/*
		 * CUSTOM API
		 */

		addEntity: function(entity) {

			var result = lychee.ui.Layer.prototype.addEntity.call(this, entity);
			if (result === true) {
				this.relayout();
			}

		},

		removeEntity: function(entity) {

			var result = lychee.ui.Layer.prototype.removeEntity.call(this, entity);
			if (result === true) {
				this.relayout();
			}

		},

		setReflow: function(reflow) {

			if (reflow instanceof Object) {

				this.reflow.x = typeof reflow.x === 'boolean' ? reflow.x : this.reflow.x;
				this.reflow.y = typeof reflow.y === 'boolean' ? reflow.y : this.reflow.y;

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

