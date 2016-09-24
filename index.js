import pathToRegexp from 'path-to-regexp';

const defaultOptions = {
    sensitive: false,
    strict: false,
    end: true,
};

let running = false;

export default function hasher(path, ...args) {
    if (!path) {
        return hasher.start();
    }

    const callbacks = args.filter(isFunction);

    if (typeof path === 'function') {
        return hasher.set('(.*)', path);
    }

    if (typeof path === 'string') {
        if (callbacks.length) {
            return hasher.set(path, callbacks);
        }
        return hasher.redirect(path);
    }

    throw new Error('Invalid arguments.');
}

hasher.routes = [];
hasher.running = () => running;
hasher.current = '';
hasher.options = Object.assign({}, defaultOptions);

hasher.start = function start(silent) {
    if (running) {
        return hasher;
    }

    running = true;
    window.addEventListener('hashchange', updateCurrentHash, false);

    if (!silent) {
        updateCurrentHash();
    }

    return hasher;
};

hasher.stop = function stop() {
    running = false;
    window.removeEventListener('hashchange', updateCurrentHash, false);

    return hasher;
};

hasher.set = function set(path, ...args) {
    let callbacks = [];
    if (typeof args[0] === 'object' && args.length === 1) {
        callbacks = args[0];
    } else {
        callbacks = args.filter(isFunction);
    }

    // set callbacks
    const route = new Route(path, callbacks, hasher.options);

    // set routes
    if (route.callbacks.length) {
        hasher.routes.push(route);
    }

    return hasher;
};

hasher.redirect = function redirect(hash) {
    if (!hash) {
        return hasher;
    }

    window.location.hash = '#' + hash;

    if (!running) {
        updateCurrentHash();
        return hasher;
    }

    return hasher;
};

hasher.reset = function rest() {
    hasher.stop();
    hasher.routes = [];
    hasher.current = '';
    hasher.options = Object.assign({}, defaultOptions);
};

const isFunction = function isFunction(fn) {
    return typeof fn === 'function';
};

function Route(path, callbacks, options) {
    this.path = (path === '*') ? '(.*)' : path;
    this.value = '';
    this.callbacks = callbacks;
    this.keys = [];
    this.regexp = pathToRegexp(this.path, this.keys, options);
}

function show(hash, routeIndex) {
    for (let i = routeIndex || 0, len = hasher.routes.length; i < len; i += 1) {
        const route = hasher.routes[i];
        const matches = route.regexp.exec(decodeURIComponent(hash));

        if (!matches) {
            continue;
        }

        // set params
        const keys = route.keys;
        const params = {};
        if (keys.length) {
            for (let j = 1, pLen = matches.length; j < pLen; j += 1) {
                params[keys[j - 1].name] = matches[j];
            }
        }

        // set current hash
        route.value = hash;

        // run callbacks
        runCallback(route, params, i);
        return;
    }
}

function runCallback(route, params, routeIndex) {
    let i = 0;

    const next = function next() {
        const callback = route.callbacks[i];

        // next callback
        if (callback) {
            i += 1;
            return callback(params, next);
        }

        // next route
        routeIndex += 1;
        return show(route.value, routeIndex);
    };

    return next();
}

function updateCurrentHash() {
    hasher.current = window.location.hash.replace('#', '') || '/';
    show(hasher.current);
}
