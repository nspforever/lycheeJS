
lychee.define('game.Controller').requires([
	'game.net.proxy.Project',
	'game.net.proxy.Entity'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var _proxy = game.net.proxy;


	var Class = function(game) {

		this.game = game;

		this.__map = {};


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		get: function(id) {

			var entry = this.__map[id] || null;
			if (entry !== null) {
				return entry.proxy;
			}


			return null;

		},

		set: function(id, service) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				var name  = id.charAt(0).toUpperCase() + id.substr(1);
				var proxy = _proxy[name] || null;

				this.__map[id] = {
					proxy:   proxy,
					service: service
				};


				if (proxy !== null) {
					proxy.bind('sync', service.sync, service);
				}


				return true;

			}


			return false;

		}

	};


	return Class;

});

