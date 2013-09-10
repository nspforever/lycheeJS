
lychee.define('game.entity.Project').requires([
	'lychee.ui.Button',
	'lychee.ui.Input'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, game, global, attachments) {

	var _default_projects = attachments['json'];



	/*
	 * HELPERS
	 */

	var _process_update = function(data) {
	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game, settings) {

		if (settings === undefined) {
			settings = {};
		}


		this.game = game;

		this.__projects = _default_projects;


		var renderer = this.game.renderer || null;
		if (renderer !== null) {

			var env = renderer.getEnvironment();

			settings.width  = env.width;
			settings.height = 64;

		}


		lychee.ui.Layer.call(this, settings);

		settings = null;


		this.reset();

	};


	Class.prototype = {

		/*
		 * LAYER API
		 */

		reset: function() {

			lychee.ui.Layer.prototype.reset.call(this);


			var entity = null;
			var width  = this.width;
			var height = this.height;


			entity = new lychee.ui.Button({
				label: 'Project:',
				font:  this.game.fonts.normal,
				position: {
					x: -1/2 * width + 64,
					y:  0
				}
			});

			this.addEntity(entity);


			entity = new lychee.ui.Select({
				font:    this.game.fonts.normal,
				options: [ '/game/boilerplate' ],
				value:   '/game/boilerplate'
			});

			entity.bind('change', function(value) {

				var project = this.__projects[value] || null;
				if (project !== null) {
					this.trigger('change', [ project ]);
				}

			}, this);

			this.addEntity(entity);

		},



		/*
		 * SERVICE INTEGRATION API
		 */

		processUpdate: function(data) {

console.log('UPDATING PROJECT INDEX', data);

		}

	};


	return Class;

});

