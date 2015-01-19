define(function (require, exports, module) {
    'use strict';
    var _ = require("lodash");
    var MethodInjectionPoint = require("./MethodInjectionPoint");

    function OrderedInjectionPoint(methodName, parameters,
                                   requiredParameters, order) {

        MethodInjectionPoint.call(this, methodName, parameters, requiredParameters, false, null)
        this.order = order;
    }

    OrderedInjectionPoint.prototype = _.create(MethodInjectionPoint.prototype, {
        constructor: OrderedInjectionPoint
    });
    module.exports = OrderedInjectionPoint;
});