
lychee.define('game.Server').requires([
	'game.net.remote.Project'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, game, global, attachments) {

	var _project = game.net.remote.Project;


	var Class = function(config) {

		this.config = lychee.extend({
			root: null
		}, config);


		lychee.net.Server.call(this, JSON.stringify, JSON.parse);


		this.bind('connect', function(remote) {

			console.log('(Forge) game.Server: New Remote (' + remote.id + ')');

			remote.register('project', _project);
			remote.accept();

		}, this);

	};


	Class.prototype = {

		listen: function(port, host) {

			console.log('(Forge) game.Server: Listening on ' + host + ':' + port);

			lychee.net.Server.prototype.listen.call(this, port, host);

		}

	};


	return Class;

});

