this is a port of famous AS3 library swiftsuspenders.

Although it basically works, at the moment this is just a "porting exercise".
Only constructor injection point is implemented. Code that I could not port is just commented.

##Defining functions to map

It supports mapping by Array, as angularjs-style `["Dep", "SecondDep", Sprite]`

```javascript
// Sprite.js
function Sprite(a,b) {
    this.element = 1;
    this.method = function () { };
    this.dep = a;
    this.secondDep = b;
}
Sprite.prototype = {
    initialize: function () {
        console.log("Array",this.dep);
    }
};
```

or mapping by arguments names (it will break with minification)

```javascript
// SpriteNoArray.js
function SpriteNoArray(dep, secondDep) {
    this.element = 1;
    this.method = function () {
    };
    this.dep = dep;
    this.secondDep = secondDep;
}

SpriteNoArray.prototype = {
    initialize: function () {
        console.log("NO ARRAY",this.dep);
    }
};
```

```javascript
// two different dependencies functions
function Dep() {}
function ThirdType() {}
```

Create an Injector
```javascript
var injector = new Injector();
```

##Mapping

You can map in some different ways

* directly with function name (minification can breaks function names!!!)

```javascript
injector.map(Dep).asSingleton(); // asSingleton() allow you to map a function as a Singleton.
```

* map a function directly with its name, providing a name (string will not break, but dependencies still can)

```javascript
injector.map(SpriteNoArray,'SpriteNoArray');
```
* map dependencies with an array and a name. (supposed to be safest way to map)

```javascript
injector.map(["Dep", "SecondDep", Sprite],"Sprite");
```

* You can map an Object

```javascript
injector.map('Value').toValue({
    init: function () {
        console.log("toValue", this);
    }
});
```

* or you can override a function with another one. Both function must have the same interface

```javascript
injector.map('SecondDep').toType(ThirdType);
```

##Prototype or Singletons

Functions are registered as prototype by default, but you can map them as Singletons.

```javascript
injector.map(Dep).asSingleton(); // asSingleton() allow you to register a function as a Singleton. Only 1 instance will be created.
```
toValue() method can be considered an alternative to map a Singleton.

##Get instances

Finally you can get an instance of mapped functions/Objects.

According the way you mapped each function/Object you can get by name or by type.

```javascript
var sprite = injector.getInstance('Sprite');
var sprite2 = injector.getInstance(SpriteNoArray);
```



