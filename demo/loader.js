define(function (require, exports, module) {
    'use strict';
    var j = require("./Sprite");

    function Loader(injector) {
        this.injector = injector;

    }

    Loader.prototype = {
        load: function () {
            return this.injector.getInstance('Sprite');
        }
    };
    module.exports = Loader;
});