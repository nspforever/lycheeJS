
lychee.define('game.state.Game').requires([
	'game.entity.Background',
	'game.entity.Deco',
	'game.logic.Level',
	'lychee.ui.Layer'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.reset();

	};


	Class.prototype = {

		reset: function() {

			lychee.game.State.prototype.reset.call(this);


			var renderer = this.renderer;
			if (renderer !== null) {

				var entity = null;
				var tile   = this.game.settings.tile;
				var width  = renderer.getEnvironment().width;
				var height = renderer.getEnvironment().height;


				this.removeLayer('bg');
				this.removeLayer('gamebg');
				this.removeLayer('gamefg');
				this.removeLayer('uibg');
				this.removeLayer('uifg');


				var bglayer     = new lychee.game.Layer();
				var gamebglayer = new lychee.game.Layer();
				var gamefglayer = new lychee.game.Layer();
				var uibglayer   = new lychee.game.Layer();
				var uifglayer   = new lychee.game.Layer();


				var gamewidth  = Math.min(width / 4 * 3, 16 * 64);
				var gameheight = Math.min(height,         6 * 64);
				var uiwidth    = Math.min(width / 4,     width - gamewidth);
				var uiheight   = height;

				var gameposx   = -1/2 * (width - gamewidth) + (width - gamewidth - uiwidth) / 2;
				var gameposy   = 0;
				var uiposx     = (width - uiwidth) / 2;
				var uiposy     = 0;


				var deltah = height - gameheight;
				var dhy = (deltah / tile) | 0;
				if (dhy > 0) {
					gameposy = -1/2 * deltah + tile;
				} else {
					gameposy = -1/2 * deltah;
				}



				/*
				 * LAYER SETUP
				 */

				entity = new lychee.ui.Layer({
					width:  uiwidth,
					height: uiheight,
					position: {
						x: uiposx,
						y: uiposy
					}
				});

				uifglayer.setEntity('root', entity);

				entity = new lychee.ui.Layer({
					width:  uiwidth,
					height: uiheight,
					position: {
						x: uiposx,
						y: uiposy
					}
				});

				uibglayer.setEntity('root', entity);


				entity = new lychee.ui.Layer({
					width:  gamewidth,
					height: gameheight,
					position: {
						x: gameposx,
						y: gameposy
					}
				});

				gamefglayer.setEntity('root', entity);


				entity = new lychee.ui.Layer({
					width:  gamewidth,
					height: gameheight,
					position: {
						x: gameposx,
						y: gameposy
					}
				});

				gamebglayer.setEntity('root', entity);



				/*
				 * BACKGROUND
				 */


				entity = new game.entity.Background({
					width:    width,
					height:   height
				});

				bglayer.addEntity(entity);





				var uibgroot = uibglayer.getEntity('root');
				var uifgroot = uifglayer.getEntity('root');
				var offsetX = -1/2 * uibgroot.width;
				var offsetY = -1/2 * uibgroot.height;
				var sizeX = ((uibgroot.width  / 64) | 0) + 1;
				var sizeY = ((uibgroot.height / 64) | 0) + 1;

				for (var x = 0; x < sizeX; x++) {

					for (var y = 0; y < sizeY; y++) {

						if (
							x >= 1
							&& x <= 4
							&& (y === 2 || y === 4)
						) {

							var entity   = new game.entity.Deco();
							var substate = game.entity.Deco.substate(x, y);

							entity.setState('dark-' + substate);

							entity.setPosition({
								x: offsetX + tile / 2 + x * tile,
								y: offsetY + tile / 2 + y * tile
							});

							uibgroot.addEntity(entity);

						}

					}

				}


				entity = new lychee.ui.Button({
					label:  '0',
					font:   this.game.fonts.normal,
					width:  4 * tile,
					height: 1 * tile,
					position: {
						x: offsetX + 3 * tile,
						y: offsetY + tile / 2 + 2 * tile
					}
				});

				this.__time = entity;
				uifgroot.addEntity(entity);

				entity = new lychee.ui.Button({
					label:  '0',
					font:   this.game.fonts.normal,
					width:  4 * tile,
					height: 1 * tile,
					position: {
						x: offsetX + 3 * tile,
						y: offsetY + tile / 2 + 4 * tile
					}
				});

				this.__points = entity;
				uifgroot.addEntity(entity);



				this.setLayer('bg',     bglayer);
				this.setLayer('gamebg', gamebglayer);
				this.setLayer('gamefg', gamefglayer);
				this.setLayer('uibg',   uibglayer);
				this.setLayer('uifg',   uifglayer);

			}

		},

		enter: function(mode) {

			var enummode = 0;
			if (game.logic.Level.MODE[mode] === undefined) {
				enummode = game.logic.Level.MODE['easy'];
			} else {
				enummode = game.logic.Level.MODE[mode];
			}


			this.getLayer('gamebg').getEntity('root').reset();
			this.getLayer('gamefg').getEntity('root').reset();


			var logic = this.game.logic;
			if (logic !== null) {

				logic.enter(this, enummode);
				logic.bind('result', function(data) {
					this.game.changeState('result', data);
				}, this, true);

				logic.score.bind('update', function(data) {
					this.__time.setLabel(((data.time / 1000) | 0) + '');
					this.__points.setLabel(data.points + '');
				}, this);


				if (this.game.settings.music === true) {
					this.game.jukebox.fadeIn('music', 2000, true, 0.5);
				}

			}


			lychee.game.State.prototype.enter.call(this);

		},

		leave: function(data) {

			this.game.logic.leave(this, data);

			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			this.game.logic.update(clock, delta);

			lychee.game.State.prototype.update.call(this, clock, delta);

		}

	};


	return Class;

});

