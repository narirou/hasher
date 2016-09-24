import test from 'ava';
import browser from './helpers/browser';
import hasher from '../';

test.beforeEach(() => {
    hasher.reset();
    browser();
});

test('should set route', (t) => {
    const fn = function callback() {};
    hasher.set('/', fn);
    t.is(hasher.routes[0].path, '/');
    t.is(hasher.routes[0].callbacks[0], fn);
});

test.cb('should run at start page', (t) => {
    hasher('/', () => {
        t.end();
    });
    hasher();
});

test.cb('should run at specific page', (t) => {
    hasher('/page', () => {
        t.is(hasher.current, '/page');
        t.is(global.window.location.hash, '#/page');
        t.end();
    });
    hasher('/page');
});

test.cb('should call second callback', (t) => {
    hasher('/', (params, next) => {
        next();
    }, () => {
        t.end();
    });
    hasher('/');
});

test.cb('should call third callback', (t) => {
    hasher('/', (params, next) => {
        next();
    }, (params, next) => {
        next();
    }, () => {
        t.end();
    });
    hasher('/');
});

test.cb('should redirect when hashchange event fired', (t) => {
    hasher('/page', () => {
        t.is(hasher.current, '/page');
        t.end();
    });
    hasher();
    global.window.location.hash = '#/page';
});

test.cb('should redirect after start function', (t) => {
    hasher('/page2', () => {
        t.is(hasher.current, '/page2');
        t.end();
    });
    hasher.start();
    hasher.redirect('/page2');
});

test.cb('should get params', (t) => {
    hasher('/page/:num/:operation', (params) => {
        t.is(params.num, '123');
        t.is(params.operation, 'edit');
        t.end();
    });
    hasher('/page/123/edit');
});

test.cb('should run next-matched route', (t) => {
    hasher('/page/:all(.*)', (params, next) => {
        next();
    });

    hasher('/this-route-wont-be-call', () => {});

    hasher('/page/:num/:operation', (params) => {
        t.is(params.num, '456');
        t.is(params.operation, 'delete');
        t.end();
    });

    hasher('/page/456/delete');
});

test.cb('should run all-matched route', (t) => {
    hasher('*', () => {
        t.end();
    });
    hasher('/all-matched');
});

test.cb('should run all-matched route alias', (t) => {
    hasher(() => {
        t.end();
    });
    hasher('/not-found');
});

test.cb('should set strict options', (t) => {
    let entered = false;

    hasher.options.strict = true;

    hasher('/strict', (params, next) => {
        entered = true;
        next();
    });
    hasher('/strict/', () => {
        t.is(entered, false);
        t.end();
    });
    hasher('/strict/');
});

test.cb('should reset options', (t) => {
    hasher.options.strict = true;

    hasher('/page1/', () => {
        t.is(hasher.options.strict, true);
    });
    hasher('/page1/');

    hasher.reset();

    hasher('/page2', () => {
        t.is(hasher.options.strict, false);
        t.end();
    });
    hasher('/page2/');
});

test.cb('should work with method chaining', (t) => {
    hasher
        .set('*', (params, next) => {
            next();
        })
        .set('/page2', () => {
            t.end();
        })
        .set('/page', () => {
            hasher.redirect('/page2');
        })
        .start()
        .redirect('/page');
});
