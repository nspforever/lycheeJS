
lychee.define('game.state.Demo').requires([
	'lychee.ui.Layer'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.__demo = null;

		this.reset();

	};


	Class.prototype = {

		reset: function() {

			lychee.game.State.prototype.reset.call(this);


			var width  = 0;
			var height = 0;

			if (this.renderer !== null) {

				var env = this.renderer.getEnvironment();

				width  = env.width;
				height = env.height;

			}


			this.removeLayer('demo');
			this.removeLayer('ui');


			var ui   = new lychee.game.Layer();
			var demo = new lychee.game.Layer();


			var root = new lychee.ui.Layer({
				width:  width,
				height: height,
				scrollable: false,
				position: {
					x: 0,
					y: 0
				}
			});

			ui.setEntity('root', root);


			var button = new lychee.ui.Button({
				label: '< Back',
				font: this.game.fonts.normal,
				position: {
					x: -1/2 * width + 96,
					y: -1/2 * height + 48
				}
			});

			button.bind('touch', function() {
				this.game.changeState('menu');
			}, this);

			root.addEntity(button);



			this.setLayer('demo', demo);
			this.setLayer('ui', ui);

		},

		enter: function(id) {

			this.reset();


			var valid = false;

			var construct = game.demo[id];
			if (typeof construct === 'function') {
				this.__demo = new construct(this);
				valid = true;
			}


			if (valid === true) {

				lychee.game.State.prototype.enter.call(this);

			} else {

				this.loop.timeout(0, function() {
					this.game.changeState('menu');
				}, this);

			}

		},

		leave: function() {

			this.__demo = null;

			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			lychee.game.State.prototype.update.call(this, clock, delta);

			if (
				this.__demo !== null
				&& typeof this.__demo.update === 'function'
			) {
				this.__demo.update(clock, delta);
			}

		}

	};


	return Class;

});
