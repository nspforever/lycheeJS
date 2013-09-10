
lychee.define('game.state.Base').requires([
	'lychee.ui.Button',
	'lychee.ui.Input',
	'lychee.ui.Select',
	'lychee.ui.Slider',
	'lychee.ui.Sprite',
	'lychee.ui.Textarea',
	'lychee.game.State',
	'game.entity.ui.Scene',
	'game.entity.ui.Sidebar',
	'game.entity.ui.Widget'
]).exports(function(lychee, game, global) {

	var _scene   = game.entity.ui.Scene;
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


			var project = this.game.project;

			var scene = new _scene({
				width:  width  - 2 * swidth     - tile,
				height: height - project.height - tile,
				position: {
					x: 0,
					y: project.height / 2
				}
			});

			var entities = new _sidebar({
				width:  swidth,
				height: height - project.height,
				margin: tile / 2,
				position: {
					x: -1/2 * width + swidth / 2,
					y:  project.height / 2
				},
				scrollable: true
			});

			var settings = new _sidebar({
				width:  swidth,
				height: height - project.height,
				margin: tile / 2,
				position: {
					x: 1/2 * width - swidth / 2,
					y: project.height / 2
				},
				scrollable: true
			});


			project.setPosition({
				y: -1/2 * height + project.height / 2
			});


			layer.setEntity('scene',    scene);
			layer.setEntity('entities', entities);
			layer.setEntity('settings', settings);
			layer.setEntity('project',  project);

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

