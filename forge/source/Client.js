
lychee.define('game.Client').requires([
	'game.net.client.Project'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, game, global, attachments) {

	var _project = game.net.client.Project;



	/*
	 * HELPERS
	 */

	var _init_project = function(service) {

		this.game.services.project = service;


		var entity = this.game.project || null;
		if (entity !== null) {
			entity.init(service);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings, game) {

		this.game = game;


		lychee.net.Client.call(this, JSON.stringify, JSON.parse);


		this.bind('connect', function() {

			var project = new _project(this);

			project.bind('#init', _init_project, this, true);

			this.plug(project);

		}, this);

		this.bind('disconnect', function(code, reason) {

			this.game.client           = null;
			this.game.services.project = null;

		}, this);


		this.listen(settings.port, settings.host);

	};


	Class.prototype = {

	};


	return Class;

});

