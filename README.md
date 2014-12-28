hasher
======

> A tiny hashchange router inspired by express.js & page.js

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

 * **hasher( route{string}, callback[, callback...] )**  
   set routes.  
   callback recieved `context` object and `next` function.

 * **hasher( route{string} )**
   redirect route.

 * **hasher()** / **hasher.start**  
   start listening for hashchange event.

 * **hasher.stop**


Based on
--------

 * [page.js](https://github.com/visionmedia/page.js) by TJ Holowaychuk.
