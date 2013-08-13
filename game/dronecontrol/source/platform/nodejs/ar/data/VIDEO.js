
lychee.define('game.ar.data.VIDEO').tags({
	platform: [ 'nodejs' ]
}).supports(function(lychee, global) {

	if (typeof Buffer !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, game, global, attachments) {

	var stream = require('stream').Stream;


	var Module = {};

	Module.encode = function() {};

	Module.decode = function(data) {

		var videodata = null;


		return videodata;

	};


	return Module;

});

