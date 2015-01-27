require.config({
    paths: {
        lodash: "../bower_components/lodash/lodash"
    }
});
require([
    //"../src/js-suspenders/Injector",
    "../dist/js-suspenders",
    "./Sprite",
    "./SpriteNoArray"
], function (jss, Sprite, SpriteNoArray) {
    function Dep() {
        console.log("initialize");
    }

    function ThirdType(value) {
        console.log("ThirdType");
        this.value = value;
    }
var injector=jss.Injector;

    var dep = injector.map(Dep).asSingleton(true);
    injector.map([
        "Dep",
        "SecondDep",
        Sprite
    ], 'Sprite');
    injector.map(SpriteNoArray, 'SpriteNoArray');
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
    toValue.init();
    injector.unmap('Sprite');
    injector.unmap('SecondDep');
    injector.unmap('Value');
    injector.unmap('Dep');
    injector.unmap('SpriteNoArray');
    //injector.unmap('Sprite');
    console.log(injector);

    var s = injector.getOrCreateNewInstance(Dep, 'Dep')
});