define(function (require, exports, module) {
    'use strict';
    var _ = require("lodash");
    var OrderedInjectionPoint = require("./OrderedInjectionPoint");

    function PostConstructInjectionPoint(methodName, parameters, requiredParameters, order){
        OrderedInjectionPoint.call(this,methodName, parameters, requiredParameters, order);
    }
    PostConstructInjectionPoint.prototype=_.create(OrderedInjectionPoint.prototype, {
        constructor: PostConstructInjectionPoint
    });
    module.exports = PostConstructInjectionPoint ;
});