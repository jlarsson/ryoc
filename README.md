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
    .method([name],[Function])
    .property([name],[initial value = undefined],[readonly = false])
    .getter([name],[Function])
    .setter([name],[Function])
    .toClass();

var instance = new klass([constructor arguments]);
var other = klass([constructor arguments]);
```

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
    // Yet another method
    .method('dump', function () { console.log('%s (%j), area is %s', this.geometry, this, this.area) })
    // Construct a new class
    .toClass();
                                        
// A circular shape
var Circle = ryoc()
    // By inheriting, Circle is everything that Shape is
    .inherit(Shape)
    // new takes a radius parameter to create valid circle
    .construct(function (radius) {
        // always nice to initialize base class
        Shape.call(this);
        this.geometry = 'circle'; 
        this.radius = radius; 
    })
    // calculateArea is an abstract/template method in Shape. Give it a proper meaning.
    .method('calculateArea', function () { return Math.PI * this.radius * this.radius; })
    .toClass();

// Rectangular shapes
var Rectangle = ryoc()
    // By inheriting, Circle is everything that Shape is
    .inherit(Shape)
    // new takes width and hight parameters to create a valid rectangle
   .construct(function (width, height) {
        // Consrtuct base class
        Shape.call(this);
        this.geometry = 'rectangle'; 
        this.w = width; 
        this.h = height; 
    })
    // Give area calculations meaning
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
- constructors in base classes are not automatically applied - this will be your responsibility
- introduce alien and weird meta stuff like _$super_. The only things in generated classes are what you explicitly put there.
