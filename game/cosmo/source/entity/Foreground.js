
lychee.define('game.entity.Foreground').exports(function(lychee, game, global, attachments) {

	var Class = function(settings) {

		if (settings === undefined) {
			settings = {};
		}


		this.__buffer = settings.buffer || null;
		this.__width  = settings.width  || 0;
		this.__height = settings.height || 0;

		this.__gradients = {
			small: [
				[ 0.0, 'rgba(0,0,0,1.0)' ],
				[ 1.0, 'rgba(0,0,0,0.0)' ]
			],
			big: [
				[ 0.0,  'rgba(0,0,0,0.0)' ],
				[ 0.4,  'rgba(0,0,0,0.1)' ],
				[ 0.9,  'rgba(0,0,0,1.0)' ],
				[ 1.0,  'rgba(0,0,0,0.0)' ]
			]
		};
		this.__positions = {
			small: [],
			big:   []
		};

		settings = null;

	};


	Class.prototype = {

		update: function(clock, delta, config) {

			var positions = this.__positions;

			positions.small = [];
			positions.big   = [];


			for (var e = 0, el = config.entities.length; e < el; e++) {

				var entity   = config.entities[e];
				var position = entity.position;

				if (entity.type === 'ship') {
					positions.big.push(position.x);
					positions.big.push(position.y);
				} else {
					positions.small.push(position.x);
					positions.small.push(position.y);
				}

			}

		},

		render: function(renderer, offsetX, offsetY) {

			var buffer = this.__buffer;
			if (buffer !== null) {

				renderer.clearBuffer(buffer);

				renderer.setBuffer(buffer);

				renderer.drawBox(
					0,
					0,
					buffer.width,
					buffer.height,
					'#000000',
					true
				);

				renderer.__ctx.globalCompositeOperation = 'destination-out';


				var big   = this.__positions.big;
				var small = this.__positions.small;


				for (var b = 0, bl = big.length; b < bl; b += 2) {

					var x = offsetX + big[b];
					var y = offsetY + big[b + 1];

					renderer.drawCircleGradient(
						x,
						y,
						160,
						this.__gradients.big
					);

				}

				for (var s = 0, sl = small.length; s < sl; s += 2) {

					var x = offsetX + small[s];
					var y = offsetY + small[s + 1];

					renderer.drawCircleGradient(
						x,
						y,
						40,
						this.__gradients.small
					);

				}

				renderer.__ctx.globalCompositeOperation = 'source-over';

				renderer.setBuffer(null);

				renderer.drawBuffer(
					offsetX - buffer.width / 2,
					offsetY - buffer.height / 2,
					buffer
				);

			}

		}

	};


	return Class;

});

