
lychee.define('sorbet.data.VHost').requires([
	'sorbet.data.Filesystem'
]).exports(function(lychee, sorbet, global, attachments) {

	var _filesystem = sorbet.data.Filesystem;


	var _id = 0;

	var Class = function(id, config) {

		this.id   = id || ('vhost-' + _id++);
		this.root = config.root;

		this.fs = new _filesystem();
		this.fs.watch(this.root);

		this.__redirects = {};


		for (var alias in config.aliases) {

			var tmp    = config.aliases[alias].split('/');
			var ref    = tmp.pop();
			var folder = tmp.join('/');

			this.fs.add(
				folder,
				ref,
				_fs.TYPE.link,
				alias
			);

		}


		for (var from in config.redirects) {
			var to = config.redirects[from];
			if (typeof to === 'string') {
				this.__redirects[from] = to;
			}
		}

	};


	Class.prototype = {

		getRedirect: function(url) {

			var redirect = null;

			for (var rurl in this.redirects) {

				if (
					   rurl.substr(-1) === '*'
					&& rurl.substr(0, rurl.length - 1) === url.substr(0, rurl.length - 1)
				) {

					var tmp = url.substr(rurl.length - 1, url.length - (rurl.length - 1));

					redirect = this.redirects[rurl].replace('*', tmp);

				} else if (rurl === url) {

					redirect = this.redirects[rurl];

				}

			}


			return redirect;

		}

	};


	return Class;

});

