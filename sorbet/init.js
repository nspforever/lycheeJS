
var path = "../lychee";

require(path + '/core.js');
require(path + '/Builder.js');
require(path + '/Preloader.js');

// bootstrap.js requires the root path to this file.
require(path + '/platform/nodejs/bootstrap.js')(__dirname);


require('./source/Main.js');


lychee.debug = true;

lychee.rebase({
	lychee: path,
	sorbet: './source'
});

lychee.tag({
	platform: [ 'nodejs' ]
});

lychee.build(function(lychee, global) {

	var fs = require('fs');

	var root = __dirname;
	if (
		   root.substr(0, 1).match(/([A-Z])/)
		&& root.substr(1, 1) === ':'
	) {
		root = root.split(/\\/).join('/');
		root = root.substr(2, root.length - 2);
	}

	root = root.split('/');
	root.splice(root.length - 1, 1);
	root = root.join('/');


	var profile = './profile/' + (process.argv[2] || 'default') + '.json';
	var config  = JSON.parse(fs.readFileSync(profile, 'utf8'));


	var main = new sorbet.Main(
		root,
		config
	);

	main.listen(config.port);

}, typeof global !== 'undefined' ? global : this);

