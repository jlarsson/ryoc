[![NPM](https://nodei.co/npm/ryoc.png?mini=true)](https://nodei.co/npm/ryoc/)
[![Build Status](https://travis-ci.org/jlarsson/ryoc.svg?branch=master)](https://travis-ci.org/jlarsson/ryoc)

# ryoc

```$ npm install ryoc```

Simple nonintrusive javascript prototypical inheritance through fluent api.

Works in node. No guarantees for other environments. 

##Quick syntax
```javascript
var klass = require('ryoc')()
    .inherit([Object|Function])
    .construct([Function])
    .mixin([Object|Array of Object, ...])
    .method([name],[Function])
    .abstract([name])
    .property([name],[default value = undefined],[readonly = false])
    .getter([name],[Function])
    .setter([name],[Function])
    .toClass();

var instance = new klass([constructor arguments]);
var other = klass([constructor arguments]);
```

```abstract(name)``` is a convenience method for ```method(name, function (){ throw new TypeError(...```.

Order of application in ```toClass()```:

1. ```mixin()```
1. ```method()```
1. ```property()``` / ```getter()``` / ```setter()``` merged by name
1. ```construct()```

##Annotated sample code

```javascript

var ryoc = require('ryoc');
  
// Define base class for shapes
var Shape = ryoc()
    // Define a propery with a backing field
    .property('geometry', '[generic shape]')
    // Define a readonly property that is evaluated by a function
    .getter('area', function () { return this.calculateArea(); })
    // Define a method. calculateArea in this case mimics an abstract method
    .method('calculateArea', function () { throw new Error('method calculateArea is not implemented');})
    // dump calls 'virtual' functions in descendants
    .method('dump', function () { console.log('%s (%j), area is %s', this.geometry, this, this.area) })
    // Construct a new class
    .toClass();
                                        
// Circular shapes
// - a Circle is a Shape
// - a Circle must be initialized with a radius
// - Circles have a special formula for area 
var Circle = ryoc()
    .inherit(Shape)
    .construct(function (radius) {
        Shape.call(this); // always nice to initialize base class
        this.geometry = 'circle'; 
        this.radius = radius; 
    })
    .method('calculateArea', function () { return Math.PI * this.radius * this.radius; })
    .toClass();

// Rectangular shapes
// - a Rectangel is a Shape
// - a Rectangle must be initialized with width and height
// - Rectangles have a special formula for area 
var Rectangle = ryoc()
    .inherit(Shape)
   .construct(function (width, height) {
        Shape.call(this); // Construct base class
        this.geometry = 'rectangle'; 
        this.w = width; 
        this.h = height; 
    })
    .method('calculateArea', function () { return this.w * this.h; })
    .toClass();

// Create a circle and let it tell something about itself
new Circle(1).dump();
// Create a rectangle and let it tell something about itself
new Rectangle(2,3).dump();

// Create another circle. Notice how we can skip the new keyword
Circle(1).dump();

```

## What ryoc doesnt do
- mimic class semantics from other languages. In fact, the concept of classes in Javascript is quite meaningless.
- constructors in base classes are not automatically applied - this will be your responsibility
- introduce alien and weird meta stuff like _$super_. The only things in generated classes are what you explicitly put there.
