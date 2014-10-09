var ryoc = require('../'),
    assert = require('assert'),
    EventEmitter = require('events').EventEmitter;


describe("EventEmitter", function () {
    it("can be inherited for the win!", function () {

        var klass = ryoc()
            .inherit(EventEmitter)
            .construct(EventEmitter) // convenient way to ensure base constructor is called
            .method('foo', function () {
                this.emit('bar', 'baz');
            })
            .toClass();

        var emittedBaz = null;
        new klass()
            .on('bar', function (baz) {
                emittedBaz = baz;
            })
            .foo();
        assert.equal(emittedBaz, 'baz');
    });
});