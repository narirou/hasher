hasher
======

> A tiny hashchange router inspired by express.js & page.js

[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![MIT Licensed][license-image]][license-url]

[travis-image]: https://img.shields.io/travis/narirou/hasher.svg?style=flat-square
[travis-url]: https://travis-ci.org/narirou/hasher
[coveralls-image]: https://img.shields.io/coveralls/narirou/hasher.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/narirou/hasher?branch=master
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license-url]: http://opensource.org/licenses/MIT


hasher is a tiny hashchange router.  
Most web applications now use "pushState" for its routing function.  
"hashchange" is legacy solution, but it is still useful for the application without server
(for example: local node-webkit applications).


Usage
-----

```javascript
import hasher from 'hasher';

hasher('/', index);

hasher('/user/:id', load, show);
hasher('/user/:id/edit', load, edit);
hasher('/user/:id/delete', del);

hasher('*', notfound);

// Begin monitoring hashchange events
hasher();
```


API
---

#### hasher( route, callback[, callback...] ) / hasher.set(...)  
- route {String}
- callback {Function}  

Set routes and callbacks.  
Each callback is invoked `params` object and `next` function.

```javascript
function load(params, next) {
    params.num;     //-> '001'
    params.article; //-> 'first-post'
    next();         // run `edit` callback
}

function edit() {
    console.log('it called after `load` function.');
}

hasher('/blog/:num/:article/edit', load, edit);

hasher.redirect('/blog/001/first-post/edit');
```


#### hasher( route ) / hahser.redirect(...)
- route {String}

Redirect hashchange route.


#### hasher() / hasher.start()  
Begin monitoring hashchange events.


#### hasher.stop()
Stop monitoring hashchange events.


#### hasher.reset()
Stop monitoring hashchange events and clear all options.


Based on
--------

* [page.js](https://github.com/visionmedia/page.js) by TJ Holowaychuk.
