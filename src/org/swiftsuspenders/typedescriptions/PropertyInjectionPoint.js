define(function (require, exports, module) {
    'use strict';
    var _ = require("lodash");
    var InjectionPoint = require("./InjectionPoint");
    var getQualifiedClassName = require("../../../core/getQualifiedClassName");

    function PropertyInjectionPoint(mappingId, propertyName, optional, injectParameters) {
        InjectionPoint.apply(this);
        this._propertyName = propertyName;
        this._mappingId = mappingId;
        this._optional = optional;
        this.injectParameters = injectParameters;
    }

    PropertyInjectionPoint.prototype = _.create(InjectionPoint.prototype, {
        constructor: PropertyInjectionPoint,
        applyInjection: function (target, targetType, injector) {
            var provider = injector.getProvider(this._mappingId);
            if (!provider) {
                if (this._optional) {
                    return;
                }
                throw(new Error(
                    'Injector is missing a mapping to handle injection into property "' +
                    this._propertyName + '" of object "' + target + '" with type "' +
                    getQualifiedClassName(targetType) +
                    '". Target dependency: "' + this._mappingId + '"'));
            }
            target[this._propertyName] = provider.apply(targetType, injector, this.injectParameters);
        }
    });
    module.exports = PropertyInjectionPoint;
});