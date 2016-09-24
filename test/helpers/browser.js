import jsdom from 'jsdom';

export default function generate() {
    global.document = jsdom.jsdom('<!doctype html><html><head></head><body></body></html>');
    global.window = document.defaultView;
}

generate();
