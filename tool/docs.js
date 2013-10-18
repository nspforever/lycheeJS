#!/usr/bin/env nodejs


var _classpath_to_id = function(path) {

	var tmp        = path.replace('.js', '').split('/');
	var output     = tmp[1];
	var ignorelist = [ 'platform', 'html', 'v8gl', 'webgl', 'nodejs' ];


	for (var t = 3; t < tmp.length; t++) {

		if (ignorelist.indexOf(tmp[t]) === -1) {
			output += '.' + tmp[t];
		}

	}


	return output;

};

var _classpath_to_docpath = function(path) {

	var tmp        = path.replace('.js', '').split('/');
	var output     = './external/lycheejs.org/docs/';
	var ignorelist = [ 'platform', 'html', 'v8gl', 'webgl', 'nodejs' ];


	output += 'api-' + tmp[1];

	for (var t = 3; t < tmp.length; t++) {

		if (ignorelist.indexOf(tmp[t]) === -1) {
			output += '-' + tmp[t];
		}

	}

	output += '.html';


	return output;

};


var fs   = require('fs');
var sys  = require('sys');
var exec = require('child_process').exec;


var _cache = {};


var child = exec('grep -R ": function" ./lychee/source', function(error, stdout, stderr) {

	var lines = stdout.split('\n');
	for (var l = 0, ll = lines.length; l < ll; l++) {

		var line    = lines[l];
		var tmp     = line.split('\t');


		if (tmp.length !== 3) continue;


		var defpath = _classpath_to_id(tmp[0].replace(':', ''));
		var docpath = _classpath_to_docpath(tmp[0].replace(':', ''));

		var cache = _cache[defpath] || null;
		if (cache === null) {

			cache = _cache[defpath] = {
				def: null,
				doc: null,
				defpath: defpath,
				docpath: docpath,
				methods: []
			};


			cache.def = fs.readFileSync(tmp[0].replace(':', ''), 'utf8');

			if (fs.existsSync(docpath) === true) {
				cache.doc = fs.readFileSync(docpath, 'utf8');
			}


		}


		var method = {};

		method.name = tmp[2].split(':')[0];
		method.args = tmp[2].split(':')[1].replace(' function(', '').replace(') {', '').split(', ');


		if (
			   method.args.length === 1
			&& method.args[0] === ''
		) {
			method.args = [];
		}


		if (
			   cache.def.indexOf('Class.prototype = {') < cache.def.indexOf(tmp[2])
			&& method.name.substr(0, 2) !== '//'
			&& method.name.indexOf('=') === -1
		) {
			cache.methods.push(method);
		}

	}


	_show_summary();

});


var _show_summary = function() {

	for (var id in _cache) {

		var entry = _cache[id];


		for (var m = 0, ml = entry.methods.length; m < ml; m++) {

			var method    = entry.methods[m];
			var idpath    = entry.defpath.split('.').join('-') + '-' + method.name;
			var protopath = entry.defpath + '.prototype.' + method.name;


			if (entry.doc !== null) {

				var article  = "<article id=\"" + idpath + "\">";
				var headline = "\) " + protopath + "(";

				var regex =  '';

				regex += '/' + method.name + '\:\wfunction\(';

				regex += '\)';

				if (
					   entry.doc.indexOf(article) !== -1
					&& entry.doc.indexOf(headline) !== -1
					&& entry.doc.match(regex)
				) {

console.log(entry.defpath + ' >> ' + method.name + ' DOCUMENTED');

				} else {

console.log(entry.defpath + ' >> ' + method.name + ' UNDOCUMENTED');

				}

			} else if (entry.doc === null) {

				_show_undocumented(entry, method);

			}

		}

	}

};


var _show_undocumented = function(entry, method) {
};

