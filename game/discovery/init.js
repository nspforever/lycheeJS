
// Set to true to see lychee debug messages
lychee.debug = true;


// Rebase required namespaces for inclusion
lychee.rebase({
	lychee: "../../lychee/source",
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

	new game.Main({});

}, typeof global !== 'undefined' ? global : this);

