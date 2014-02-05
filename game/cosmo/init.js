
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


var settings = {
	music: true,
	sound: true
};


if (document.location.hash.match(/debug/)) {
	lychee.debug   = true;
	settings.music = false;
	settings.sound = false;
}


lychee.build(function(lychee, global) {

	new game.Main(settings);

}, typeof global !== 'undefined' ? global : this);

