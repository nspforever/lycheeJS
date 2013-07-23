
lychee.define('game.logic.Level').requires([
	'lychee.game.Layer',
	'game.entity.Deco',
	'game.entity.Jewel'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var _data  = attachments['data.json'];

	var _layer = lychee.game.Layer;
	var _deco  = game.entity.Deco;
	var _jewel = game.entity.Jewel;


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.__bglayer = settings.bglayer instanceof _layer ? settings.bglayer : null;
		this.__fglayer = settings.fglayer instanceof _layer ? settings.fglayer : null;
		this.__tile    = typeof settings.tile === 'number'  ? settings.tile    : 1;


		this.__cache = { x: 0, y: 0, z: 0 };
		this.__data  = _data['easy'];
		this.__grid  = [];

		this.__candidate     = null;
		this.__queue         = [];
		this.__queuecallback = null;
		this.__queuescope    = null;
		this.__queueclock    = null;


		this.setMode(settings.mode);


		lychee.event.Emitter.call(this);

	};


	Class.MODE = {};

	(function(enumobj) {

		var i = 0;

		for (var id in _data) {
			enumobj[id] = i++;
		}

	})(Class.MODE);


	Class.prototype = {

		/*
		 * STATE API
		 */

		reset: function(sizeX, sizeY) {

			var tile = this.__tile;
			var entity = null;


			var data = this.__data;
			var bgroot = this.__bglayer.getEntity('root');
			var fgroot = this.__fglayer.getEntity('root');
			if (
				data !== null
				&& bgroot !== null
				&& fgroot !== null
			) {

				var offsetX = -1/2 * bgroot.width;
				var offsetY = -1/2 * bgroot.height;

				for (var y = 0; y < sizeY; y++) {

					for (var x = 0; x < sizeX; x++) {

						var substate = game.entity.Deco.substate(x, y);

						this.__cache.x = offsetX + tile / 2 + x * tile;
						this.__cache.y = offsetY + tile / 2 + y * tile;


						entity = null;

						var raw = '0';
						if (
							data.level[y] !== undefined
							&& data.level[y][x] !== undefined
						) {
							raw = data.level[y][x];
						}


						entity = new game.entity.Deco();
						entity.setPosition(this.__cache);
						entity.setState('dark-' + substate);

						bgroot.addEntity(entity);


						if (raw === '1') {

							entity = new game.entity.Deco();
							entity.setPosition(this.__cache);
							entity.setState('bright-' + substate);

							fgroot.addEntity(entity);

							this.setByPosition(x, y, entity);

						}

					}

				}

			}


			if (
				fgroot !== null
				&& sizeX > 0
				&& sizeY > 0
			) {

				var offsetX = -1/2 * fgroot.width;
				var offsetY = -1/2 * fgroot.height;

				for (var x = 0; x < sizeX; x++) {

					for (var y = 0; y < sizeY; y++) {

						this.__cache.x = offsetX + tile / 2 + x * tile;
						this.__cache.y = offsetY + tile / 2 + y * tile;


						entity = this.getByPosition(x, y);

						if (entity === null) {

							entity = new game.entity.Jewel();
							entity.setPosition(this.__cache);
							entity.setState(entity.getRandomState());

							this.setByPosition(x, y, entity);

							fgroot.addEntity(entity);

						} else if (entity instanceof _jewel) {

							entity.clearEffect();
							entity.setPosition(this.__cache);
							entity.setState(entity.getRandomState());
							entity.sync(null, true);

						}

					}

				}


				this.__sizeX = sizeX;
				this.__sizeY = sizeY;

			}

		},

		update: function(clock, delta) {

			if (this.__queue.length > 0) {

				var tile = this.__tile;
				var root = this.__fglayer.getEntity('root');
				var offsetX = -1/2 * root.width;
				var offsetY = -1/2 * root.height;



				for (var y = (this.__sizeY - 1); y >= 0; y--) {

					for (var x = 0; x < this.__sizeX; x++) {

						var entity      = this.getByPosition(x, y);
						var replacement = this.getByPosition(x, y - 1);

						if (
							entity === null
							&& replacement !== null
						) {

							this.__cache.x = offsetX + tile / 2 + x * tile;
							this.__cache.y = offsetY + tile / 2 + y * tile;

							replacement.setTween({
								duration: 500,
								position: this.__cache,
								type: lychee.game.Entity.TWEEN.bounceeaseout
							});

							this.setByPosition(x, y,     replacement);
							this.setByPosition(x, y - 1, null);

						} else if (
							entity === null
							&& replacement === null
							&& y === 0
						) {

							if (this.__queue.length > 0) {

								replacement = this.__queue.pop();
								replacement.setState(replacement.getRandomState());


								this.__cache.x = offsetX + tile / 2 + x * tile;
								this.__cache.y = offsetY - tile;

								replacement.setPosition(this.__cache);


								this.__cache.x = offsetX + tile / 2 + x * tile;
								this.__cache.y = offsetY + tile / 2 + y * tile;

								replacement.setTween({
									duration: 500,
									position: this.__cache,
									type: lychee.game.Entity.TWEEN.bounceeaseout
								});

								this.setByPosition(x, y, replacement);
								this.__queueclock = clock + 500;

							}

						}

					}

				}

			} else if (
				this.__queue.length === 0
				&& this.__queuecallback !== null
				&& this.__queueclock !== null
				&& this.__queueclock < clock
			) {

				this.__queuecallback.call(this.__queuescope);
				this.__queuecallback = null;
				this.__queuescope    = null;

			}

		},



		/*
		 * LOGIC INTEGRATION API
		 */

		getByPosition: function(x, y) {

			if (
				this.__grid[x] !== undefined
				&& this.__grid[x][y] !== undefined
			) {
				return this.__grid[x][y];
			}


			return null;

		},

		setByPosition: function(x, y, value) {

			if (this.__grid[x] === undefined) {
				this.__grid[x] = [];
			}


			this.__grid[x][y] = value;

		},

		touch: function(x, y) {

			var entity = this.getByPosition(x, y);
			if (
				entity !== null
				&& entity instanceof _jewel
			) {

				var jewelz = this.__walk(
					x,
					y,
					entity.state
				);


				var data = this.__data;
				if (jewelz.length >= data.hits) {

					this.trigger('success', [ jewelz.length ]);

					this.__destroy(jewelz, function() {
						this.__refresh();
						this.trigger('unlock');
					}, this);

				} else {
					this.trigger('fail', [ jewelz.length ]);
					this.trigger('unlock');
				}

			} else {
				this.trigger('fail', [ 0 ]);
				this.trigger('unlock');
			}

		},

		__refresh: function() {

			this.__candidate = null;


			var found = null;
			var data  = this.__data;

			for (var x = 0; x < this.__sizeX; x++) {

				if (found !== null) break;

				for (var y = 0; y < this.__sizeY; y++) {

					var entity = this.getByPosition(x, y);
					if (
						entity !== null
						&& entity instanceof _jewel
					) {

						var candidate = this.__walk(
							x,
							y,
							entity.state
						);


						if (candidate.length >= data.hits) {
							found = candidate;
							break;
						}

					}

				}

			}


			if (found === null) {

				var amount = data.hits;

				for (var x = (Math.random() * (this.__sizeX - 1)) | 0; x < this.__sizeX; x++) {

					if (found !== null) break;

					for (var y = (Math.random() * (this.__sizeY - 1)) | 0; y < this.__sizeY; y++) {

						var jewelz = this.__walk(
							x,
							y,
							null
						);

						if (jewelz.length >= amount) {
							found = jewelz;
							break;
						}

					}

				}


				if (found !== null) {

					for (var f = 1; f < found.length; f++) {
						found[f].setState(found[0].state);
					}

				}

			}


			if (found !== null) {
				this.__candidate = found;
			}

		},

		__walk: function(x, y, state, jewelz) {

			var return_jewelz = false;
			if (jewelz === undefined) {

				jewelz = [];
				return_jewelz = true;

			} else if (state === null) {

				if (jewelz.length >= this.__data.hits) {
					return;
				}

			}


			var entity = this.getByPosition(x, y);
			if (
				entity !== null
				&& entity instanceof _jewel
				&& (
					state === null
					|| entity.state === state
				)
			) {

				// Skip double entries in hitmap
				var found = false;
				for (var j = 0, jl = jewelz.length; j < jl; j++) {
					if (jewelz[j] === entity) {
						found = true;
						break;
					}
				}


				if (found === false) {

					jewelz.push(entity);


					var sizeX = this.__sizeX;
					var sizeY = this.__sizeY;


					if (x - 1 >= 0 && x - 1 < sizeX) {
						this.__walk(x - 1, y, state, jewelz);
					}

					if (x + 1 >= 0 && x + 1 < sizeX) {
						this.__walk(x + 1, y, state, jewelz);
					}

					if (y - 1 >= 0 && y - 1 < sizeY) {
						this.__walk(x, y - 1, state, jewelz);
					}

					if (y + 1 >= 0 && y + 1 < sizeY) {
						this.__walk(x, y + 1, state, jewelz);
					}

				}

			}


			if (return_jewelz === true) {
				return jewelz;
			}

		},

		__destroy: function(jewelz, callback, scope) {

			callback = callback instanceof Function ? callback : function(){};
			scope    = scope !== undefined ? scope : this;


			var tile = this.__tile;
			var root = this.__fglayer.getEntity('root');
			var offsetX = -1/2 * root.width;
			var offsetY = -1/2 * root.height;


			for (var j = 0, jl = jewelz.length; j < jl; j++) {

				var jewel    = jewelz[j];
				var position = jewel.position;

				var gridX = ((position.x - offsetX - tile / 2) / tile) | 0;
				var gridY = ((position.y - offsetY - tile / 2) / tile) | 0;

				this.setByPosition(gridX, gridY, null);


				this.__cache.x = position.x;
				this.__cache.y = offsetY - tile;

				jewel.setPosition(this.__cache);


				this.__queue.push(jewel);
				this.__queuecallback = callback;
				this.__queuescope    = scope;

			}

		},


		/*
		 * PUBLIC API
		 */

		getData: function() {
			return this.__data;
		},

		setMode: function(mode) {

			if (typeof mode !== 'number') return false;


			var found = false;

			var id;
			for (id in Class.MODE) {

				if (mode === Class.MODE[id]) {
					found = true;
					break;
				}

			}


			if (found === true) {
				this.__data = _data[id];
			}


			return found;

		}

	};


	return Class;

});

