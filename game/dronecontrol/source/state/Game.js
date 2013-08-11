
lychee.define('game.state.Game').requires([
	'lychee.ui.Button',
	'lychee.ui.Slider'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(game) {

		lychee.game.State.call(this, game);

		this.client  = game.client || null;

		this.__droneId  = 'Jordan';
		this.__entities = {};

		this.reset();

	};


	Class.prototype = {

		reset: function() {

			lychee.game.State.prototype.reset.call(this);


			var renderer = this.renderer;
			if (renderer !== null) {

				var entity = null;
				var width  = renderer.getEnvironment().width;
				var height = renderer.getEnvironment().height;


				this.removeLayer('ui');


				var layer = new lychee.game.Layer();



				/*
				 * STEERING CONTROLS
				 */

				layer.addEntity(new lychee.ui.Button({
					label: 'Roll',
					font:  this.game.fonts.normal,
					position: {
						x: -1/2 * width + 48,
						y: -176
					}
				}));

				entity = new lychee.ui.Slider({
					height: 256,
					type: lychee.ui.Slider.TYPE.vertical,
					range: {
						from:      -1.0,
						to:         1.0,
						delta:      0.1
					},
					value: 0,
					position: {
						x: -1/2 * width + 48,
						y: 0
					}
				});

				entity.bind('change', function(value) {

					value = value * 10;
					value |= 0;
					value = value / 10;

					this.client.send({
						droneId: this.__droneId,
						method: 'roll',
						value: value
					});

				}, this);

				layer.addEntity(entity);
				this.__entities.roll = entity;


				layer.addEntity(new lychee.ui.Button({
					label: 'Pitch',
					font:  this.game.fonts.normal,
					position: {
						x: -1/2 * width + 48 * 3,
						y: -176
					}
				}));

				entity = new lychee.ui.Slider({
					height: 256,
					type: lychee.ui.Slider.TYPE.vertical,
					range: {
						from:      -1.0,
						to:         1.0,
						delta:      0.1
					},
					value: 0,
					position: {
						x: -1/2 * width + 48 * 3,
						y: 0
					}
				});

				entity.bind('change', function(value) {

					value = value * 10;
					value |= 0;
					value = value / 10;

					this.client.send({
						droneId: this.__droneId,
						method: 'pitch',
						value: value
					});

				}, this);

				layer.addEntity(entity);
				this.__entities.pitch = entity;


				layer.addEntity(new lychee.ui.Button({
					label: 'Yaw',
					font:  this.game.fonts.normal,
					position: {
						x: -1/2 * width + 48 * 5,
						y: -176
					}
				}));

				entity = new lychee.ui.Slider({
					height: 256,
					type: lychee.ui.Slider.TYPE.vertical,
					range: {
						from:      -1.0,
						to:         1.0,
						delta:      0.1
					},
					value: 0,
					position: {
						x: -1/2 * width + 48 * 5,
						y: 0
					}
				});

				entity.bind('change', function(value) {

					value = value * 10;
					value |= 0;
					value = value / 10;

					this.client.send({
						droneId: this.__droneId,
						method: 'yaw',
						value: value
					});

				}, this);

				layer.addEntity(entity);
				this.__entities.yaw = entity;


				layer.addEntity(new lychee.ui.Button({
					label: 'Heave',
					font:  this.game.fonts.normal,
					position: {
						x: -1/2 * width + 48 * 7,
						y: -176
					}
				}));

				entity = new lychee.ui.Slider({
					height: 256,
					type: lychee.ui.Slider.TYPE.vertical,
					range: {
						from:      -1.0,
						to:         1.0,
						delta:      0.1
					},
					value: 0,
					position: {
						x: -1/2 * width + 48 * 7,
						y: 0
					}
				});

				entity.bind('change', function(value) {

					value = value * 10;
					value |= 0;
					value = value / 10;

					this.client.send({
						droneId: this.__droneId,
						method: 'heave',
						value: value
					});

				}, this);

				layer.addEntity(entity);
				this.__entities.heave = entity;



				/*
				 * EMERGENCY CONTROLS
				 */

				entity = new lychee.ui.Button({
					label: 'Takeoff',
					font:  this.game.fonts.normal,
					position: {
						x: 0,
						y: -128
					}
				});

				entity.bind('touch', function() {

					this.client.send({
						droneId: this.__droneId,
						method: 'takeoff',
						value: null,
					});

				}, this);

				layer.addEntity(entity);


				entity = new lychee.ui.Button({
					label: '~ wave ~',
					font:  this.game.fonts.normal,
					position: {
						x: 0,
						y: -64
					}
				});

				entity.bind('touch', function() {

					this.client.send({
						droneId: this.__droneId,
						method: 'animateFlight',
						type:   'wave',
						value:  5000
					});

				}, this);

				layer.addEntity(entity);


				entity = new lychee.ui.Button({
					label: 'Stop',
					font:  this.game.fonts.normal,
					position: {
						x: 0,
						y: 0
					}
				});

				entity.bind('touch', function() {

					var entities = this.__entities;

					entities.roll.setValue(0);
					entities.pitch.setValue(0);
					entities.yaw.setValue(0);
					entities.heave.setValue(0);


					this.client.send({
						droneId: this.__droneId,
						method: 'stop',
						value: null,
					});

				}, this);

				layer.addEntity(entity);


				entity = new lychee.ui.Button({
					label: 'Land',
					font:  this.game.fonts.normal,
					position: {
						x: 0,
						y: 64
					}
				});

				entity.bind('touch', function() {

					this.client.send({
						droneId: this.__droneId,
						method: 'land',
						value: null,
					});

				}, this);

				layer.addEntity(entity);



				/*
				 * ANIMATIONS
				 */

				entity = new lychee.ui.Button({
					label: 'flip-ahead',
					font:  this.game.fonts.normal,
					position: {
						x: 1/2 * width - 128 - 48,
						y: -1/2 * height + 48
					}
				});

				entity.bind('touch', function() {

					this.client.send({
						droneId: this.__droneId,
						method: 'animateFlight',
						type:   'flip-ahead',
						value:  700
					});

				}, this);

				layer.addEntity(entity);


				entity = new lychee.ui.Button({
					label: 'flip-behind',
					font:  this.game.fonts.normal,
					position: {
						x: 1/2 * width - 128 - 48,
						y: -1/2 * height + 48 * 2
					}
				});

				entity.bind('touch', function() {

					this.client.send({
						droneId: this.__droneId,
						method: 'animateFlight',
						type:   'flip-behind',
						value:  700
					});

				}, this);

				layer.addEntity(entity);


				entity = new lychee.ui.Button({
					label: 'flip-left',
					font:  this.game.fonts.normal,
					position: {
						x: 1/2 * width - 128 - 48,
						y: -1/2 * height + 48 * 3
					}
				});

				entity.bind('touch', function() {

					this.client.send({
						droneId: this.__droneId,
						method: 'animateFlight',
						type:   'flip-left',
						value:  700
					});

				}, this);

				layer.addEntity(entity);


				entity = new lychee.ui.Button({
					label: 'flip-right',
					font:  this.game.fonts.normal,
					position: {
						x: 1/2 * width - 128 - 48,
						y: -1/2 * height + 48 * 4
					}
				});

				entity.bind('touch', function() {

					this.client.send({
						droneId: this.__droneId,
						method: 'animateFlight',
						type:   'flip-right',
						value:  700
					});

				}, this);

				layer.addEntity(entity);


				this.setLayer('ui', layer);

			}

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
