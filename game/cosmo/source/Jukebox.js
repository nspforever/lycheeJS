
lychee.define('game.Jukebox').includes([
	'lychee.Jukebox'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(game) {

		lychee.Jukebox.call(this, 20);


		var bases = [
			'./asset/sound/ship-lazer',
			'./asset/sound/ship-shield',
			'./asset/sound/ship-transformation',
			'./asset/sound/ship-warp',

			'./asset/sound/explosion',
			'./asset/sound/powerup',

			'./asset/music/boss',
			'./asset/music/credits',
			'./asset/music/game',
			'./asset/music/menu',
		];

		var ids = [
			'ship-lazer',
			'ship-shield',
			'ship-transformation',
			'ship-warp',

			'explosion',
			'powerup',

			'music-boss',
			'music-credits',
			'music-game',
			'music-menu'
		];


		for (var i = 0, il = ids.length; i < il; i++) {

			var track = new lychee.Track(ids[i], {
				base:    bases[i],
				formats: [ 'ogg', 'mp3' ]
			});

			this.add(track);

		}

	};


	return Class;

});

