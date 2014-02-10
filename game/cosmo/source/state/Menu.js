
lychee.define('game.state.Menu').requires([
	'lychee.ui.Button',
	'game.entity.game.Background',
	'game.entity.menu.Button',
	'game.entity.menu.Layer',
	'game.entity.menu.TileLayer'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _blob = attachments["json"];
	var _font = attachments["fnt"];


	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.__background = null;


		this.deserialize(_blob);
		this.reshape();

	};


	Class.prototype = {

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);


			var entity = null;



			entity = this.queryLayer('ui', 'arrow-top');
			entity.bind('touch', function() {

				var root = this.queryLayer('tiles', 'root');

				root.setTile({ y: root.tile.y - 1 });

			}, this);

			entity = this.queryLayer('ui', 'arrow-right');
			entity.bind('touch', function() {

				var root = this.queryLayer('tiles', 'root');

				if (root.tile.y === 0) {
					root.setTile({ x: root.tile.x + 1 });
				}

			}, this);

			entity = this.queryLayer('ui', 'arrow-bottom');
			entity.bind('touch', function() {

				var root = this.queryLayer('tiles', 'root');

				root.setTile({ y: root.tile.y + 1 });

			}, this);

			entity = this.queryLayer('ui', 'arrow-left');
			entity.bind('touch', function() {

				var root = this.queryLayer('tiles', 'root');

				if (root.tile.y === 0) {
					root.setTile({ x: root.tile.x - 1 });
				}

			}, this);


			entity = this.queryLayer('tiles', 'root > settings-details > fullscreen');
			entity.bind('#touch', function(entity) {
				console.log('test!');
				self.setLabel('test');
			}, this);

// TODO: Remove this
console.log(this.__layers);

		},

		reshape: function(orientation, rotation) {

			lychee.game.State.prototype.reshape.call(this, orientation, rotation);


			var renderer = this.renderer;
			if (renderer !== null) {

				var entity = null;
				var width  = renderer.width;
				var height = renderer.height;


				entity = this.queryLayer('background', 'background');
				entity.width  = renderer.width;
				entity.height = renderer.height;
				entity.setOrigin({
					x: 0,
					y: 0
				});
				this.__background = entity;


				entity = this.queryLayer('tiles', 'root');
				entity.setTileWidth(renderer.width);
				entity.setTileHeight(renderer.height);

			}

		},

		enter: function(data) {

			lychee.game.State.prototype.enter.call(this);

		},

		update: function(clock, delta) {

			lychee.game.State.prototype.update.call(this, clock, delta);


			var background = this.__background;
			if (background !== null) {

				var origin = background.origin;

				background.setOrigin({
					y: origin.y + 10 * (delta / 1000)
				});

			}

		}

	};


	return Class;

});
