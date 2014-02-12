
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



	/*
	 * HELPERS
	 */

	var _refresh_arrows = function(root) {

		if (root.tile.y === 0) {

			this.queryLayer('ui', 'arrow-top').setVisible(false);

			if (root.tile.x > 0) {
				this.queryLayer('ui', 'arrow-left').setVisible(true);
			} else {
				this.queryLayer('ui', 'arrow-left').setVisible(false);
			}

			if (root.tile.x < root.bound.x) {
				this.queryLayer('ui', 'arrow-right').setVisible(true);
			} else {
				this.queryLayer('ui', 'arrow-right').setVisible(false);
			}

		} else if (root.tile.y > 0) {

			this.queryLayer('ui', 'arrow-top').setVisible(true);
			this.queryLayer('ui', 'arrow-right').setVisible(false);
			this.queryLayer('ui', 'arrow-left').setVisible(false);

		}


		if (root.tile.y < root.bound.y) {
			this.queryLayer('ui', 'arrow-bottom').setVisible(true);
		} else {
			this.queryLayer('ui', 'arrow-bottom').setVisible(false);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

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
				_refresh_arrows.call(this, root);

			}, this);

			entity = this.queryLayer('ui', 'arrow-right');
			entity.bind('touch', function() {

				var root = this.queryLayer('tiles', 'root');

				if (root.tile.y === 0) {
					root.setTile({ x: root.tile.x + 1 });
					_refresh_arrows.call(this, root);
				}

			}, this);

			entity = this.queryLayer('ui', 'arrow-bottom');
			entity.bind('touch', function() {

				var root = this.queryLayer('tiles', 'root');

				root.setTile({ y: root.tile.y + 1 });
				_refresh_arrows.call(this, root);

			}, this);

			entity = this.queryLayer('ui', 'arrow-left');
			entity.bind('touch', function() {

				var root = this.queryLayer('tiles', 'root');

				if (root.tile.y === 0) {
					root.setTile({ x: root.tile.x - 1 });
					_refresh_arrows.call(this, root);
				}

			}, this);


			entity = this.queryLayer('tiles', 'root > singleplayer-details');
			entity.bind('touch', function() {

				this.game.changeState('game', {
					type: 'singleplayer',
					touchcontrols: this.game.settings.touchcontrols
				});

			}, this);

			entity = this.queryLayer('tiles', 'root > settings-details > fullscreen');
			entity.setLabel('Fullscreen:' + ((this.game.viewport.fullscreen === true) ? ' On': 'Off'));
			entity.bind('#touch', function(entity) {

				var viewport   = this.game.viewport;
				var fullscreen = !viewport.fullscreen;

				entity.setLabel('Fullscreen:' + ((fullscreen === true) ? ' On': 'Off'));
				viewport.setFullscreen(fullscreen);

			}, this);

			entity = this.queryLayer('tiles', 'root > settings-details > touch');
			entity.setLabel('Touch:     ' + ((this.game.settings.touchcontrols === true) ? ' On': 'Off'));
			entity.bind('#touch', function(entity) {

				var touch = !this.game.settings.touchcontrols;

				entity.setLabel('Touch:     ' + ((touch === true) ? ' On': 'Off'));
				this.game.settings.touchcontrols = touch;

			}, this);

			entity = this.queryLayer('tiles', 'root > settings-details > music');
			entity.setLabel('Music:     ' + ((this.game.jukebox.music === true) ? ' On': 'Off'));
			entity.bind('#touch', function(entity) {

				var jukebox = this.game.jukebox;
				var music   = !jukebox.music;

				entity.setLabel('Music:     ' + ((music === true) ? ' On': 'Off'));
				jukebox.setMusic(music);

			}, this);

			entity = this.queryLayer('tiles', 'root > settings-details > sound');
			entity.setLabel('Sound:     ' + ((this.game.jukebox.sound === true) ? ' On': 'Off'));
			entity.bind('#touch', function(entity) {

				var jukebox = this.game.jukebox;
				var sound   = !jukebox.sound;

				entity.setLabel('Sound:     ' + ((sound === true) ? ' On': 'Off'));
				jukebox.setSound(sound);

			}, this);

			entity = this.queryLayer('tiles', 'root > settings-details > debug');
			entity.setLabel('Debug:     ' + ((lychee.debug === true) ? ' On': 'Off'));
			entity.bind('#touch', function(entity) {

				var debug = !lychee.debug;

				entity.setLabel('Debug:     ' + ((debug === true) ? ' On': 'Off'));
				lychee.debug = debug;

			}, this);

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
				this.__background = entity;


				entity = this.queryLayer('tiles', 'root');
				entity.setTileWidth(renderer.width);
				entity.setTileHeight(renderer.height);

			}

		},

		enter: function(data) {

			lychee.game.State.prototype.enter.call(this);


			var root = this.queryLayer('tiles', 'root');
			if (root !== null) {
				root.setTile({ x: 0 });
				_refresh_arrows.call(this, root);
			}

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
