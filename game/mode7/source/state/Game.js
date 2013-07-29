
lychee.define('game.state.Game').requires([
	'game.entity.lycheeJS',
	'game.entity.Track'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.camera = game.camera || null;

		this.__autopilot = false;
		this.__direction = 1;
		this.__offset    = 0;
		this.__logo      = null;
		this.__track     = null;

		this.reset();

	};


	Class.prototype = {

		reset: function() {

			lychee.game.State.prototype.reset.call(this);


			var renderer = this.renderer;
			if (renderer !== null) {

				var env = renderer.getEnvironment();

				this.__logo = new game.entity.lycheeJS({
					position: {
						x: env.width - 128,
						y: env.height - 24
					}
				});

			}

		},

		enter: function(data) {

			lychee.game.State.prototype.enter.call(this);


			this.__track = new game.entity.Track(data);
			if (this.__track.length === 0) {
				this.leave();
				return;
			}


			var wait   = 3; // in seconds
			var camera = this.camera;
			if (camera !== null) {


				var env = this.renderer.getEnvironment();

				camera.position.y = camera.offset + wait * 10 * env.height;


				var start = null;
				var position = camera.position;

				var handle = this.loop.interval(1000 / 60, function(clock, delta, step) {

					if (start === null) start = clock;


					var t      = (clock - start) / (wait * 1000);
					var offset = camera.offset;
					var y      = offset + (1 - (Math.pow(t - 1, 3) + 1)) * wait * 10 * env.height;

					if (y < offset) {

						position.y       = offset;
						this.__autopilot = true;
						this.__offset    = offset;

						handle.clear();


					} else {
						position.y = y;
					}

				}, this);

			}

		},

		leave: function() {

			this.__autopilot = false;
			this.__track     = null;


			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			if (this.__autopilot === true) {

				var camera = this.camera;
				if (camera !== null) {

					var track    = this.__track;
					var length   = track.length;
					var position = camera.position;
					if (position.z + 200 > length * 200) {
						position.z = 0;
					} else {
						position.z += 200;
					}

					var segment = track.getSegment(position.z);

					position.y = segment.from.y + this.__offset;

				}

			}

		},

		render: function(clock, delta) {

			var renderer = this.renderer;
			if (renderer !== null) {

				renderer.clear();

				renderer.renderEntity(this.__track, 0, 0);
				renderer.renderEntity(this.__logo,  0, 0);

				renderer.flush();

			}

		}

	};


	return Class;

});
