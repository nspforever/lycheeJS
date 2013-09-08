
// Set to true to see lychee debug messages
// lychee.debug = true;


lychee.rebase({
	lychee: "../../lychee/source",
	game:   "./source"
});


lychee.tag({
	platform: [ 'webgl', 'html' ]
});


lychee.build(function(lychee, global) {

	var settings = {
		instances:  1,
		fullscreen: true
	};


	new game.Main(settings);

}, typeof global !== 'undefined' ? global : this);

