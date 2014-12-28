/* global describe, it, before, beforeEach, afterEach */

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


	it( 'should run second callback', function( done ) {
		hasher( '/', function( ctx, next ) {
			next();
		}, function() {
			done();
		});
		hasher( '/' );
	});


	it( 'should redirect page', function( done ) {
		hasher( '/page', function() {
			done();
		});
		hasher( '/page' );
	});


	it( 'should redirect page by hashchange event', function( done ) {
		hasher( '/page', function() {
			done();
		});
		hasher();
		global.window.location.hash  ='#/page';
	});


	it( 'should get hash values', function( done ) {
		hasher( '/page/:num/:operation', function( ctx ) {
			should( ctx.num ).eql( '123' );
			should( ctx.operation ).eql( 'edit' );
			done();
		});
		hasher( '/page/123/edit' );
	});


	it( 'should invoke next matching statement', function( done ) {
		hasher( '/page/:all*', function( ctx, next ) {
			next();
		});
		hasher( '/page-not-visited', function() {
		});
		hasher( '/page/:num/:operation', function( ctx ) {
			should( ctx.num ).eql( '456' );
			should( ctx.operation ).eql( 'delete' );
			done();
		});
		hasher( '/page/456/delete' );
	});


	it( 'should invoke not-found statement', function( done ) {
		hasher( function() {
			done();
		});
		hasher( '/not-found' );
	});
});
