
lychee.define('game.state.Game').requires([
	'game.entity.lycheeJS',
	'lychee.ui.Layer',
	'lychee.ui.Button',
	'lychee.ui.Joystick',
	'lychee.ui.Label',
	'lychee.ui.Select',
	'game.net.client.Control'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _blob = attachments["json"];
	var _font = attachments["fnt"];



	/*
	 * HELPERS
	 */

	var _COMMAND = game.net.client.Control.COMMAND;

	var _process_command = function(entity) {

		var label = entity.label || null;
		if (label !== null) {

			var command = _COMMAND[label.toLowerCase()];
			if (typeof command === 'number') {

				var service = this.game.client.services.control;
				if (service !== null) {
					service.setCommand(command);
				}

			}

		}

	};


	var _FLIP = game.net.client.Control.FLIP;

	var _process_flip = function(entity) {

		var label = entity.label || null;
		if (label !== null) {

			var flip = _FLIP[label.toLowerCase()];
			if (typeof flip === 'number') {

				var service = this.game.client.services.control;
				if (service !== null) {
					service.setFlip(flip);
				}

			}

		}

	};


	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.deserialize(_blob);
		this.reshape();

	};


	Class.prototype = {

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);


			var entity = null;


			entity = this.queryLayer('ui', 'sidebar-left > joystick');
			entity.bind('change', function(value) {

				value.x  = value.x * 10;
				value.x |= 0;
				value.x /= 10;

				value.y  = value.y * 10;
				value.y |= 0;
				value.y /= 10;


				var service = this.game.client.services.control;
				if (service !== null) {

					service.setState({
						roll:   value.x,
						pitch: -value.y
					});

				}

			}, this);

			entity = this.queryLayer('ui', 'sidebar-left > commands > takeoff');
			entity.bind('#touch', _process_command, this);
			entity = this.queryLayer('ui', 'sidebar-left > commands > land');
			entity.bind('#touch', _process_command, this);
			entity = this.queryLayer('ui', 'sidebar-left > commands > stop');
			entity.bind('#touch', _process_command, this);


			entity = this.queryLayer('ui', 'sidebar-right > joystick');
			entity.bind('change', function(value) {

				value.x  = value.x * 10;
				value.x |= 0;
				value.x /= 10;

				value.y  = value.y * 10;
				value.y |= 0;
				value.y /= 10;


				var service = this.game.client.services.control;
				if (service !== null) {

					service.setState({
						yaw:    value.x,
						heave: -value.y
					});

				}

			}, this);

			entity = this.queryLayer('ui', 'sidebar-right > commands > flip-ahead');
			entity.bind('#touch', _process_flip, this);
			entity = this.queryLayer('ui', 'sidebar-right > commands > flip-right');
			entity.bind('#touch', _process_flip, this);
			entity = this.queryLayer('ui', 'sidebar-right > commands > flip-behind');
			entity.bind('#touch', _process_flip, this);
			entity = this.queryLayer('ui', 'sidebar-right > commands > flip-left');
			entity.bind('#touch', _process_flip, this);


			entity = this.queryLayer('ui', 'settings > ip');
			entity.bind('change', function(value) {

console.log('CHANGED IP', value)

			}, this);

		},

		reshape: function(orientation, rotation) {

			var renderer = this.renderer;
			if (renderer !== null) {

				var entity = null;
				var width  = renderer.width;
				var height = renderer.height;


				entity = this.queryLayer('background', 'lycheeJS');
				entity.position.y = 1/2 * height - 32;


				entity = this.queryLayer('ui', 'sidebar-left');
				entity.width      = (((1/4 * width) / 32) | 0) * 32;
				entity.height     = height;
				entity.position.x = -1/2 * width + entity.width / 2;

				entity = this.queryLayer('ui', 'sidebar-left > joystick');
				entity.position.y = 1/2 * height - 96;

				entity = this.queryLayer('ui', 'sidebar-left > commands');
				entity.position.y = -1/2 * height + entity.height / 2 + 32;


				entity = this.queryLayer('ui', 'sidebar-right');
				entity.width      = (((1/4 * width) / 32) | 0) * 32;
				entity.height     = height;
				entity.position.x = 1/2 * width - entity.width / 2;

				entity = this.queryLayer('ui', 'sidebar-right > joystick');
				entity.position.y = 1/2 * height - 96;

				entity = this.queryLayer('ui', 'sidebar-right > commands');
				entity.position.y = -1/2 * height + entity.height / 2 + 32;


				entity = this.queryLayer('ui', 'settings');
				entity.position.y = -1/2 * height + entity.height / 2;

			}



			lychee.game.State.prototype.reshape.call(this, orientation, rotation);
console.log(this.__layers.ui.width, this.__layers.ui.height);

		}

	};


	return Class;

});

