
lychee.define('game.entity.menu.TileLayer').includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _validate_tile = function(position) {

		var tiles = this.__tiles;
		var found = false;


		for (var t = 0, tl = this.__tiles.length; t < tl; t++) {

			var tile = this.__tiles[t];
			if (
				   tile.x === position.x
				&& tile.y === position.y
			) {
				found = true;
			}

		}


		return found;

	};

	var _refresh_tiles = function() {

		var tiles      = this.__tiles;
		var entities   = this.entities;
		var tilewidth  = this.tilewidth;
		var tileheight = this.tileheight;


		var width  = 0;
		var height = 0;

		for (var e = 0, el = this.entities.length; e < el; e++) {

			var entity = this.entities[e];
			var tile   = this.__tiles[e] || null;
			if (tile !== null) {

				entity.setPosition({
					x: tile.x * tilewidth,
					y: tile.y * tileheight
				});


				width  = Math.max(width,  tile.x * tilewidth  + tilewidth);
				height = Math.max(height, tile.y * tileheight + tileheight);

			}

		}



		this.width  = width;
		this.height = height;


		this.__isDirty = true;


		var ox = -1 * this.tile.x * this.tilewidth;
		var oy = -1 * this.tile.y * this.tileheight;

// TODO: Remove this
console.log('root layer offset', ox, oy);

		this.setOffset({
			x: ox,
			y: oy
		});

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		this.tile       = { x: 0, y: 0 };
		this.tilewidth  = 0;
		this.tileheight = 0;

		this.__tiles = [];


		lychee.ui.Layer.call(this, settings);


		this.setTile(settings.tile);
		this.setTileWidth(settings.tilewidth);
		this.setTileHeight(settings.tileheight);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			lychee.ui.Layer.prototype.deserialize.call(this, blob);


			this.__tiles = [];

			for (var t = 0, tl = blob.tiles.length; t < tl; t++) {

				var tile   = blob.tiles[t];
				var entity = this.entities[t] || null;
				if (entity !== null) {

					this.__tiles.push({
						x: tile.x,
						y: tile.y
					});

				}

			}


			_refresh_tiles.call(this);

		},


		/*
		 * CUSTOM API
		 */

		setTile: function(tile) {

			tile = tile instanceof Object ? tile : null;

			if (tile !== null) {

				tile.x = typeof tile.x === 'number' ? tile.x : this.tile.x;
				tile.y = typeof tile.y === 'number' ? tile.y : this.tile.y;


				if (_validate_tile.call(this, tile) === true) {

					this.tile.x = tile.x;
					this.tile.y = tile.y;

					_refresh_tiles.call(this);

					return true;

				}

			}


			return false;

		},

		setTileWidth: function(width) {

			width = typeof width === 'number' ? width : null;


			if (width !== null) {

				this.tilewidth = width;

				_refresh_tiles.call(this);

				return true;

			}


			return false;

		},

		setTileHeight: function(height) {

			height = typeof height === 'number' ? height : null;


			if (height !== null) {

				this.tileheight = height;

				_refresh_tiles.call(this);

				return true;

			}


			return false;

		}

	};


	return Class;

});

