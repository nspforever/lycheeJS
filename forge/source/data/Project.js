
lychee.define('game.data.Project').exports(function(lychee, game, global) {

	var Class = function(game, settings) {

		this.settings = settings;

		this.__preloader = new lychee.Preloader({
			timeout: 5000
		});

		this.__preloader.bind('ready', this.__load,   this);
		this.__preloader.bind('error', this.__unload, this);


		this.reset();

	};


	Class.prototype = {

		reset: function() {

			var settings = this.settings;


console.error('TODO; HERE;');
console.log(this.__preloader, settings);



		}

	};


	return Class;

});

