'use strict';

var pathToRegexp = require( 'path-to-regexp' );


function Route( path ) {
	this.path = ( path === '*' ) ? '(.*)' : path;
	this.value = '';
	this.callbacks = [];
	this.keys = [];
	this.regexp = pathToRegexp( path, this.keys );
}


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


hasher.start = function( notStartCurrent ) {
	if( hasher.running ) {
		return;
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
		return;
	}

	hasher.running = false;

	window.removeEventListener( 'hashchange', showCurrent, false );

	return hasher;
};


hasher.set = function( path, args ) {
	var route = new Route( path );

	for( var i = 0, len = args.length; i < len; i++ ) {
		var callback = args[i];

		if( typeof callback === 'function' ) {
			route.callbacks.push( callback );
		}
	}

	hasher.routes.push( route );

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
		setTimeout( 0, function() {
			hasher.start( true );
		});
	}

	return hasher;
};


hasher.reset = function() {
	hasher.stop();
	hasher.routes = [];
	hasher.current = '';
};


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

		if( ! matches ) continue;

		// set context
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

		// next statement
		else {
			routeIndex++;
			return show( route.value, routeIndex );
		}
	};

	return next();
}


function showCurrent() {
	show( hashValue() );
}
