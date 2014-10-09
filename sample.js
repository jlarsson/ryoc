var classbuilder = require('./');


var Shape = classbuilder()
    .property('geometry', '[generic shape]')
    .getter('area', function () { return this.calculateArea(); })
    .method('calculateArea', function () { throw new Error('method calculateArea is not implemented');})
    .method('dump', function () { console.log('%s (%j), area is %s', this.geometry, this, this.area) })
    .toClass();

var Circle = classbuilder()
    .inherit(Shape)
    .construct(function (radius) {
        Shape.call(this);
        this.geometry = 'circle'; 
        this.radius = radius; 
    })
    .method('calculateArea', function () { return Math.PI * this.radius * this.radius; })
    .toClass();

var Rectangle = classbuilder()
    .inherit(Shape)
    .construct(function (width, height) {
        Shape.call(this);
        this.geometry = 'rectangle'; 
        this.w = width; 
        this.h = height; 
    })
    .method('calculateArea', function () { return this.w * this.h; })
    .toClass();

var Square = classbuilder()
    .inherit(Rectangle)
    .property('geometry', 'square', true) // we define the property once again, but as readonly so baseclass can't alter its value
    .construct(function (width) {
        Rectangle.call(this, width, width);
    })
    .toClass();

new Circle(1).dump();
new Rectangle(2,3).dump();
new Square(5).dump();
