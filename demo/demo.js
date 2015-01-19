require({
    paths: {
        lodash: "./lodash"
    }
}, ["../src/org/swiftsuspenders/Injector", "./Sprite", "./Loader", "./SpriteNoArray"], function (Injector, Sprite, Loader, SpriteNoArray) {

    function Dep() {
        console.log("initialize");
    }


    function ThirdType() {
        console.log("ThirdType");
    }


    var injector = new Injector();
    var loader = new Loader(injector);
    injector.map(Dep).asSingleton();
    injector.map(["Dep", "SecondDep", Sprite]);
    injector.map(SpriteNoArray,'SpriteNoArray');

    injector.map('Value').toValue({
        init: function () {
            console.log("toValue", this);
        }
    });

    injector.map('SecondDep').toType(ThirdType);
    //injector.map(SecondDep).toType(ThirdType);

    //var sprite = injector.getInstance(["Dep", "SecondDep", Sprite]);
    var sprite = loader.load();//injector.getInstance(Sprite);
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