( function() {

	'use strict';

	function hasher( path, fn ) {
		if( ! arguments.length ) {
			hasher.start();
		}
		else if( typeof fn === 'function' ) {
			hasher.set( path, arguments );
		}
		else if( typeof path === 'string' ) {
			hasher.show( path, fn );
		}
	}

	hasher.routes = [];

	hasher.running = false;

	hasher.value = function() {
		var hash = window.location.hash;

		if( hash ) {
			return hash.replace( '#', '' );
		}
		else {
			return '/';
		}
	};

	hasher.set = function( path, args ) {
		var route = new Route( path );

		for( var i = 1, len = args.length; i < len; i++ ) {
			var callback = args[i];

			if( typeof callback === 'function' ) {
				route.callbacks.push( callback );
			}
		}
		hasher.routes.push( route );
	};

	hasher.show = function( value ) {
		for( var i = 0, len = hasher.routes.length; i < len; i++ ) {
			var route   = hasher.routes[i],
				keys    = route.keys,
				matches = route.regexp.exec( value ),
				args    = {};

			if( matches ) {
				if( keys.length ) {
					for( var j = 1, k = matches.length; j < k; j++ ) {
						args[ keys[ j - 1 ].name ] = matches[j];
					}
				}
				exec( route, args );
				return true;
			}
		}
		return false;
	};

	hasher.start = function() {
		if( hasher.running ) return;

		hasher.running = true;

		window.addEventListener( 'hashchange', onchange, false );

		hasher.show( hasher.value() );
	};

	hasher.stop = function() {
		if( ! hasher.running ) return;

		hasher.running = false;

		window.removeEventListener( 'hashchange', onchange, false );
	};

	function onchange() {
		hasher.show( hasher.value() );
	}

	function exec( route, args ) {
		var i = 0;
		var next = function() {
			var fn = route.callbacks[ i++ ];
			if( fn ) {
				fn( args, next );
				return;
			}
		};
		next();
	}

	// Route
	function Route( path ) {
		this.path = path;
		this.callbacks = [];
		this.keys = [];
		this.regexp = pathtoRegexp( path, this.keys );
	}

	// https://github.com/component/path-to-regexp
	function pathtoRegexp( path, keys, sensitive, strict ) {
		if( path instanceof RegExp ) return path;
		if( path instanceof Array ) path = '(' + path.join('|') + ')';
		path = path
			.concat( strict ? '' : '/?' )
			.replace( /\/\(/g, '(?:/' )
			.replace( /(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function( _, slash, format, key, capture, optional ){
				keys.push({ name: key, optional: !! optional });
				slash = slash || '';
				return ''
					+ ( optional ? '' : slash )
					+ '(?:'
					+ ( optional ? slash : '')
					+ ( format || '') + ( capture || (format && '([^/.]+?)' || '([^/]+?)') ) + ')'
					+ ( optional || '' );
			})
			.replace( /([\/.])/g, '\\$1' )
			.replace( /\*/g, '(.*)' );
		return new RegExp( '^' + path + '$', sensitive ? '' : 'i' );
	}

	// Start Hasher
	if( typeof module === 'object' && module.exports ) {
		module.exports = hasher;
	}
	else if( typeof define === 'function' && define.amd ) {
		define( 'hasher', [], function() {
			return hasher;
		});
	}
	else {
		window.hasher = hasher;
	}

})();
