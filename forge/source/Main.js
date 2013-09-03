
lychee.define('game.Main').requires([
	'game.entity.Font',
	'game.state.Font',
	'game.state.Test',
	'game.Builder',
	'game.DeviceSpecificHacks',
	'game.Project'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

			fullscreen: true,

			input: {
				fireKey:   true,
				fireTouch: true,
				fireSwipe: true
			},

			renderer: {
				id: 'forge'
			},

			project: {
				path: '/game/boilerplate'
			}

		}, data);


		lychee.game.Main.call(this, settings);

		this.init();

	};


	Class.prototype = {

		reset: function(state) {

			game.DeviceSpecificHacks.call(this);

			this.reshape();


			if (state === true) {
				this.resetState(null, null);
			}

		},

		init: function(project) {

			// Remove Preloader Progress Bar
			lychee.Preloader.prototype._progress(null, null);


			lychee.game.Main.prototype.init.call(this);
			this.reset(false);


			this.fonts = {};
			this.fonts.headline = new game.entity.Font('headline');
			this.fonts.normal   = new game.entity.Font('normal');
			this.fonts.small    = new game.entity.Font('small');

			this.builder = new game.Builder(this);
			this.project = new game.Project(this, this.settings.project);

			this.setState('font', new game.state.Font(this));
			this.setState('test', new game.state.Test(this));

			// this.setState('scene', new game.state.Scene(this));


			if (typeof this.settings.state === 'string') {

				if (this.getState(this.settings.state) !== null) {
					this.changeState(this.settings.state);
				}

			}


			if (this.getState() === null) {
				this.changeState('test');
//				this.changeState('scene', '/game/boilerplate');
			}


			this.start();

		}

	};


	return Class;

});
