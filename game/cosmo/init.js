
// Set to true to see lychee debug messages
// lychee.debug = true;


// Rebase required namespaces for inclusion
lychee.rebase({
	lychee: "../../lychee",
	game: "./source"
});


// Tags are required to determine which libraries to load
(function(lychee, global) {

	var platform = [ 'webgl', 'html', 'nodejs' ];

	if (global.navigator && global.navigator.appName === 'V8GL') {
		platform = [ 'v8gl' ];
	}

	lychee.tag({
		platform: platform
	});

})(lychee, typeof global !== 'undefined' ? global : this);


lychee.build(function(lychee, global) {

	var settings = {
	};


	if (global.location && global.location.hash.match(/debug/)) {

		lychee.debug = true;

		var parameters = global.location.hash.split(',');

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

