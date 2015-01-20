require({
    paths: {
        lodash: "./lodash"
    }
}, ["../src/org/swiftsuspenders/Injector", "./Sprite",  "./SpriteNoArray"], function (Injector, Sprite, SpriteNoArray) {

    function Dep() {
        console.log("initialize");
    }


    function ThirdType(value) {
        console.log("ThirdType");
        this.value=value;
    }


    var injector = new Injector();

    injector.map(Dep).asSingleton();

    injector.map(["Dep", "SecondDep", Sprite],'Sprite');

    injector.map(SpriteNoArray,'SpriteNoArray');

    injector.map('Value').toValue({
        init: function () {
            console.log("toValue", this);
        }
    });

    injector.map('SecondDep').toType(ThirdType);


    var sprite = injector.getInstance('Sprite');
    var sprite2 = injector.getInstance(SpriteNoArray);

    var d = injector.getInstance(Dep);
    var secondDep = injector.getInstance('SecondDep');
    var toValue = injector.getInstance('Value');
    /* */
    sprite.initialize();
    sprite2.initialize();

    console.log("sprite.dep == d", sprite.dep == d);
    console.log('sprite.secondDep == secondDep', sprite.secondDep == secondDep);
    console.log('sprite.secondDep.value == secondDep.value', sprite.secondDep.value == secondDep.value);
    console.log(secondDep);
    toValue.init()
});