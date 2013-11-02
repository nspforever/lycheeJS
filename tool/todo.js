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


exec('grep -R ": function" ./lychee/source', function(error, stdout, stderr) {

	var lines = stdout.split('\n');
	for (var l = 0, ll = lines.length; l < ll; l++) {

		var line = lines[l];
		var tmp  = line.split('\t');


		if (tmp.length !== 3) continue;


		var filepath = tmp[0].replace(':', '');

		var uidpath = _filepath_to_uidpath(filepath);
		var defpath = _filepath_to_defpath(filepath);
		var docpath = _filepath_to_docpath(filepath);


		if (uidpath === null) continue;


		var cache = _cache[uidpath] || null;
		if (cache === null) {

			cache = _cache[uidpath] = {
				uidpath:  uidpath,
				filepath: filepath,
				defpath:  defpath,
				def:      null,
				docpath:  docpath,
				doc:      null,
				methods:  []
			};


			if (fs.existsSync(cache.filepath) === true) {
				cache.def = fs.readFileSync(cache.filepath, 'utf8');
			}

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



	var length = 0;

	var missing = {
		methods:   [],
		defblocks: []
	};

	for (var uid in _cache) {

		var entry = _cache[uid];

		if (entry.doc === null) {

			missing.defblocks.push([
				entry.filepath,
				entry.defpath
			]);

			length = Math.max(length, entry.filepath.length);

			continue;

		}


		for (var m = 0, ml = entry.methods.length; m < ml; m++) {

			var method    = entry.methods[m];
			var idpath    = entry.defpath.split('.').join('-') + '-' + method.name;
			var protopath = entry.defpath + '.prototype.' + method.name;


			if (entry.doc !== null) {

				var article  = "<article id=\"" + idpath + "\">";
				var headline = "\) " + protopath + "(";

				if (
					   entry.doc.indexOf(article) !== -1
					&& entry.doc.indexOf(headline) !== -1
				) {

					// TODO: Verification of method signatures

				} else {

					missing.methods.push([
						entry.filepath,
						protopath
					]);

					length = Math.max(length, entry.filepath.length);

				}

			}

		}

	}


	var str      = '';
	var filepath = '';


	console.log('\n');
	console.log('- - - - -');
	console.log('Missing API Docs (Classes):');
	console.log('- - - - -');

	for (var md = 0, mdl = missing.defblocks.length; md < mdl; md++) {

		filepath = missing.defblocks[md][0];

		str = filepath + ': ';
		for (var l = 0; l < length - filepath.length; l++) str += ' ';
		str += missing.defblocks[md][1];

		console.log(str);

	}


	console.log('\n');
	console.log('- - - - -');
	console.log('Missing API Docs (Methods):');
	console.log('- - - - -');

	for (var mm = 0, mml = missing.methods.length; mm < mml; mm++) {

		filepath = missing.methods[mm][0];

		str = filepath + ': ';
		for (var l = 0; l < length - filepath.length; l++) str += ' ';
		str += missing.methods[mm][1];

		console.log(str);

	}

});

exec('grep -R "// TODO:" ./lychee/source', function(error, stdout, stderr) {

	var length  = 0;
	var missing = [];

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
		var message  = tmp[1].substr('// TODO:'.length);

		missing.push([
			filepath, message
		]);

		length = Math.max(length, filepath.length);

	}


	var str      = '';
	var filepath = '';


	console.log('\n');
	console.log('- - - - -');
	console.log('Missing Functionality (TODO):');
	console.log('- - - - -');

	for (var m = 0, ml = missing.length; m < ml; m++) {

		filepath = missing[m][0];

		str = filepath + ': ';
		for (var l = 0; l < length - filepath.length; l++) str += ' ';
		str += missing[m][1];

		console.log(str);

	}

});

