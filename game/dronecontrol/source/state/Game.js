
lychee.define('game.state.Game').requires([
	'game.entity.ui.Menu',
	'game.entity.ui.Video',
	'game.entity.ui.SidebarLeft',
	'game.entity.ui.SidebarRight'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _menu     = game.entity.ui.Menu;
	var _video    = game.entity.ui.Video;
	var _sidebar1 = game.entity.ui.SidebarLeft;
	var _sidebar2 = game.entity.ui.SidebarRight;


	var Class = function(game) {

		lychee.game.State.call(this, game);

		this.client = game.client || null;

		this.__menu     = new _menu(this);
		this.__video    = new _video(this);
		this.__sidebar1 = new _sidebar1(this);
		this.__sidebar2 = new _sidebar2(this);


		this.reset();

	};


	Class.prototype = {

		reset: function() {

			lychee.game.State.prototype.reset.call(this);


			this.removeLayer('ui');


			var layer = new lychee.game.Layer();

			layer.addEntity(this.__menu);
			layer.addEntity(this.__video);
			layer.addEntity(this.__sidebar1);
			layer.addEntity(this.__sidebar2);


			var renderer = this.renderer;
			if (renderer !== null) {

				var env    = renderer.getEnvironment();
				var width  = env.width;
				var height = env.height;


				this.__sidebar1.height = height;
				this.__sidebar1.reset();
				this.__sidebar1.setPosition({
					x: -1/2 * width + 64 + 32,
					y:  0
				});

				this.__sidebar2.height = height;
				this.__sidebar2.reset();
				this.__sidebar2.setPosition({
					x:  1/2 * width - 64 - 32,
					y:  0
				});

				this.__menu.reset();
				this.__menu.setPosition({
					x:  0,
					y: -1/2 * height + 32
				});

				this.__video.reset();
				this.__video.setPosition({
					x: 0,
					y: 0
				});

			}


			this.setLayer('ui', layer);

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});
