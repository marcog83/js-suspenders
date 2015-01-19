define(function (require, exports, module) {
    'use strict';
    function e(a,b) {
        this.element = 1;
        this.method = function () { };
        this.dep = a;
        this.secondDep = b;
    }

    e.prototype = {
        initialize: function () {
            console.log("Array",this.dep);
        }
    };
    module.exports = e;
});