define(function (require, exports, module) {
    'use strict';
    var _ = require("lodash");
    var InjectionPoint = require("./InjectionPoint");
    var getQualifiedClassName = require("../../../core/getQualifiedClassName");

    function MethodInjectionPoint(methodName, parameters, requiredParameters, isOptional, injectParameters) {
        InjectionPoint.apply(this, arguments);
        //----------------------       Private / Protected Properties       ----------------------//
        this._parameterMappingIDs = parameters;
        this._requiredParameters = requiredParameters;

        this._isOptional = isOptional;
        this._methodName = methodName;

        this.injectParameters = injectParameters;
    }

    MethodInjectionPoint.prototype = _.create(InjectionPoint.prototype, {
        constructor: MethodInjectionPoint,
        applyInjection: function (target, targetType, injector) {
            var p = this.gatherParameterValues(target, targetType, injector);
            if (p.length >= this._requiredParameters) {
                (target[this._methodName]).apply(target, p);
            }

            p.length = 0;
        },
        gatherParameterValues: function (target, targetType, injector) {
            var length = this._parameterMappingIDs.length;
            var parameters = [];
            parameters.length = length;
            for (var i = 0; i < length; i++) {
                var parameterMappingId = this._parameterMappingIDs[i];
                var provider = injector.getProvider(parameterMappingId);
                if (!provider) {
                    if (i >= this._requiredParameters || this._isOptional) {
                        break;
                    }
                    throw(new Error(
                        'Injector is missing a mapping to handle injection into target "' +
                        target + '" of type "' + getQualifiedClassName(targetType) + '". \
						Target dependency: ' + parameterMappingId +
                        ', method: ' + this._methodName + ', parameter: ' + (i + 1)
                    ));
                }

                parameters[i] = provider.apply(targetType, injector, this.injectParameters);
            }
            return parameters;
        }

    });
    module.exports = MethodInjectionPoint;
});