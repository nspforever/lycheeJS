
// Set to true to see lychee debug messages
// lychee.debug = true;


lychee.rebase({
	lychee: "../../lychee/source",
	game:   "./source"
});


lychee.tag({
	platform: [ 'nodejs-webgl', 'webgl', 'html' ]
});


lychee.build(function(lychee, global) {

	new game.Main();

}, typeof global !== 'undefined' ? global : this);

