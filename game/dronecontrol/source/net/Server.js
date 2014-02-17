
lychee.define('game.net.Server').requires([
	'lychee.data.BitON',
	'game.net.remote.Control'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, game, global, attachments) {

	var _BitON   = lychee.data.BitON;
	var _control = game.net.remote.Control;


	var Class = function() {

		lychee.net.Server.call(this, {
			encoder: _BitON.encode,
			decoder: _BitON.decode
		});


		this.bind('connect', function(remote) {

			console.log('(Dronecontrol) game.net.Server: New Remote (' + remote.id + ')');

			remote.register('control', _control);
			remote.accept();

		}, this);

	};


	Class.prototype = {

		listen: function(port, host) {

			console.log('(Dronecontrol) game.net.Server: Listening on ' + host + ':' + port);

			lychee.net.Server.prototype.listen.call(this, port, host);

		}

	};


	return Class;

});

