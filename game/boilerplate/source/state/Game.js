
lychee.define('game.state.Game').requires([
	'lychee.ui.Button',
	'game.entity.Button',
	'game.entity.Circle'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _blob  = attachments["json"];
	var _fonts = {
		headline: attachments["headline.fnt"],
		normal:   attachments["normal.fnt"]
	};


	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.deserialize(_blob);
		this.reshape();

	};


	Class.prototype = {

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);

		},

		reshape: function(orientation, rotation) {

			lychee.game.State.prototype.reshape.call(this, orientation, rotation);


			var renderer = this.renderer;
			if (renderer !== null) {

				var entity = null;
				var width  = renderer.width;
				var height = renderer.height;


				entity = this.queryLayer('ui', 'button');
				entity.position.y = 1/2 * height - 42;

			}

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);


			var circle = this.queryLayer('ui', 'circle');
			if (circle !== null) {
				circle.setColor('#888888', true);
			}

		},

		leave: function() {

			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});
