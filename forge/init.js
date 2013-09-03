
// Set to true to see lychee debug messages
lychee.debug = true;


// Rebase required namespaces for inclusion
lychee.rebase({
	lychee: "../lychee/source",
	game:   "./source"
});


lychee.tag({
	platform: [ 'webgl', 'html' ]
});


lychee.build(function(lychee, global) {

	var settings = {
		base: './asset'
	};


	if (global.location && global.location.hash) {

		var hash = global.location.hash;
		var parameters = hash.substr(1, hash.length - 1).split(',');

		for (var p = 0, pl = parameters.length; p < pl; p++) {

			var parameter = parameters[p].split('=');
			if (
				   parameter[0]
				&& parameter[0].length > 0
				&& parameter[1]
				&& parameter[1].length > 0
			) {

				var key   = parameter[0];
				var value = parameter[1];

				if (value === 'true')                     value = true;
				if (value === 'false')                    value = false;
				if (isNaN(parseInt(value, 10)) === false) value = parseInt(value, 10);

				settings[key] = value;

			}

		}


		console.log(settings);

	}


	new game.Main(settings);

}, typeof global !== 'undefined' ? global : this);

