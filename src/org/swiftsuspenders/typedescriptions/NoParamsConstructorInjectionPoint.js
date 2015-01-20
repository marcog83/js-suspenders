define(function (require, exports, module) {
    'use strict';
    var _ = require("lodash");
    var ConstructorInjectionPoint = require("./ConstructorInjectionPoint");

    function NoParamsConstructorInjectionPoint() {
        ConstructorInjectionPoint.call(this,[]);
    }

    NoParamsConstructorInjectionPoint.prototype = _.create(ConstructorInjectionPoint.prototype, {
        constructor:NoParamsConstructorInjectionPoint,
        createInstance: function (type, injector) {
            if (_.isArray(type)) {
                type = _.last(type);
            }
            return new type();
        }
    });
    module.exports = NoParamsConstructorInjectionPoint;
});