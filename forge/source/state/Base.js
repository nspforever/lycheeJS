
lychee.define('game.state.Base').requires([
	'lychee.ui.Button',
	'lychee.ui.Input',
	'lychee.ui.Select',
	'lychee.ui.Slider',
	'lychee.ui.Textarea',
	'lychee.game.State',
	'game.entity.ui.Sidebar',
	'game.entity.ui.Widget'
]).exports(function(lychee, game, global) {

	var _sidebar = game.entity.ui.Sidebar;
	var _widget  = game.entity.ui.Widget;


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


			var layer   = new lychee.game.Layer();
			var swidth  = 10 * tile;
			var sheight = height;


			var entities = new _sidebar({
				width:  swidth,
				height: sheight,
				margin: tile / 2,
				position: {
					x: -1/2 * width + swidth / 2,
					y:  0
				},
				scrollable: true
			});

			layer.setEntity('entities', entities);


			var settings = new _sidebar({
				width:  swidth,
				height: sheight,
				margin: tile / 2,
				position: {
					x: 1/2 * width - swidth / 2,
					y: 0
				},
				scrollable: true
			});

			layer.setEntity('settings', settings);


			this.setLayer('ui', layer);

		}

	};


	Module.createWidget = function(target, property, label, entity) {

		var sidebar = this.getLayer('ui').getEntity(target);
		var widget  = new _widget({
			width:  sidebar.width - sidebar.margin * 4,
			margin: sidebar.margin,
			reflow: {
				x: false,
				y: true
			}
		});


		if (label !== null) {

			label.width = widget.width - widget.margin * 2;
			widget.addEntity(label);

		}

		if (entity !== null) {

			entity.width = widget.width - widget.margin * 2;
			widget.addEntity(entity);

			entity.bind('touch', function() {
				this.relayout(true);
			}, widget);

		}


		sidebar.addEntity(widget);

	};


	return Module;

});

