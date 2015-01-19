define(function (require, exports, module) {
    'use strict';
    var _ = require("lodash");
    var OrderedInjectionPoint = require("./OrderedInjectionPoint");

    function PreDestroyInjectionPoint(methodName, parameters, requiredParameters, order){
        OrderedInjectionPoint.call(this,methodName, parameters, requiredParameters, order);
    }
    PreDestroyInjectionPoint.prototype=_.create(OrderedInjectionPoint.prototype, {
        constructor: PreDestroyInjectionPoint
    });
    module.exports = PreDestroyInjectionPoint ;
});