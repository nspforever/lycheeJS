
lychee.define('game.Server').requires([
	'game.net.remote.Project',
	'sorbet.data.Filesystem'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, game, global, attachments) {

	var _filesystem = sorbet.data.Filesystem;
	var _project    = game.net.remote.Project;


	var Class = function(root) {

		root = typeof root === 'string' ? root : '/var/www';


		this.fs   = new _filesystem(root);
		this.root = root;


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

