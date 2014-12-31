/* global describe, it, before, beforeEach */

'use strict';

var	jsdom  = require( 'jsdom' ),
	should = require( 'should' ),
	hasher = require( '../' );


function createDom( next ) {
	jsdom.env({
		html: '<!doctype html><html><head></head><body></body></html>',
		done: function( errors, window ) {
			if( errors ) {
				errors.forEach( console.log );
				throw new Error( errors );
			}
			window.console = console;
			global.window = window;
			global.location = window.location;
			global.document = window.document;
			global.history = window.history;
			next();
		}
	});
}


describe( 'hasher', function() {

	before( createDom );

	beforeEach( function() {
		hasher.reset();
	});


	it( 'should run at start page', function( done ) {
		hasher( '/', function() {
			done();
		});
		hasher();
	});


	it( 'should run at specific page', function( done ) {
		hasher( '/page', function() {
			should( hasher.current ).eql( '/page' );
			done();
		});
		hasher( '/page' );
	});


	it( 'should call second callback', function( done ) {
		hasher( '/', function( params, next ) {
			next();
		}, function() {
			done();
		});
		hasher( '/' );
	});


	it( 'should call third callback', function( done ) {
		hasher( '/', function( params, next ) {
			next();
		}, function( params, next ) {
			next();
		}, function() {
			done();
		});
		hasher( '/' );
	});


	it( 'should redirect by hashchange event', function( done ) {
		hasher( '/page', function() {
			should( hasher.current ).eql( '/page' );
			done();
		});
		hasher();
		global.window.location.hash  ='#/page';
	});


	it( 'should get params', function( done ) {
		hasher( '/page/:num/:operation', function( params ) {
			should( params.num ).eql( '123' );
			should( params.operation ).eql( 'edit' );
			done();
		});
		hasher( '/page/123/edit' );
	});


	it( 'should run next-matched route', function( done ) {
		hasher( '/page/:all*', function( params, next ) {
			next();
		});
		hasher( '/page-not-visited', function() {
		});
		hasher( '/page/:num/:operation', function( params ) {
			should( params.num ).eql( '456' );
			should( params.operation ).eql( 'delete' );
			done();
		});
		hasher( '/page/456/delete' );
	});


	it( 'should run all-matched route', function( done ) {
		hasher( '*', function() {
			done();
		});
		hasher( '/all-matched' );
	});


	it( 'should run all-matched route alias', function( done ) {
		hasher( function() {
			done();
		});
		hasher( '/not-found' );
	});
});
