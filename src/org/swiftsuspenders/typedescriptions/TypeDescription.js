define(function (require, exports, module) {
    'use strict';
    var NoParamsConstructorInjectionPoint = require("./NoParamsConstructorInjectionPoint");
    var ConstructorInjectionPoint = require("./ConstructorInjectionPoint");
    var PropertyInjectionPoint = require("./PropertyInjectionPoint");
    var MethodInjectionPoint = require("./MethodInjectionPoint");
    var PostConstructInjectionPoint = require("./PostConstructInjectionPoint");
    var PreDestroyInjectionPoint = require("./PreDestroyInjectionPoint");
    var getQualifiedClassName = require("../../../core/getQualifiedClassName");

    function TypeDescription(useDefaultConstructor) {
        useDefaultConstructor = useDefaultConstructor == undefined ? true : useDefaultConstructor;
        this.ctor = null;
        this.injectionPoints = null;
        this.preDestroyMethods = null;
        this._postConstructAdded = null;
        if (useDefaultConstructor) {
            this.ctor = new NoParamsConstructorInjectionPoint();
        }
    }

    TypeDescription.prototype = {
        setConstructor: function (parameterTypes, parameterNames,
                                  requiredParameters,
                                  metadata) {
            this.ctor = new ConstructorInjectionPoint(this.createParameterMappings(parameterTypes, parameterNames || []), requiredParameters, metadata);
            return this;
        },
        addFieldInjection: function (fieldName, type, injectionName, optional, metadata) {
            injectionName = injectionName || "";
            if (this._postConstructAdded) {
                throw new Error('InjectorError Can\'t add injection point after post construct method');
            }
            this.addInjectionPoint(new PropertyInjectionPoint(getQualifiedClassName(type) + '|' + injectionName, fieldName, optional, metadata));
            return this;
        },
        addMethodInjection: function (methodName, parameterTypes, parameterNames,
                                      requiredParameters, optional,
                                      metadata) {
            if (this._postConstructAdded) {
                throw new Error('Injector Can\'t add injection point after post construct method');
            }
            this.addInjectionPoint(new MethodInjectionPoint(methodName, this.createParameterMappings(parameterTypes, parameterNames || []), Math.min(requiredParameters, parameterTypes.length), optional, metadata));
            return this;
        },
        addPostConstructMethod: function (methodName, parameterTypes, parameterNames,
                                          requiredParameters) {
            this._postConstructAdded = true;
            this.addInjectionPoint(new PostConstructInjectionPoint(methodName, this.createParameterMappings(parameterTypes, parameterNames || []),
                Math.min(requiredParameters, parameterTypes.length), 0));
            return this;
        },
        addPreDestroyMethod: function (methodName, parameterTypes, parameterNames,
                                       requiredParameters) {
            var method = new PreDestroyInjectionPoint(
                methodName, this.createParameterMappings(parameterTypes, parameterNames || []),
                Math.min(requiredParameters, parameterTypes.length), 0);
            if (this.preDestroyMethods) {
                this.preDestroyMethods.last.next = method;
                this.preDestroyMethods.last = method;
            }
            else {
                this.preDestroyMethods = method;
                this.preDestroyMethods.last = method;
            }
            return this;
        },
        addInjectionPoint: function (injectionPoint) {
            if (this.injectionPoints) {
                this.injectionPoints.last.next = injectionPoint;
                this.injectionPoints.last = injectionPoint;
            }
            else {
                this.injectionPoints = injectionPoint;
                this.injectionPoints.last = injectionPoint;
            }
        },
        createParameterMappings: function (parameterTypes, parameterNames) {
            var parameters = [];
            for (var i = 0; i < parameterTypes.length; i++) {
                parameters[i] = getQualifiedClassName(parameterTypes[i]) + '|' + (parameterNames[i] || '');
            }
            return parameters;
        }
    };
    module.exports = TypeDescription;
});