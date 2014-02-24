
lychee.define('game.state.Game').requires([
	'game.entity.Ball',
	'game.entity.Paddle',
	'lychee.ui.Label'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _blob  = attachments["json"];
	var _fonts = {
		headline: attachments["headline.fnt"],
		normal:   attachments["normal.fnt"]
	};



	/*
	 * HELPERS
	 */

	var _reset_game = function(winner) {

		winner = typeof winner === 'string' ? winner : null;


		var ball = this.queryLayer('game', 'ball');
		if (ball !== null) {

			var position = {
				x: 0,
				y: 0
			};
			var velocity = {
				x: 150 + Math.random() * 100,
				y: 100 + Math.random() * 100
			};

			if (Math.random() > 0.5) {
				velocity.y *= -1;
			}

			if (winner === 'player') {
				velocity.x *= -1;
			}

			ball.setPosition(position);
			ball.setVelocity(velocity);

		}


		var score = this.queryLayer('ui', 'score');
		if (score !== null) {
			score.setLabel(this.__score.player + ' - ' + this.__score.enemy);
		}


		this.queryLayer('game', 'player').setPosition({ y: 0 });
		this.queryLayer('game', 'enemy').setPosition({ y: 0 });

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.__enemy = {
			clock:  null,
			delta:  500,
			target: { y: 0 }
		};
		this.__player = {
			target: { y: 0 }
		};

		this.__score = {
			player: 0,
			enemy:  0
		};


		this.deserialize(_blob);
		this.reshape();

	};


	Class.prototype = {

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);

		},

		reshape: function(orientation, rotation) {

			lychee.game.State.prototype.reshape.call(this, orientation, rotation);


			var entity = null;


			var renderer = this.renderer;
			if (renderer !== null) {

				var width  = renderer.width;
				var height = renderer.height;


				this.getLayer('ui').reshape();
				this.getLayer('game').reshape();


				entity = this.queryLayer('ui', 'score');
				entity.setPosition({
					x: 0,
					y: -1/2 * height + 42
				});

				entity = this.queryLayer('game', 'player');
				entity.setPosition({ x: -1/2 * width + 20 });

				entity = this.queryLayer('game', 'enemy');
				entity.setPosition({ x:  1/2 * width - 40 });

			}

		},

		enter: function() {

			this.__score.enemy    = 0;
			this.__score.player   = 0;
			this.__enemy.target.y = 0;


			_reset_game.call(this, null);


			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			lychee.game.State.prototype.update.call(this, clock, delta);


			var ball   = this.queryLayer('game', 'ball');
			var player = this.queryLayer('game', 'player');
			var enemy  = this.queryLayer('game', 'enemy');

			var hwidth  = this.renderer.width / 2;
			var hheight = this.renderer.height / 2;

			var position = ball.position;
			var velocity = ball.velocity;


			/*
			 * 1: WORLD BOUNDARIES
			 */

			if (position.y > hheight && velocity.y > 0) {
				position.y = hheight - 1;
				velocity.y = -1 * velocity.y;
			}

			if (position.y < -hheight && velocity.y < 0) {
				position.y = -hheight + 1;
				velocity.y = -1 * velocity.y;
			}


			if (position.x > hwidth) {
				this.__score.player++;
				_reset_game.call(this, 'player');
				return;
			} else if (position.x < -hwidth) {
				this.__score.enemy++;
				_reset_game.call(this, 'enemy');
				return;
			}



			/*
			 * 2: COLLISIONS
			 */

			if (ball.collidesWith(player) === true) {
				velocity.x = Math.abs(velocity.x);
			}

			if (ball.collidesWith(enemy) === true) {
				velocity.x = -1 * Math.abs(velocity.x);
			}



			/*
			 * 3: ENEMY (AI) LOGIC
			 */

			var data   = this.__enemy;
			var target = this.__enemy.target;

			if (data.clock === null) {
				data.clock = clock;
			}

			if ((clock - data.clock) > data.delta) {

				target.y   = position.y;
				data.clock = clock;

				if (
					   target.y > enemy.position.y - 10
					&& target.y < enemy.position.y + 10
				) {

					target.y = enemy.position.y;
					enemy.setVelocity({ y: 0 });

				} else {

					if (target.y > enemy.position.y - 10) {
						enemy.setVelocity({ y:  200 });
					}

					if (target.y < enemy.position.y + 10) {
						enemy.setVelocity({ y: -200 });
					}

				}

			}



			/*
			 * 4: PLAYER LOGIC
			 */

			var target = this.__player.target;
			if (target.y !== null) {

				if (
					   target.y > player.position.y - 10
					&& target.y < player.position.y + 10
				) {

					player.setVelocity({ y: 0 });
					target.y = null;

				} else {

					if (target.y > player.position.y - 10) {
						player.setVelocity({ y:  250 });
					}

					if (target.y < player.position.y + 10) {
						player.setVelocity({ y: -250 });
					}

				}

			}

		},

		processTouch: function(id, position, delta) {

			var renderer = this.renderer;
			if (renderer !== null) {

				position.y -= renderer.offset.y;
				position.y -= renderer.height / 2;

			}


			this.__player.target.y = position.y;

		}

	};


	return Class;

});
