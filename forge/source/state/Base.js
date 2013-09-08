
lychee.define('game.state.Base').requires([
	'lychee.game.State',
	'game.entity.ui.Sidebar'
]).exports(function(lychee, game, global) {

	var _sidebar = game.entity.ui.Sidebar;


	var Module = {};

	Module.reset = function() {

		var tile = 24;


		lychee.game.State.prototype.reset.call(this);


		var renderer = this.renderer;
		if (renderer !== null) {

			var env    = renderer.getEnvironment();
			var width  = env.width;
			var height = env.height;


			this.removeLayer('ui');


			var layer = new lychee.game.Layer();


			var swidth  = 10 * tile;
			var sheight = height;

			var entitiesbar = new _sidebar({
				width:  swidth,
				height: sheight,
				margin: tile / 2,
				position: {
					x: -1/2 * width + swidth / 2,
					y: 0
				},
				scrollable: true
			});

			layer.setEntity('entities', entitiesbar);

			var settingsbar = new _sidebar({
				width:  swidth,
				height: sheight,
				margin: tile / 2,
				position: {
					x: 1/2 * width - swidth / 2,
					y: 0
				},
				scrollable: true
			});

			layer.setEntity('settings', settingsbar);


			this.setLayer('ui', layer);

		}

	};


	return Module;

});

