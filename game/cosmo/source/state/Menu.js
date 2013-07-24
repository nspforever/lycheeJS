
lychee.define('game.state.Menu').requires([
	'game.entity.Background',
	'game.entity.ui.Arrow',
	'game.entity.ui.Menu',
	'game.entity.ui.Title',
	'game.entity.ui.MultiplayerLayer',
	'game.entity.ui.SettingsLayer',
	'lychee.ui.Layer'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	/*
	 * HELPERS
	 */

	var _navigate_horizontal = function(direction) {

		var layer = this.getLayer('ui');
		var root  = layer.getEntity('root');
		if (root !== null) {

			var width = this.renderer.getEnvironment().width;
			var posx  = root.position.x;

			if (direction < 0) {
				posx += width;
			} else if (direction > 0) {
				posx -= width;
			}


			var left  = layer.getEntity('left');
			var right = layer.getEntity('right');

			if (posx >= 3/2 * width) {
				left.visible = false;
			} else if (posx < 3/2 * width) {
				left.visible = true;
			}

			if (posx <= -3/2 * width) {
				right.visible = false;
			} else if (posx > -3/2 * width) {
				right.visible = true;
			}


			this.__locked = true;

			root.setTween({
				type:     lychee.ui.Entity.TWEEN.linear,
				duration: 400,
				position: {
					x: posx
				}
			});

			this.loop.timeout(500, function() {
				this.__locked = false;
			}, this);

		}

	};

	var _show_left  = false;
	var _show_right = false;

	var _navigate_vertical = function(direction) {

		var layer = this.getLayer('ui');
		var root  = layer.getEntity('root');
		if (root !== null) {

			var height = this.renderer.getEnvironment().height;
			var posy   = root.position.y;

			if (direction < 0) {
				posy += height;
			} else if (direction > 0) {
				posy -= height;
			}

			var title = layer.getEntity('title');
			var left  = layer.getEntity('left');
			var top   = layer.getEntity('top');
			var right = layer.getEntity('right');


			if (posy <= -1/2 * height) {

				top.visible   = true;
				title.visible = false;

				if (left.visible === true) {
					left.visible = false;
					_show_left   = true;
				} else {
					_show_left   = false;
				}

				if (right.visible === true) {
					right.visible = false;
					_show_right   = true;
				} else {
					_show_right   = false;
				}

			}

			if (posy >= 1/2 * height) {

				top.visible   = false;
				title.visible = true;

				if (_show_left === true) {
					left.visible = true;
				}

				if (_show_right === true) {
					right.visible = true;
				}

			}


			this.__locked = true;

			root.setTween({
				type:     lychee.ui.Entity.TWEEN.linear,
				duration: 400,
				position: {
					y: posy
				}
			});

			this.loop.timeout(500, function() {
				this.__locked = false;
			}, this);

		}

	};

	var _load_highscores = function() {

		// TODO: Load Highscores via WebService
		console.log('Loading Highscores...');

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.__background = null;

		this.__cache      = { x: 0, y: 0 };
		this.__locked     = false;

		this.reset();

	};


	Class.prototype = {

		reset: function() {

			var renderer = this.renderer;
			if (renderer !== null) {

				var entity = null;
				var env    = renderer.getEnvironment();
				var width  = env.width;
				var height = env.height;


				this.removeLayer('ui');


				var layer = new lychee.game.Layer();

				this.__background = new game.entity.Background({
					width:  width,
					height: height
				});


				if (
					   width >= 640
					&& height >= 440
				) {

					entity = new game.entity.ui.Title({
						position: {
							x: 0,
							y: -1/2 * height + 64
						}
					});

					layer.setEntity('title', entity);


					var root = new lychee.ui.Layer({
						width:  4 * width,
						height: 2 * height,
						position: {
							x: 3/2 * width,
							y: 1/2 * height
						}
					});

					layer.setEntity('root', root);


					entity = new game.entity.ui.Menu({
						state: 'singleplayer',
						position: {
							x: -3/2 * width,
							y: -1/2 * height
						}
					});

					entity.bind('touch', function() {
						if (this.__locked === true) return false;
						this.game.changeState('game');
					}, this);

					root.addEntity(entity);



					/*
					 * MULTI PLAYER
					 */

					entity = new game.entity.ui.Menu({
						state: 'multiplayer',
						position: {
							x: -1/2 * width,
							y: -1/2 * height
						}
					});

					entity.bind('touch', function() {

						if (this.__locked === true) return false;


						var layer = this.getLayer('ui').getEntity('root').getEntity('multiplayer-layer');
						if (layer !== null) {
							layer.resetCode();
						}

						_navigate_vertical.call(this, 1);

					}, this);

					root.addEntity(entity);


					entity = new game.entity.ui.MultiplayerLayer({
						position: {
							x: -1/2 * width,
							y:  1/2 * height
						}
					}, this.game);

					root.setEntity('multiplayer-layer', entity);



					/*
					 * SETTINGS
					 */

					entity = new game.entity.ui.Menu({
						state: 'settings',
						position: {
							x:  1/2 * width,
							y: -1/2 * height
						}
					});

					entity.bind('touch', function() {
						if (this.__locked === true) return false;
						_navigate_vertical.call(this, 1);
					}, this);

					root.addEntity(entity);

					entity = new game.entity.ui.SettingsLayer({
						position: {
							x: 1/2 * width,
							y: 1/2 * height
						}
					}, this.game);

					root.setEntity('settings-layer', entity);



					/*
					 * HIGH SCORES
					 */

					entity = new game.entity.ui.Menu({
						state: 'highscores',
						position: {
							x:  3/2 * width,
							y: -1/2 * height
						}
					});

					entity.bind('touch', function() {
						if (this.__locked === true) return false;
						_navigate_vertical.call(this, 1);
						_load_highscores.call(this);
					}, this);

					root.addEntity(entity);


					var highscores = new lychee.ui.Layer({
						width: width,
						height: height,
						position: {
							x: 3/2 * width,
							y: 1/2 * height
						}
					});


					entity = new lychee.ui.Button({
						label: 'Loading...',
						font: this.game.fonts.normal,
						position: {
							x: 0,
							y: 0
						}
					});

					highscores.addEntity(entity);


					root.addEntity(highscores);



					/*
					 * NAVIGATION ARROWS
					 */

					entity = new game.entity.ui.Arrow({
						state: 'top',
						position: {
							x: 0,
							y: -1 * (156 + 32)
						},
						visible: false
					});

					entity.bind('touch', function() {
						if (this.__locked === true) return false;
						_navigate_vertical.call(this, -1);
					}, this);

					layer.setEntity('top', entity);

					entity = new game.entity.ui.Arrow({
						state: 'left',
						position: {
							x: -1 * (256 + 32),
							y:  0
						},
						visible: false
					});

					entity.bind('touch', function() {
						if (this.__locked === true) return false;
						_navigate_horizontal.call(this, -1);
					}, this);

					layer.setEntity('left', entity);

					entity = new game.entity.ui.Arrow({
						state: 'right',
						position: {
							x: 1 * (256 + 32),
							y: 0
						}
					});

					entity.bind('touch', function() {
						if (this.__locked === true) return false;
						_navigate_horizontal.call(this, 1);
					}, this);

					layer.setEntity('right', entity);

				} else {

					layer.addEntity(new game.entity.ui.Menu({
						state: 'blank',
						position: {
							x: 0,
							y: 0
						}
					}));

					entity = new lychee.ui.Button({
						label: 'Sorry,but...',
						font: this.game.fonts.normal,
						position: {
							x: 0,
							y: -1/2 * 312 + 32
						}
					});

					layer.addEntity(entity);


					entity = new lychee.ui.Button({
						label: 'Cosmo requires a',
						font: this.game.fonts.small,
						position: {
							x: 0,
							y: -48
						}
					});

					layer.addEntity(entity);

					entity = new lychee.ui.Button({
						label: 'minimum resolution',
						font: this.game.fonts.small,
						position: {
							x: 0,
							y: -24
						}
					});

					layer.addEntity(entity);

					entity = new lychee.ui.Button({
						label: 'of',
						font: this.game.fonts.small,
						position: {
							x: 0,
							y: 0
						}
					});

					layer.addEntity(entity);

					entity = new lychee.ui.Button({
						label: '640 x 440',
						font: this.game.fonts.normal,
						position: {
							x: 0,
							y: 48
						}
					});

					layer.addEntity(entity);

				}


				this.setLayer('ui', layer);

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

		},

		render: function(clock, delta) {

			var renderer = this.renderer;
			if (renderer !== null) {

				renderer.clear();

				var background = this.__background;
				if (background !== null) {

					var env = renderer.getEnvironment();

					var offsetX = env.width / 2;
					var offsetY = env.height / 2;

					background.render(
						renderer,
						offsetX,
						offsetY
					);

				}

				lychee.game.State.prototype.render.call(this, clock, delta, true);

				renderer.flush();

			}

		}

	};


	return Class;

});
