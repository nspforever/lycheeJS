
lychee.define('game.entity.ui.Project').requires([
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

		var filtered = [];
		var options  = [];

		var projects = data.projects || null;
		if (projects !== null) {

			for (var p = 0, pl = projects.length; p < pl; p++) {

				var project = projects[p];

				filtered.push(project);
				options.push(project.title);

			}

		}


		this.__projects = filtered;
		this.__options  = options;


		var entity = this.getEntity('select');
		if (entity !== null) {

			entity.setOptions(this.__options);


			var value = entity.value;
			if (this.__options.indexOf(value) === -1) {
				entity.setValue(this.__options[0]);
			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(game, settings) {

		if (settings === undefined) {
			settings = {};
		}


		this.game = game;

		this.__options  = [];
		this.__projects = [];


		var renderer = this.game.renderer || null;
		if (renderer !== null) {

			var env = renderer.getEnvironment();

			settings.width  = env.width;
			settings.height = 64;

		}


		lychee.ui.Layer.call(this, settings);

		settings = null;


		this.reset();

		_process_update.call(this, _default_projects);

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
					x: -1/2 * width + 96,
					y:  0
				}
			});

			this.addEntity(entity);


			entity = new lychee.ui.Select({
				font:    this.game.fonts.normal,
				options: [ 'no project found' ],
				value:   'no project found',
				width:   256,
				position: {
					x: -1/2 * width + 96 + 256,
					y: 0
				}
			});

			entity.bind('change', function(value) {

				var project = this.__projects[value] || null;
				if (project !== null) {
					this.trigger('change', [ project ]);
				}

			}, this);

			this.setEntity('select', entity);

		},



		/*
		 * SERVICE INTEGRATION API
		 */

		init: function(service) {

console.log('BINDING TO SERVICE', service);

console.log('UPDATING PROJECT INDEX', data);

		}

	};


	return Class;

});

