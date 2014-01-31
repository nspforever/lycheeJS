
// Set to true to see lychee debug messages
// lychee.debug = true;


lychee.rebase({
	lychee: "../../lychee/source",
	game:   "./source"
});


lychee.tag({
	// TODO: Change tags to platform: [ 'webgl', 'html' ]
	platform: [ 'html' ]
});


lychee.build(function(lychee, global) {

	var settings = {
//		music: false,
//		sound: false
	};


	new game.Main(settings);

}, typeof global !== 'undefined' ? global : this);

