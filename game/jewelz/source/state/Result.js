
lychee.define('game.state.Result').requires([
	'lychee.ui.Layer',
	'lychee.ui.Button'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.__locked = false;
		this.__points = null;

		this.reset();

	};


	Class.prototype = {

		reset: function() {

			lychee.game.State.prototype.reset.call(this);


			var renderer = this.renderer;
			if (renderer !== null) {

				var entity = null;
				var width  = renderer.getEnvironment().width;
				var height = renderer.getEnvironment().height;


				this.removeLayer('ui');


				var layer = new lychee.game.Layer();

				var root = new lychee.ui.Layer({
					width:  width,
					height: height,
					position: {
						x: 0,
						y: 0
					}
				});

				layer.addEntity(root);

				entity = new lychee.ui.Button({
					label: 'Game Over',
					font:  this.game.fonts.normal,
					position: {
						x: 0,
						y: -24
					}
				});

				root.addEntity(entity);

				entity = new lychee.ui.Button({
					label: '0 Points',
					font:  this.game.fonts.normal,
					position: {
						x: 0,
						y: 50
					}
				});

				layer.addEntity(entity);
				this.__points = entity;


				entity = new lychee.ui.Button({
					label: 'Touch to get back to Menu',
					font:  this.game.fonts.small,
					position: {
						x: 0,
						y: 1/2 * height - 24
					}
				});

				layer.addEntity(entity);



				this.setLayer('ui', layer);

			}

		},

		enter: function(data) {

			if (data instanceof Object) {
				data.points = typeof data.points === 'number' ? data.points : 0;
			}

			this.__locked = true;

			this.loop.setTimeout(1000, function() {
				this.__locked = false;
			}, this);

			this.__points.setLabel(data.points + ' Points');


			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			if (this.game.jukebox.isPlaying('music') === true) {
				this.game.jukebox.stop('music');
			}

			lychee.game.State.prototype.leave.call(this);

		},

		processTouch: function(position, delta) {

			if (this.__locked === true) return;

			this.game.changeState('menu');

		}

	};


	return Class;

});

