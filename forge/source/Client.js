
lychee.define('game.Client').requires([
	'game.net.client.Project',
	'game.net.client.Entity'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, game, global, attachments) {

	var _project = game.net.client.Project;
	var _entity  = game.net.client.Entity;



	/*
	 * HELPERS
	 */

	var _init_service = function(service) {

		var controller = this.game.controller || null;
		if (controller !== null) {

			controller.set(
				service.id,
				service
			);

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
			var entity  = new _entity(this);

			project.bind('#init', _init_service, this, true);
			entity.bind( '#init', _init_service, this, true);

			this.plug(project);
			this.plug(entity);

		}, this);

		this.bind('disconnect', function(code, reason) {

			this.game.client = null;

		}, this);


		this.listen(settings.port, settings.host);

	};


	Class.prototype = {

	};


	return Class;

});

