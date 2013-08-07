
lychee.define('game.Client').includes([
	'lychee.net.Client'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(settings, game) {

		this.game = game;


		lychee.net.Client.call(this, JSON.stringify, JSON.parse);


		this.bind('connect', function() {

			console.log('connected!');

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

