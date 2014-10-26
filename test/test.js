var ryoc = require('../'),
    assert = require('assert');

'use strict';

describe('ryoc class instantiation', function () {
    it('toClass returns a function', function () {
        assert(ryoc().toClass instanceof Function);
    });

    it('classes can be constructed with new operator', function () {
        var instance = new(ryoc()
            .getter('a', function () {
                return 'value of a';
            })
            .toClass());
        assert(instance);
        assert.equal(instance.a, 'value of a');
    });

    it('classes can be constructed with function application', function () {
        var instance = (ryoc()
            .getter('a', function () {
                return 'value of a';
            })
            .toClass())();
        assert(instance);
        assert.equal(instance.a, 'value of a');
    });
});

describe('ryoc classes', function () {
    it('classes can have single inheritance', function () {
        var instance = new(ryoc()
            .inherit({
                getValueOfA: function () {
                    return 'value of a';
                }
            })
            .getter('a', function () {
                return this.getValueOfA();
            })
            .toClass());
        assert(instance);
        assert.equal(instance.a, 'value of a');
    });

    it('classes are instances of their inheritance chain', function () {
        var classA = ryoc().toClass();
        var classB = ryoc().inherit(classA).toClass();
        var classC = ryoc().inherit(classB).toClass();

        var instance = classC();
        assert(instance instanceof classA);
        assert(instance instanceof classB);
        assert(instance instanceof classC);
    });

    it('does NOT call inherited constructors', function () {
        var baseClass = ryoc()
            .construct(function () {
                this.baseCtorCalled = true;
            })
            .toClass();
        var inheritedClass = ryoc()
            .inherit(baseClass)
            .construct(function () {
                this.inheritedCtorCalled = true;
            })
            .toClass();

        var instance = new inheritedClass();
        assert(instance);
        assert(!instance.baseCtorCalled);
        assert(instance.inheritedCtorCalled);
    });

    it('recipe for calling inherited constructor', function () {
        var baseClass = ryoc()
            .construct(function () {
                this.baseCtorCalled = true;
            })
            .toClass();
        var inheritedClass = ryoc()
            .inherit(baseClass)
            .construct(function () {
                baseClass.call(this);
                this.inheritedCtorCalled = true;
            })
            .toClass();

        var instance = new inheritedClass(1, 2, 3);
        assert(instance);
        assert(instance.baseCtorCalled);
        assert(instance.inheritedCtorCalled);
    });

});

describe('ryoc constructors', function () {
    it('are called when using new', function () {
        var instance = new(ryoc()
            .construct(function (a, b, c) {
                this.constructorCalled = true;
                assert(a, 1);
                assert(b, 2);
                assert(c, 3);
            })
            .getter('a', function () {
                return this.getValueOfA();
            })
            .toClass())(1, 2, 3);
        assert(instance.constructorCalled);
    });
    it('are called when not using new', function () {
        var instance = (ryoc()
            .construct(function (a, b, c) {
                this.constructorCalled = true;
                assert(a, 1);
                assert(b, 2);
                assert(c, 3);
            })
            .getter('a', function () {
                return this.getValueOfA();
            })
            .toClass())(1, 2, 3);
        assert(instance.constructorCalled);
    });
});

describe("ryoc", function () {
    // detect names in native objects
    var builtinNames = {};
    for (var m in new Function()) {
        builtinNames[m] = true;
    }

    it("does not introduce new or hidden members", function () {
        // Construct a class
        var klass = ryoc()
            .construct(function (a, b, c) {})
            .method('foo', function (a, b, c) {})
            .getter('bar', function () {})
            .setter('baz', function () {})
            .toClass();

        // Expected names in defined class
        var expectedNames = {
            foo: true,
            bar: true,
            baz: true
        };

        for (var name in new klass()) {
            assert(builtinNames[name] || expectedNames[name], name + ' was an unexpted name');
        }
    });

});

describe('ryoc().mixin()', function () {
    function testMixin(klass) {
        var instance = klass();
        assert(instance);
        assert(instance.bar, 'baz');
        assert(instance.foo);
        assert(instance.foo(), 'baz');

        instance.bar = 'buzz';
        assert(instance.foo(), 'buzz');
    }

    it('mixes in simple object', function () {
        testMixin(ryoc()
            .mixin({
                bar: 'baz',
                foo: function () {
                    return this.bar;
                }
            })
            .toClass());
    });
    it('mixes in array of objects', function () {
        testMixin(ryoc()
            .mixin([
                {
                    bar: 'baz'
                },
                {
                    foo: function () {
                        return this.bar;
                    }
                }
                           ])
            .toClass());
    });
    it('mixes in variable number of objects', function () {
        testMixin(ryoc()
            .mixin({
                bar: 'baz'
            }, {
                foo: function () {
                    return this.bar;
                }
            })
            .toClass());
    });
    it('accumulates mixins', function () {
        testMixin(ryoc()
            .mixin({
                bar: 'baz'
            })
            .mixin({
                foo: function () {
                    return this.bar;
                }
            })
            .toClass());
    });

    it('silently ignores non-object mixins', function () {
        testMixin(ryoc()
            .mixin({
                bar: 'baz'
            })
            .mixin({
                foo: function () {
                    return this.bar;
                }
            })
            .mixin(1, function () {}, null)
            .toClass());
    });
});

describe('ryoc().method(name,m)', function () {
    it('throws TypeError when name is not a string', function () {
        assert.throws(function () {
            ryoc().method();
        }, TypeError);
        assert.throws(function () {
            ryoc().method(123);
        }, TypeError);
        assert.throws(function () {
            ryoc().method({});
        }, TypeError);
    });
    it('throws TypeError when m is not a function', function () {
        assert.throws(function () {
            ryoc().method('foo');
        }, TypeError);
        assert.throws(function () {
            ryoc().method('foo', 123);
        }, TypeError);
        assert.throws(function () {
            ryoc().method('foo', {});
        }, TypeError);
    });
    it('respects this', function () {
        var instance = new(ryoc()
            .method('setVal', function (val) {
                this.value = val
            })
            .toClass());

        assert(instance);
        instance.setVal('a test value');
        assert.equal(instance.value, 'a test value');
    });
    it('overwrites existing with same name', function () {
        var instance = new(ryoc()
            .method('setVal', function (val) {
                throw Error('this one should be overwritten');
            })
            .method('setVal', function (val) {
                this.value = val
            })
            .toClass());

        assert(instance);
        instance.setVal('a test value');
        assert.equal(instance.value, 'a test value');
    });
});

describe('ryoc.abstract(name)', function () {
    it('declares a method with the given name', function () {
        var instance = new(ryoc()
            .abstract('foo')
            .toClass());
        assert(instance);
        assert(instance.foo);
        assert(instance.foo instanceof Function);
    });
    it('which will throw when called', function () {
        var instance = new(ryoc()
            .abstract('foo')
            .toClass());
        assert.throws(function () {
            instance.foo();
        }, TypeError);
    });
});

describe('ryoc.property(name,value,writable)', function () {
    it("defines a property", function () {
        var instance = new(ryoc()
            .property('a', 'base value of a')
            .toClass());
        assert(instance);
        assert.equal(instance.a, 'base value of a');
    });
    it("which can be readonly", function () {
        var instance = new(ryoc()
            .property('a', 'base value of a', true)
            .toClass());
        assert(instance);
        assert.equal(instance.a, 'base value of a');
        instance.a = 'some new value that will be ignored';
        assert.equal(instance.a, 'base value of a');
    });
    it("defines a property with initial value for each new instance", function () {
        var klass = ryoc()
            .property('foo', 'base value')
            .toClass();

        var a = new klass;
        assert(a);
        // modify value in instance
        a.foo = 'overwritten';
        assert.equal(a.foo, 'overwritten');

        // create new instance
        var b = new klass;
        assert.equal(b.foo, 'base value');
    });

});

describe('ryoc.getter(name,m)', function () {
    it('throws TypeError when name is not a string', function () {
        assert.throws(function () {
            ryoc().getter();
        }, TypeError);
        assert.throws(function () {
            ryoc().getter(123);
        }, TypeError);
        assert.throws(function () {
            ryoc().getter({});
        }, TypeError);
    });
    it('throws TypeError when m is not a function', function () {
        assert.throws(function () {
            ryoc().getter('foo');
        }, TypeError);
        assert.throws(function () {
            ryoc().getter('foo', 123);
        }, TypeError);
        assert.throws(function () {
            ryoc().getter('foo', {});
        }, TypeError);
    });
    it('respects this', function () {
        var instance = new(ryoc()
            .getter('val', function (val) {
                return this.value;
            })
            .toClass());

        assert(instance);
        instance.value = 'a test value';
        assert.equal(instance.val, 'a test value');
    });
    it('overwrites existing with same name', function () {
        var instance = new(ryoc()
            .getter('a', function (val) {
                return 'will be overwritten';
            })
            .getter('a', function (val) {
                return 'latest value';
            })
            .toClass());

        assert(instance);
        assert.equal(instance.a, 'latest value');
    });
    it('can be multiple with different property names', function () {
        var instance = new(ryoc()
            .getter('a', function (val) {
                return 'a value';
            })
            .getter('b', function (val) {
                return 'b value';
            })
            .toClass());

        assert(instance);
        assert.equal(instance.a, 'a value');
        assert.equal(instance.b, 'b value');
    });
    it('can be defined in superclass', function () {
        var baseClass = ryoc()
            .getter('foo', function () {
                return this.bar;
            })
            .toClass();
        var subClass = ryoc()
            .inherit(baseClass)
            .toClass();
        var instance = subClass();
        instance.bar = 'baz';
        assert.equal(instance.foo,'baz');
    });
});

describe('ryoc.setter(name,m)', function () {
    it('throws TypeError when name is not a string', function () {
        assert.throws(function () {
            ryoc().setter();
        }, TypeError);
        assert.throws(function () {
            ryoc().setter(123);
        }, TypeError);
        assert.throws(function () {
            ryoc().setter({});
        }, TypeError);
    });
    it('throws TypeError when m is not a function', function () {
        assert.throws(function () {
            ryoc().setter('foo');
        }, TypeError);
        assert.throws(function () {
            ryoc().setter('foo', 123);
        }, TypeError);
        assert.throws(function () {
            ryoc().setter('foo', {});
        }, TypeError);
    });
    it('respects this', function () {
        var instance = new(ryoc()
            .setter('value', function (val) {
                this.value_stored = val;
            })
            .toClass());

        assert(instance);
        instance.value = 'a test value';
        assert.equal(instance.value_stored, 'a test value');
    });
    it('overwrites existing with same name', function () {
        var instance = new(ryoc()
            .setter('a', function (val) {
                assert.fail();
            })
            .setter('a', function (val) {
                this.stored_a = val;
            })
            .toClass());

        assert(instance);
        instance.a = 'some value';
        assert.equal(instance.stored_a, 'some value');
    });
    it('can be multiple with different property names', function () {
        var instance = new(ryoc()
            .setter('a', function (val) {
                this.stored_a = val;
            })
            .setter('b', function (val) {
                this.stored_b = val;
            })
            .toClass());

        assert(instance);
        instance.a = 'a value';
        instance.b = 'b value';
        assert.equal(instance.stored_a, 'a value');
        assert.equal(instance.stored_b, 'b value');
    });

});