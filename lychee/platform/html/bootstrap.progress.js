
(function(lychee, global) {

	var doc = global.document || null;


	var _message  = null;
	var _progress = null;
	var _wrapper  = null;

	if (
		   doc !== null
		&& typeof doc.createElement === 'function'
		&& typeof doc.addEventListener === 'function'
		&& typeof doc.querySelector === 'function'
	) {

		_wrapper = global.document.createElement('div');
		_wrapper.id        = 'lychee-bootstrap-progress';
		_wrapper.innerHTML = '<div><div><div></div></div><span>Loading...</span></div>';


		doc.addEventListener("DOMContentLoaded", function() {

			doc.body.appendChild(_wrapper);

			_message  = doc.querySelector('#lychee-bootstrap-progress > div > span');
			_progress = doc.querySelector('#lychee-bootstrap-progress > div > div > div');

		}, false);

	}




	var _count = function(obj) {

		var count = 0;
		for (var o in obj) {
			if (obj[o] === true) count++;
		}

		return count;

	};



	lychee.Preloader.prototype._progress = function(url, _cache) {


		/*
		 * RESERVED STATE FOR 100%
		 */

		if (
			   url === null
			&& _cache === null
		) {

			if (_wrapper.parentNode !== null) {

				_progress.style.width = '100%';

				setTimeout(function() {
					_wrapper.parentNode.removeChild(_wrapper);
				}, 500);

			}

			return;

		}



		if (_progress !== null) {


			var ready      = Object.keys(_cache).length;
			var loading    = _count(this.__pending);
			var percentage = (ready / (ready + loading) * 100) | 0;

			_progress.style.width = percentage + '%';

		}


		if (_message !== null) {

			_message.innerHTML = 'Loading: ' + url + ' (' + loading + ' left)';

		}

	};

})(lychee, this);

