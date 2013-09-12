
lychee.define('game.ar.data.VIDEO').tags({
	platform: 'nodejs'
}).supports(function(lychee, global) {

	if (typeof Buffer !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, game, global, attachments) {

	var _buffer = game.ar.data.Buffer;


	var Module = {};

	Module.encode = function() {};

	Module.decode = function(data) {

		var buffer = new _buffer(data);


console.log('DECODING VIDEO', data);


		var videodata = null;


		return videodata;

	};


	return Module;

});

