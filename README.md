hasher
====================

> A tiny hashchange router inspired by express.js & page.js

* hasher is a tiny hashchange rounter for local web applications.  
  Most web applications now use "pushstate" for create its router.  
  "hashchange" is legacy solusion, but it is still useful for the application without server 
  (for example: local node-webkit applications).

## Usage
```javascript
var hasher = require( 'hasher' );

hasher( '/', index );

// http://localhost/#/user/...
hasher( '/user/:id', load, show );
hasher( '/user/:id/edit', load, edit );
hasher( '/user/:id/delete', delete );

// http://localhost/#/blog/20140315/... 
hasher( '/blog/:date/:page?', show_blog );
hasher( '/blog/:date/edit', edit_blog );

hasher( '*', notfound );

hasher(); //start listening for hashchange event
```

## API
 * **hasher( routing, callback, [callback...] )**  
   set router functions.
 * **hasher()**  
   start listening for hashchange event.

## Based on
 * [path-to-regexp](https://github.com/component/path-to-regexp) by TJ Holowaychuk.
 * [page.js](https://github.com/visionmedia/page.js) by TJ Holowaychuk.
