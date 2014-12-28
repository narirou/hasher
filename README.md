hasher
======

> A tiny hashchange router inspired by express.js & page.js

[![Build Status](http://img.shields.io/travis/narirou/hasher/master.svg?style=flat-square)](https://travis-ci.org/narirou/hasher)

hasher is a tiny hashchange router.  
Most web applications now use "pushState" for its routing function.  
"hashchange" is legacy solusion, but it is still useful for the application without server 
(for example: local node-webkit applications).


Usage
-----

```javascript
var hasher = require( 'hasher' );

hasher( '/', index );

hasher( '/user/:id', load, show );
hasher( '/user/:id/edit', load, edit );
hasher( '/user/:id/delete', del );

hasher( '*', notfound );

// Start listening to hashchange event.
hasher();
```


API
---

#### hasher( route, callback[, callback...] ) / hasher.set(...)  
- route {String}
- callback {Function}  

Set routes and callbacks.  
A callback recieved `params` object and `next` function.

```javascript
function load( params, next ) {
    params.num;     //-> '001'
    params.article; //-> 'first-post'
    next();         // run `edit` callback
}

function edit() {
    console.log( 'it called after `load` function.' );
}

hasher( '/blog/:num/:article/edit', load, edit );

hasher.redirect( '/blog/001/first-post/edit' );
```


#### hasher( route ) / hahser.redirect(...)
- route {String}

Redirect hashchange route.


#### hasher() / hasher.start()  
Start listening for hashchange event.


#### hasher.stop()
Stop listening for hashchange event.


#### hasher.reset()
Stop listening for hashchange event and clear all options.


Based on
--------

 * [page.js](https://github.com/visionmedia/page.js) by TJ Holowaychuk.
