define(function (require, exports, module) {
    'use strict';
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
    module.exports = SpriteNoArray;
});