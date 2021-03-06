(function(exports) {
  'use strict';

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = exports;
  } else {
    if (typeof define === 'function' && define.amd) {
      define([], function() {
        return exports;
      });
    } else {
      window.ryoc = exports;
    }
  }
})(
  (function() {
    function throwIt(message) {
      throw new TypeError(message);
    }

    function assertName(n) {
      return (n && (typeof(n) === typeof(''))) ? n : throwIt('Expected a string');
    }

    function assertFunction(fn) {
      return (fn && (fn instanceof Function)) ? fn : throwIt('Expected a function');
    }

    function assertObject(obj) {
      return (obj && (obj instanceof Object)) ? obj : throwIt('Expected an object');
    }

    var superDuperSecretMarker = {
      whoIsCalling: 'ryoc'
    };

    var Ryoc = function() {
      this.inherits = null;
      this.constructor = null;
      this.mixins = [];
      this.methods = {};
      this.properties = {};
    };
    var proto = Ryoc.prototype;
    proto.inherit = function(klass) {
      this.inherits = assertObject(klass);
      return this;
    };
    proto.construct = function(constructor) {
      this.constructor = assertFunction(constructor);
      return this;
    };
    proto.mixin = function() {
      for (var i = 0; i < arguments.length; ++i) {
        var mixin = arguments[i];
        if (mixin instanceof Array) {
          for (var j = 0; j < mixin.length; ++j) {
            this.mixin(mixin[j]);
          }
        } else if (mixin instanceof Object) {
          this.mixins.push(mixin);
        }
      }
      return this;
    };
    proto.method = function(name, method) {
      this.methods[assertName(name)] = assertFunction(method);
      return this;
    };
    proto.abstract = function(name) {
      return this.method(name, function() {
        throw new TypeError('[' + name + '] is abstract and must be overriden');
      });
    };
    proto.property = function(name, value, readonly) {
      name = assertName(name);
      this.properties[name] = {
        enumerable: true,
        configurable: true,
        writable: readonly == undefined ? true : !readonly,
        value: value
      };
      return this;
    };
    proto.getter = function(name, getter) {
      name = assertName(name);
      getter = assertFunction(getter);
      (this.properties[name] || (this.properties[name] = {
        enumerable: true,
        configurable: true
      })).get = getter;
      return this;
    };
    proto.setter = function(name, setter) {
      name = assertName(name);
      setter = assertFunction(setter);
      (this.properties[name] || (this.properties[name] = {
        enumerable: true,
        configurable: true
      })).set = setter;
      return this;
    };
    proto.toClass = function() {
      var self = this;
      var Klass = function() {
        if (!(this instanceof Klass)) {
          return new Klass(superDuperSecretMarker, arguments);
        }
        if (self.constructor) {
          var args = (arguments.length === 2) && (arguments[0] === superDuperSecretMarker) ? arguments[1] : arguments;
          self.constructor.apply(this, Array.prototype.slice.call(args, 0));
        }
      };

      var proto = Klass.prototype;
      if (this.inherits) {
        proto = Object.create(this.inherits instanceof Function ? this.inherits.prototype : this.inherits, {
          constructor: {
            value: Klass,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
        Klass.prototype = proto;
      }
      for (var i = 0; i < this.mixins.length; ++i) {
        var mixin = this.mixins[i];
        var memberNames = Object.getOwnPropertyNames(mixin);
        for (var j = 0; j < memberNames.length; ++j) {
          var name = memberNames[j];
          proto[name] = mixin[name];
        }
      }
      var methodNames = Object.getOwnPropertyNames(this.methods);
      for (var i = 0; i < methodNames.length; ++i) {
        var name = methodNames[i];
        var method = this.methods[name];
        proto[name] = method;
      }
      var propertyNames = Object.getOwnPropertyNames(this.properties);
      for (var i = 0; i < propertyNames.length; ++i) {
        var name = propertyNames[i];
        var property = this.properties[name];
        Object.defineProperty(proto, name, property);
      }
      return Klass;
    };
    return function() {
      return new Ryoc();
    }
  })()
);
