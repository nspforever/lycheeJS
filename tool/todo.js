#!/usr/bin/env nodejs



/*
 * This is an exception list, because those files
 * have no lychee.DefinitionBlock conventions as
 * they are part of the bootstrapping process.
 */

var _static_uidpaths = {
	'./lychee/source/core.js':                      null,
	'./lychee/source/platform/html/bootstrap.js':   null,
	'./lychee/source/platform/nodejs/bootstrap.js': null,
	'./lychee/source/platform/v8gl/bootstrap.js':   null
};

var _filepath_to_uidpath = function(path) {

	if (_static_uidpaths[path] !== undefined) {
		return _static_uidpaths[path];
	}


	var tmp        = path.replace('.js', '').split('/');
	var output     = tmp[1];
	var ignorelist = [ 'platform', 'html', 'v8gl', 'webgl', 'nodejs' ];


	for (var t = 3; t < tmp.length; t++) {

		if (tmp[t] === 'platform') {
			output = '{platform:' + tmp[t + 1] + '}' + output;
			t++;
		} else if (ignorelist.indexOf(tmp[t]) === -1) {
			output += '.' + tmp[t];
		}

	}


	return output;

};

var _filepath_to_defpath = function(path) {

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

var _filepath_to_docpath = function(path) {

	var tmp        = path.replace('.js', '').split('/');
	var output     = './external/lycheeJS-website/docs/';
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

var _get_cache = function(filepath) {

	var uidpath = _filepath_to_uidpath(filepath);
	var defpath = _filepath_to_defpath(filepath);
	var docpath = _filepath_to_docpath(filepath);


	var cache = _cache[uidpath] || null;
	if (cache === null) {

		cache = _cache[uidpath] = {
			uidpath:    uidpath,
			filepath:   filepath,
			defpath:    defpath,
			def:        null,
			docpath:    docpath,
			doc:        null,
			methods:    [],
			enums:      [],
			properties: []
		};


		if (fs.existsSync(cache.filepath) === true) {
			cache.def = fs.readFileSync(cache.filepath, 'utf8');
		}

		if (fs.existsSync(docpath) === true) {
			cache.doc = fs.readFileSync(docpath, 'utf8');
		}

	}


	return cache;

};


var missing = {
	enums:            [],
	properties:       [],
	methods:          [],
	methodsignatures: [],
	definitions:      [],
	todos:            []
};


exec('grep -R ": function" ./lychee/source', function(error, stdout, stderr) {

	var lines = stdout.split('\n');
	for (var l = 0, ll = lines.length; l < ll; l++) {

		var line = lines[l];
		var tmp  = line.split('\t');


		if (tmp.length !== 3) continue;


		var cache = _get_cache(tmp[0].replace(':', ''));
		if (cache === null) continue;


		if (cache.def.indexOf('Class.prototype = {') < cache.def.indexOf(tmp[2])) {

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
				   method.name.substr(0, 2) !== '//'
				&& method.name.indexOf('=') === -1
			) {

				cache.methods.push(method);

			}

		}

	}


	for (var uid in _cache) {

		var entry = _cache[uid];

		if (entry.doc === null) {

			missing.definitions.push([
				entry.filepath,
				entry.defpath
			]);

			continue;

		}


		for (var m = 0, ml = entry.methods.length; m < ml; m++) {

			var method = entry.methods[m];
			var idpath = entry.defpath.split('.').join('-') + '-' + method.name;
			var jspath = entry.defpath + '.prototype.' + method.name;


			if (entry.doc !== null) {

				var article   = "<article id=\"" + idpath + "\">";
				var headline  = "\) " + jspath + "(";

				if (
					   entry.doc.indexOf(article) !== -1
					&& entry.doc.indexOf(headline) !== -1
				) {

					var signature = new RegExp(jspath + "\\(void\\)");
					if (method.args.length > 0) {
						signature = new RegExp(jspath + "\\(" + method.args.join("(\\s\\[)?(,\\s)") + "(\\]?)\\)");
					}

					if (!entry.doc.match(signature)) {

						missing.methods.push([
							entry.filepath,
							jspath + " (DIFF)"
						]);

					}

				} else {

					missing.methods.push([
						entry.filepath,
						jspath
					]);

				}

			}

		}

	}

});


exec('grep -R "Class\\." ./lychee/source', function(error, stdout, stderr) {

	var lines = stdout.split('\n');
	for (var l = 0, ll = lines.length; l < ll; l++) {

		var line = lines[l];
		var tmp  = line.split('\t');

		if (tmp.length !== 2) continue;
		if (tmp[1].substr(0, 15) === 'Class.prototype') continue;


		var cache = _get_cache(tmp[0].replace(':', ''));
		if (cache === null) continue;


		if (cache.def.indexOf('Class.prototype = {') > cache.def.indexOf(tmp[1])) {

			var str = tmp[1].split(' = ')[0];
			if (str.match(/Class\.([A-Z]+)/)) {
				cache.enums.push(str.substr(6));
			}

		}

	}


	for (var uid in _cache) {

		var entry = _cache[uid];


		for (var e = 0, el = entry.enums.length; e < el; e++) {

			var _enum  = entry.enums[e];
			var idpath = entry.defpath.split('.').join('-') + '-' + _enum;
			var jspath = entry.defpath + '.' + _enum;


			if (entry.doc !== null) {

				var article   = "<article id=\"" + idpath + "\">";
				var headline  = jspath;

				if (
					   entry.doc.indexOf(article) !== -1
					&& entry.doc.indexOf(headline) !== -1
				) {

				} else {

					missing.enums.push([
						entry.filepath,
						jspath
					]);

				}

			}

		}

	}

});

exec('grep -R "// TODO:" ./lychee/source', function(error, stdout, stderr) {

	var lines = stdout.split('\n');
	for (var l = 0, ll = lines.length; l < ll; l++) {

		var line = lines[l];
		var tmp  = line.split('\t');

		for (var t = 0, tl = tmp.length; t < tl; t++) {
			if (tmp[t] === '') {
				tmp.splice(t, 1);
				tl--;
				t--;
			}
		}


		if (tmp.length !== 2) continue;


		var filepath = tmp[0].replace(':', '');
		var message  = tmp[1].substr('// TODO: '.length);

		missing.todos.push([
			filepath, message
		]);

	}

});



/*
 * OUTPUT
 */

var _print_output = function(headline, array, whitespace) {

	whitespace = typeof whitespace === 'number' ? whitespace : 0;


	var str = '';

	str +=                                  '\n';
	str += headline                       + '\n';
	str += '============================' + '\n';
	str +=                                  '\n';


	for (var a = 0, al = array.length; a < al; a++) {

		var entry       = array[a];
		var filepath    = entry[0];
		var description = entry[1];

		str += filepath + ': ';
		for (var l = 0; l < whitespace - filepath.length; l++) str += ' ';
		str += description;
		str += '\n';

	}


	console.log(str);

};



setTimeout(function() {

	var _get_whitespace = function() {

		var length = 0;
		for (var a = 0, al = arguments.length; a < al; a++) {

			var entry = arguments[a];
			for (var e = 0, el = entry.length; e < el; e++) {
				length = Math.max(entry[e][0].length, length);
			}

		}

		return length;

	};

	var whitespace = _get_whitespace(
		missing.definitions,
		missing.enums,
		missing.methods,
		missing.todos
	);

	_print_output('Missing API Docs (Definitions)', missing.definitions, whitespace);
	_print_output('Missing API Docs (Enums)',       missing.enums,       whitespace);
	_print_output('Missing API Docs (Methods)',     missing.methods,     whitespace);
	_print_output('Missing Functionality (TODO)',   missing.todos,       whitespace);

}, 1000);

