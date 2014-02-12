
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


		var boundx = 0;
		var boundy = 0;

		for (var e = 0, el = this.entities.length; e < el; e++) {

			var entity = this.entities[e];
			var tile   = this.__tiles[e] || null;
			if (tile !== null) {

				entity.setPosition({
					x: tile.x * tilewidth,
					y: tile.y * tileheight
				});

				boundx = Math.max(boundx, tile.x);
				boundy = Math.max(boundy, tile.y);

			}

		}


		this.bound.x = boundx;
		this.bound.y = boundy;


		this.setOffset({
			x: -1 * this.tile.x * this.tilewidth,
			y: -1 * this.tile.y * this.tileheight
		});

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		this.bound      = { x: 0, y: 0 };
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

