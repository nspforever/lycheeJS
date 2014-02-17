
lychee.define('game.net.Client').requires([
	'lychee.data.BitON',
	'game.net.client.Control'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, game, global, attachments) {

	var _BitON   = lychee.data.BitON;
	var _control = game.net.client.Control;


	var Class = function(settings, game) {

		// required by services due to renderer
		this.game = game;

		this.services = {};
		this.services.control = new _control(this);


		lychee.net.Client.call(this, {
			encoder: settings.encoder || _BitON.encode,
			decoder: settings.decoder || _BitON.decode
		});


		this.bind('connect', function() {

			this.plug(this.services.control);

		}, this);

		this.bind('disconnect', function(code, reason) {

			console.log('Client disconnected!', code, reason);

		}, this);


		this.listen(settings.port, settings.host);

	};


	Class.prototype = {

	};


	return Class;

});

