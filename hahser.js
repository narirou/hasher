!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.hasher=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var pathToRegexp = require( 'path-to-regexp' );


var hasher = module.exports = function( path, fn ) {
	if( ! arguments.length ) {
		return hasher.start();
	}

	if( typeof path === 'string' ) {
		if( typeof fn === 'function' ) {
			return hasher.set( path, arguments );
		}
		else {
			return hasher.redirect( path );
		}
	}

	if( typeof path === 'function' ) {
		return hasher.set( '(.*)', arguments );
	}

	throw new Error( 'Invalid arguments.' );
};


hasher.routes = [];


hasher.running = false;


hasher.current = '';


hasher.options = {
	sensitive: false,
	strict: false,
	end: true
};


hasher.start = function( notStartCurrent ) {
	if( hasher.running ) {
		return hasher;
	}

	hasher.running = true;

	window.addEventListener( 'hashchange', showCurrent, false );

	if( ! notStartCurrent ) {
		showCurrent();
	}

	return hasher;
};


hasher.stop = function() {
	if( ! hasher.running ) {
		return hasher;
	}

	hasher.running = false;

	window.removeEventListener( 'hashchange', showCurrent, false );

	return hasher;
};


hasher.set = function( path, args ) {
	var route = new Route( path, hasher.options );

	// hasher.set called direct
	if( typeof args === 'function' ) {
		args = arguments;
	}

	// set callbacks
	for( var i = 0, len = args.length; i < len; i++ ) {
		var callback = args[ i ];

		if( typeof callback === 'function' ) {
			route.callbacks.push( callback );
		}
	}

	// set routes
	if( route.callbacks.length ) {
		hasher.routes.push( route );
	}

	return hasher;
};


hasher.redirect = hasher.show = function( hash ) {
	// same page
	var nextHash = hashValue( hash );
	if( hasher.current === nextHash ) {
		return hasher;
	}

	// change
	var running = hasher.running;
	if( running ) {
		hasher.stop();
	}

	hasher.current = nextHash;

	window.location.hash = '#' + hasher.current;

	show( hasher.current );

	if( running ) {
		setTimeout( function() {
			hasher.start( true );
		}, 0 );
	}

	return hasher;
};


hasher.reset = function() {
	hasher.stop();
	hasher.routes = [];
	hasher.current = '';
	hasher.options = {
		sensitive: false,
		strict: false,
		end: true
	};
};


function Route( path, options ) {
	this.path = ( path === '*' ) ? '(.*)' : path;
	this.value = '';
	this.callbacks = [];
	this.keys = [];
	this.regexp = pathToRegexp( this.path, this.keys, options );
}


function hashValue( hash ) {
	hash = hash || window.location.hash;
	if( hash ) {
		return hash.replace( '#', '' );
	}
	else {
		return '/';
	}
}


function show( value, routeIndex ) {
	for( var i = routeIndex || 0, len = hasher.routes.length; i < len; i++ ) {
		var route   = hasher.routes[ i ],
			matches = route.regexp.exec( decodeURIComponent( value ) );

		if( ! matches ) {
			continue;
		}

		// set params
		var keys = route.keys,
			params = {};

		if( keys.length ) {
			for( var j = 1, pLen = matches.length; j < pLen; j++ ) {
				params[ keys[ j - 1 ].name ] = matches[ j ];
			}
		}

		// set current value
		route.value = value;

		// run callbacks
		return exec( route, params, i );
	}
}


function exec( route, params, routeIndex ) {
	var i = 0;

	var next = function() {
		var fn = route.callbacks[ i ];

		// next callbacks
		if( fn ) {
			i++;
			return fn( params , next );
		}

		// next route
		else {
			routeIndex++;
			return show( route.value, routeIndex );
		}
	};

	return next();
}


function showCurrent() {
	show( hasher.current = hashValue() );
}

},{"path-to-regexp":2}],2:[function(require,module,exports){
var isArray = require('isarray');

/**
 * Expose `pathtoRegexp`.
 */
module.exports = pathtoRegexp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match already escaped characters that would otherwise incorrectly appear
  // in future matches. This allows the user to escape special characters that
  // shouldn't be transformed.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
  // "/route(\\d+)" => [undefined, undefined, undefined, "\d+", undefined]
  '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
  // Match regexp special characters that should always be escaped.
  '([.+*?=^!:${}()[\\]|\\/])'
].join('|'), 'g');

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1');
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys;

  return re;
};

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array should be passed in, which will contain the placeholder key
 * names. For example `/user/:id` will then contain `["id"]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 keys
 * @param  {Object}                options
 * @return {RegExp}
 */
function pathtoRegexp (path, keys, options) {
  if (!isArray(keys)) {
    options = keys;
    keys = null;
  }

  keys = keys || [];
  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var flags = options.sensitive ? '' : 'i';
  var index = 0;

  if (path instanceof RegExp) {
    // Match all capturing groups of a regexp.
    var groups = path.source.match(/\((?!\?)/g);

    // Map all the matches to their numeric indexes and push into the keys.
    if (groups) {
      for (var i = 0; i < groups.length; i++) {
        keys.push({
          name:      i,
          delimiter: null,
          optional:  false,
          repeat:    false
        });
      }
    }

    // Return the source back to the user.
    return attachKeys(path, keys);
  }

  // Map array parts into regexps and return their source. We also pass
  // the same keys and options instance into every generation to get
  // consistent matching groups before we join the sources together.
  if (isArray(path)) {
    var parts = [];

    for (var i = 0; i < path.length; i++) {
      parts.push(pathtoRegexp(path[i], keys, options).source);
    }
    // Generate a new regexp instance by joining all the parts together.
    return attachKeys(new RegExp('(?:' + parts.join('|') + ')', flags), keys);
  }

  // Alter the path string into a usable regexp.
  path = path.replace(PATH_REGEXP, function (match, escaped, prefix, key, capture, group, suffix, escape) {
    // Avoiding re-escaping escaped characters.
    if (escaped) {
      return escaped;
    }

    // Escape regexp special characters.
    if (escape) {
      return '\\' + escape;
    }

    var repeat   = suffix === '+' || suffix === '*';
    var optional = suffix === '?' || suffix === '*';

    keys.push({
      name:      key || index++,
      delimiter: prefix || '/',
      optional:  optional,
      repeat:    repeat
    });

    // Escape the prefix character.
    prefix = prefix ? '\\' + prefix : '';

    // Match using the custom capturing group, or fallback to capturing
    // everything up to the next slash (or next period if the param was
    // prefixed with a period).
    capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

    // Allow parameters to be repeated more than once.
    if (repeat) {
      capture = capture + '(?:' + prefix + capture + ')*';
    }

    // Allow a parameter to be optional.
    if (optional) {
      return '(?:' + prefix + '(' + capture + '))?';
    }

    // Basic parameter support.
    return prefix + '(' + capture + ')';
  });

  // Check whether the path ends in a slash as it alters some match behaviour.
  var endsWithSlash = path[path.length - 1] === '/';

  // In non-strict mode we allow an optional trailing slash in the match. If
  // the path to match already ended with a slash, we need to remove it for
  // consistency. The slash is only valid at the very end of a path match, not
  // anywhere in the middle. This is important for non-ending mode, otherwise
  // "/test/" will match "/test//route".
  if (!strict) {
    path = (endsWithSlash ? path.slice(0, -2) : path) + '(?:\\/(?=$))?';
  }

  // In non-ending mode, we need prompt the capturing groups to match as much
  // as possible by using a positive lookahead for the end or next path segment.
  if (!end) {
    path += strict && endsWithSlash ? '' : '(?=\\/|$)';
  }

  return attachKeys(new RegExp('^' + path + (end ? '$' : ''), flags), keys);
};

},{"isarray":3}],3:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}]},{},[1])(1)
});
