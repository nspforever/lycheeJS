
lychee.define('game.state.Game').requires([
	'game.entity.Ball',
	'game.entity.Paddle'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _fonts = {
		headline: attachments["headline.fnt"],
		normal:   attachments["normal.fnt"]
	};


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


		this.reset();

	};


	Class.prototype = {

		reset: function() {

			lychee.game.State.prototype.reset.call(this);


			var renderer = this.renderer;
			if (renderer !== null) {

				this.removeLayer('game');


				var layer = new lychee.game.Layer();

				layer.setEntity('ball',   new game.entity.Ball());
				layer.setEntity('player', new game.entity.Paddle('player'));
				layer.setEntity('enemy',  new game.entity.Paddle('enemy'));

				var width = renderer.getEnvironment().width;

				layer.getEntity('player').setPosition({ x: -1/2 * width + 20 });
				layer.getEntity('enemy').setPosition({  x:  1/2 * width - 20 });


				this.setLayer('game', layer);

			}

		},

		__resetGame: function(winner) {

			winner = typeof winner === 'string' ? winner : null;


			var renderer = this.renderer;
			var env      = renderer.getEnvironment();


			var layer = this.getLayer('game');
			var ball  = layer.getEntity('ball');

			var velocity = {
				x: 150 + Math.random() * 100,
				y: 25  + Math.random() * 100
			};

			if (Math.random() > 0.5) velocity.y *= -1;

			if (
				winner === 'player'
				|| (winner === null && Math.random() > 0.5)
			) {
				velocity.x *= -1;
			}

			ball.setPosition({ x: 0, y: 0 });
			ball.setVelocity(velocity);


			var player = layer.getEntity('player');
			var enemy  = layer.getEntity('enemy');

			player.setPosition({ y: 0 });
			enemy.setPosition({  y: 0 });

		},

		enter: function() {

			this.__score.enemy    = 0;
			this.__score.player   = 0;
			this.__enemy.target.y = 0;

			var env = this.renderer.getEnvironment();
			this.__width  = env.width;
			this.__height = env.height;

			this.__resetGame(null);


			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			lychee.game.State.prototype.update.call(this, clock, delta);


			var layer = this.getLayer('game');
			var ball  = layer.getEntity('ball');

			var hwidth  = this.__width / 2;
			var hheight = this.__height / 2;

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
				this.__resetGame('player');
				return;
			} else if (position.x < -hwidth) {
				this.__score.enemy++;
				this.__resetGame('enemy');
				return;
			}



			/*
			 * 2: COLLISIONS
			 */

			var player = layer.getEntity('player');
			var enemy  = layer.getEntity('enemy');

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
						enemy.setVelocity({ y:  100 });
					}

					if (target.y < enemy.position.y + 10) {
						enemy.setVelocity({ y: -100 });
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
						player.setVelocity({ y:  100 });
					}

					if (target.y < player.position.y + 10) {
						player.setVelocity({ y: -100 });
					}

				}

			}

		},

		render: function(clock, delta) {

			var renderer = this.renderer;
			if (renderer !== null) {

				renderer.clear();

				// We enforce custom render() workflow
				lychee.game.State.prototype.render.call(this, clock, delta, true);


				renderer.drawText(
					100, 20,
					this.__score.player + '',
					_fonts.headline
				);

				renderer.drawText(
					this.__width - 100, 20,
					this.__score.enemy + '',
					_fonts.headline
				);


				renderer.flush();

			}

		},

		processTouch: function(id, position, delta) {

			var renderer = this.renderer;
			if (renderer !== null) {

				var env = renderer.getEnvironment();

				position.y -= env.offset.y;
				position.y -= env.height / 2;

			}


			this.__player.target.y = position.y;

		}

	};


	return Class;

});
