hasher
====================

> A tiny hashchange router inspired by express.js & page.js

* hasher is a tiny hashchange router for local web applications.  
  Most web applications now use "pushstate" for its routing function.  
  "hashchange" is legacy solusion, but it is still useful for the application without server 
  (for example: local node-webkit applications).

## Usage
```javascript
var hasher = require( 'hasher' );

// BASEPATH
hasher( '/', index );

// BASEPATH/#/user/...
hasher( '/user/:id', load, show );
hasher( '/user/:id/edit', load, edit );
hasher( '/user/:id/delete', delete );

// BASEPATH/#/blog/20140315/... 
hasher( '/blog/:date/:page?', show_blog );
hasher( '/blog/:date/edit', edit_blog );

hasher( '*', notfound );

hasher(); //start listening for hashchange event
```

## API
 * **hasher( routing, callback, [callback...] )**  
   set routes.
 * **hasher()**  
   start listening for hashchange event.

## Based on
 * [page.js](https://github.com/visionmedia/page.js) by TJ Holowaychuk.
