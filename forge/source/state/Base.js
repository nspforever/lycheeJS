
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
	'game.entity.ui.Toolbar',
	'game.entity.ui.Widget'
]).exports(function(lychee, game, global) {

	var _scene   = game.entity.ui.Scene;
	var _sidebar = game.entity.ui.Sidebar;
	var _toolbar = game.entity.ui.Toolbar;
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


			this.removeLayer('layer-1');
			this.removeLayer('layer-2');
			this.removeLayer('layer-3');


			var layer1  = new lychee.game.Layer();
			var layer2  = new lychee.game.Layer();
			var layer3  = new lychee.game.Layer();
			var swidth  = 10 * tile;


			var menu    = this.game.menu;
			var project = this.game.project;

			var scene = new _scene({
				width:  width  - 2 * swidth,
				height: height - project.height,
				position: {
					x: 0,
					y: project.height / 2
				}
			});

			var toolbar = new _toolbar(this.game, {
				width:  scene.width,
				height: tile * 3,
				position: {
					x: 0,
					y: 1/2 * scene.height - tile * 3/2 + project.height / 2
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

			menu.setPosition({
				x:  1/2 * width  - menu.width  / 2,
				y: -1/2 * height + menu.height / 2
			});

			project.setPosition({
				x: -1/2 * width  + project.width  / 2,
				y: -1/2 * height + project.height / 2
			});


			layer1.setEntity('scene',    scene);
			layer1.setEntity('toolbar',  toolbar);

			layer2.setEntity('entities', entities);
			layer2.setEntity('settings', settings);

			layer3.setEntity('project',  project);
			layer3.setEntity('menu',     menu);


			this.setLayer('game', layer1);
			this.setLayer('ui',   layer2);
			this.setLayer('xxx',  layer3);

		}

	};


	Module.getEntity = function(id) {

		for (var layerId in this.__layers) {

			var entity = this.__layers[layerId].getEntity(id);
			if (entity !== null) {
				return entity;
			}

		}


		return null;

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

