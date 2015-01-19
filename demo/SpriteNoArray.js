define(function (require, exports, module) {
    'use strict';
    function e(dep, ISecondDep) {
        this.element = 1;
        this.method = function () {
        };
        this.dep = dep;
        this.secondDep = ISecondDep;
    }

    e.prototype = {
        initialize: function () {
            console.log("NO ARRAY",this.dep);
        }
    };
    module.exports = e;
});