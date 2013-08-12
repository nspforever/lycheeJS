
lychee.define('game.state.Game').requires([
	'game.entity.ui.HUDLayer',
	'game.entity.ui.ResultLayer'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _resultlayer = game.entity.ui.ResultLayer;
	var _hudlayer    = game.entity.ui.HUDLayer;


	var Class = function(game) {

		lychee.game.State.call(this, game);

		this.stage = {
			level: 'stage1'
		};

		this.__result = new _resultlayer({}, game, this);
		this.__hud    = new _hudlayer({}, game, this);

		this.reset();

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		reset: function() {

			lychee.game.State.prototype.reset.call(this);


			this.removeLayer('ui');


			var layer = new lychee.game.Layer();

			layer.addEntity(this.__hud);
			layer.addEntity(this.__result);


			var renderer = this.renderer;
			if (renderer !== null) {

				var env    = renderer.getEnvironment();
				var width  = env.width;
				var height = env.height;


				this.__hud.setPosition({
					x: -1/2 * width + 96,
					y: -1/2 * height + 64
				});

			}


			this.setLayer('ui', layer);

		},

		enter: function(data) {

			if (data === null) data = {};

			data.level  = typeof data.level === 'string'  ? data.level    : 'stage1';
			data.player = typeof data.player === 'number' ? data.player   : 1;
			data.type   = data.type === 'multiplayer'     ? 'multiplayer' : 'singeplayer';


			var renderer = this.renderer;
			var logic    = this.game.logic;
			if (
				renderer !== null
				&& logic !== null
			) {

				logic.bind('update', function(data) {
					this.__hud.processUpdate(data);
				}, this);

				logic.bind('success', function(data) {

					this.__hud.visible    = false;
					this.__result.visible = true;
					this.__result.processSuccess(data);

				}, this);

				logic.bind('failure', function(data) {

					this.__hud.visible    = false;
					this.__result.visible = true;
					this.__result.processFailure(data);

				}, this);


				this.stage = data;

				var env = renderer.getEnvironment();
				logic.enter(this.stage, env.width, env.height);

			}


			this.__result.visible = false;
			this.__hud.visible    = true;


			if (this.game.settings.music === true) {
				this.game.jukebox.play('music-game', true);
			}


			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			if (this.game.settings.music === true) {
				this.game.jukebox.stop('music-game');
			}


			var logic = this.game.logic;
			if (logic !== null) {

				logic.leave();
				logic.unbind('failure');
				logic.unbind('update');
				logic.unbind('success');

			}


			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			var logic = this.game.logic;
			if (logic !== null) {
				logic.update(clock, delta);
			}


			lychee.game.State.prototype.update.call(this, clock, delta);

		},

		render: function(clock, delta) {

			var renderer = this.renderer;
			if (renderer !== null) {

				var layer;

				var env = renderer.getEnvironment();
				var offsetX = env.width / 2;
				var offsetY = env.height / 2;


				renderer.clear();


				var logic = this.game.logic;
				if (logic !== null) {
					logic.render(clock, delta);
				}


				lychee.game.State.prototype.render.call(this, clock, delta, true);


				renderer.flush();

			}

		},

		processKey: function(key, name, delta) {

			var logic = this.game.logic;

			logic.key(key);

		},

		processSwipe: function(id, type, position, delta, swipe) {

			// Ignore swipe events

		},

		processTouch: function(id, position, delta) {

			var result = this.__result;
			if (result.visible === true) {

				lychee.game.State.prototype.processTouch.call(this, id, position, delta);

			} else {

				var renderer = this.renderer;
				if (renderer !== null) {

					var env = renderer.getEnvironment();

					position.x -= env.width / 2;
					position.y -= env.height / 2;

				}


				var logic = this.game.logic;
				if (logic !== null) {
					logic.touch(position);
				}
			}

		},



		/*
		 * CUSTOM API
		 */

		__updateStatistics: function(data) {

			var blob = [
				data.destroyed + '',
				data.missed + '',
				((data.destroyed / (data.destroyed + data.missed) * 100) + '').substr(0, 5) + '%'
			];

			var length = 0;
			for (var b = 0; b < blob.length; b++) {
				length = Math.max(blob[b].length, length);
			}


			for (var b = 0; b < blob.length; b++) {
				for (var l = blob[b].length; l <= length; l++) {
					blob[b] = ' ' + blob[b];
				}
			}


			var dest = this.__destroyed;
			var miss = this.__missed;
			var rate = this.__rating;

			dest.setLabel('Destroyed: ' + blob[0]);
			miss.setLabel('Missed:    ' + blob[1]);
			rate.setLabel('Result:    ' + blob[2]);

		}

	};


	return Class;

});
