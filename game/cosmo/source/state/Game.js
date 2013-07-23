
lychee.define('game.state.Game').requires([
	'game.entity.ui.ResultLayer'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _resultlayer = game.entity.ui.ResultLayer;
	var _hudlayer    = game.entity.ui.HUDLayer;


	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.__stagelevel = 'stage1';

		this.__result = new _resultlayer({}, game, this);
//		this.__hud    = new _hudlayer({}, this);

// TODO: HUD integration
this.__hud = {
	visible: false,
	update: function(data) {
		console.log('HUD UPDATE', data);
	}
};

		this.reset();

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		reset: function() {

			var entity = null;


			this.removeLayer('ui');


			var layer = new lychee.game.Layer();

// TODO: HUD integration
//			layer.addEntity(this.__hud);
			layer.addEntity(this.__result);


			this.setLayer('ui', layer);

		},

		enter: function(stage) {

			stage = typeof stage === 'string' ? stage : 'stage1';


			var renderer = this.renderer;
			var logic    = this.game.logic;
			if (
				renderer !== null
				&& logic !== null
			) {

				logic.bind('update', function(data) {
					this.__hud.update(data);
				}, this);

				logic.bind('success', function(data) {

					this.__hud.visible    = false;
					this.__result.visible = true;
					this.__result.success(data);

				}, this);

				logic.bind('failure', function(data) {

					this.__hud.visible    = false;
					this.__result.visible = true;
					this.__result.failure(data);

				}, this);


				this.__stagelevel = stage;

				var env = renderer.getEnvironment();
				logic.enter(this.__stagelevel, env.width, env.height);


			}


			if (this.game.settings.music === true) {
				this.game.jukebox.play('music', true);
			}


			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			if (this.game.settings.music === true) {
				this.game.jukebox.stop('music', true);
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

/*
			if (resultlayer.visible === true) {

				if (key === 'return') {

					if (this.__restart.visible === true) {

						this.leave();
						this.enter(this.__stagelevel);

					} else if (this.__continue.visible === true) {

						var stglvl = parseInt(this.__stagelevel.substr(-1), 10);

						this.leave();
						this.enter('stage' + (stglvl + 1));

					}

				} else if (key === 'escape') {

					this.game.changeState('menu');

				}

			} else if (logic !== null) {

				logic.key(key);

			}
*/

		},

		processSwipe: function(id, type, position, delta, swipe) {

			// Ignore swipe events

		},

		processTouch: function(id, position, delta) {

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
