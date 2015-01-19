define(function (require) {
    var _ = require("lodash");
    var ReflectorBase = require("./ReflectorBase");
    var DescribeTypeJSON = require("./DescribeTypeJSON");
    var TypeDescription = require("../typedescriptions/TypeDescription");
    var NoParamsConstructorInjectionPoint = require("../typedescriptions/NoParamsConstructorInjectionPoint");
    var ConstructorInjectionPoint = require("../typedescriptions/ConstructorInjectionPoint");
    var MethodInjectionPoint = require("../typedescriptions/MethodInjectionPoint");
    var PostConstructInjectionPoint = require("../typedescriptions/PostConstructInjectionPoint");
    var PreDestroyInjectionPoint = require("../typedescriptions/PreDestroyInjectionPoint");
    var PropertyInjectionPoint = require("../typedescriptions/PropertyInjectionPoint");
    var getQualifiedClassName = require("../../../core/getQualifiedClassName");

    function DescribeTypeJSONReflector() {
        ReflectorBase.apply(this);
        this._descriptor = new DescribeTypeJSON();
    }

    DescribeTypeJSONReflector.prototype = _.create(ReflectorBase.prototype, {
        constructor: DescribeTypeJSONReflector,
        typeImplements: function (type, superType) {
            if (type == superType) {
                return true;
            }
            var superClassName = getQualifiedClassName(superType);

            var traits = this._descriptor.getInstanceDescription(type).traits;
            return (traits.bases).indexOf(superClassName) > -1 || (traits.interfaces).indexOf(superClassName) > -1;
        },
        describeInjections: function (type) {
            var rawDescription = this._descriptor.getInstanceDescription(type);
            var traits = rawDescription.ctor;
            var typeName = rawDescription.name;
            var description = new TypeDescription(false);
            this.addCtorInjectionPoint(description, traits, typeName);
            /* this.addFieldInjectionPoints(description, traits.variables);
             this.addFieldInjectionPoints(description, traits.accessors);
             this.addMethodInjectionPoints(description, traits.methods, typeName);
             this.addPostConstructMethodPoints(description, traits.variables, typeName);
             this.addPostConstructMethodPoints(description, traits.accessors, typeName);
             this.addPostConstructMethodPoints(description, traits.methods, typeName);
             this.addPreDestroyMethodPoints(description, traits.methods, typeName);*/
            return description;
        },
        addCtorInjectionPoint: function (description, parameters, typeName) {

            if (!parameters.length) {
                description.ctor = new NoParamsConstructorInjectionPoint();
                return;
            }
            // extract injectable parameters by annotation!!! NOT IMPLEMENTED
            var injectParameters = null; // this.extractTagParameters('Inject', traits.metadata);
            var parameterNames =[];// (injectParameters && injectParameters.name || '').split(',');
            var requiredParameters = this.gatherMethodParameters(parameters, parameterNames, typeName);
            description.ctor = new ConstructorInjectionPoint(parameters, requiredParameters, injectParameters);
        },
        //addMethodInjectionPoints: function (description, methods, typeName) {
        //    if (!methods) {
        //        return;
        //    }
        //    const length = methods.length;
        //    for (var i = 0; i < length; i++) {
        //        var method = methods[i];
        //        var injectParameters = this.extractTagParameters('Inject', method.metadata);
        //        if (!injectParameters) {
        //            continue;
        //        }
        //        var optional = injectParameters.optional == 'true';
        //        var parameterNames = (injectParameters.name || '').split(',');
        //        var parameters = method.parameters;
        //        var requiredParameters = this.gatherMethodParameters(parameters, parameterNames, typeName);
        //        var injectionPoint = new MethodInjectionPoint(method.name,
        //            parameters, requiredParameters, optional, injectParameters);
        //        description.addInjectionPoint(injectionPoint);
        //    }
        //},
        //addPostConstructMethodPoints: function (description, methods, typeName) {
        //    var injectionPoints = this.gatherOrderedInjectionPointsForTag(PostConstructInjectionPoint, 'PostConstruct', methods, typeName);
        //    for (var i = 0, length = injectionPoints.length; i < length; i++) {
        //        description.addInjectionPoint(injectionPoints[i]);
        //    }
        //},
        //addPreDestroyMethodPoints: function (description, methods, typeName) {
        //    var injectionPoints = this.gatherOrderedInjectionPointsForTag(
        //        PreDestroyInjectionPoint, 'PreDestroy', methods, typeName);
        //    if (!injectionPoints.length) {
        //        return;
        //    }
        //    description.preDestroyMethods = injectionPoints[0];
        //    description.preDestroyMethods.last = injectionPoints[0];
        //    for (var i = 1, length = injectionPoints.length; i < length; i++) {
        //        description.preDestroyMethods.last.next = injectionPoints[i];
        //        description.preDestroyMethods.last = injectionPoints[i];
        //    }
        //},
        //addFieldInjectionPoints: function (description, fields) {
        //    if (!fields) {
        //        return;
        //    }
        //    var length = fields.length;
        //    for (var i = 0; i < length; i++) {
        //        var field = fields[i];
        //        var injectParameters = this.extractTagParameters('Inject', field.metadata);
        //        if (!injectParameters) {
        //            continue;
        //        }
        //        var mappingName = injectParameters.name || '';
        //        var optional = injectParameters.optional == 'true';
        //        var injectionPoint = new PropertyInjectionPoint(field.type + '|' + mappingName, field.name, optional, injectParameters);
        //        description.addInjectionPoint(injectionPoint);
        //    }
        //},
        gatherMethodParameters: function (parameters, parameterNames, typeName) {
            var requiredLength = 0;
            var length = parameters.length;
            for (var i = 0; i < length; i++) {
                var parameter = parameters[i];
                var injectionName = parameterNames[i] || '';
                var  parameterTypeName=parameter;
                //todo parametro == nome
                var parameterTypeName = parameter;
                /*if (parameterTypeName == '*') {
                    if (!parameter.optional) {
                        throw new Error('Error in method definition of injectee "' +
                        typeName + '. Required parameters can\'t have type "*".');
                    }
                    else {
                        parameterTypeName = null;
                    }
                }*/
                if (parameter) {
                    requiredLength++;
                }
                // todo parametri opzionali???
                //if (!parameter.optional) {
                //    requiredLength++;
                //}
                parameters[i] =injectionName || parameterTypeName;/* + '|' + injectionName;*/
            }
            return requiredLength;
        },
        gatherOrderedInjectionPointsForTag: function (injectionPointClass, tag, methods, typeName) {
            var injectionPoints = [];
            if (!methods) {
                return injectionPoints;
            }
            var length = methods.length;
            for (var i = 0; i < length; i++) {
                var method = methods[i];
                var injectParameters = this.extractTagParameters(tag, method.metadata);
                if (!injectParameters) {
                    continue;
                }
                var parameterNames = (injectParameters.name || '').split(',');
                var parameters = method.parameters;
                var requiredParameters;
                if (parameters) {
                    requiredParameters = this.gatherMethodParameters(parameters, parameterNames, typeName);
                }
                else {
                    parameters = [];
                    requiredParameters = 0;
                }
                var order = parseInt(injectParameters.order, 10);
                //int can't be NaN, so we have to verify that parsing succeeded by comparison
                if (order.toString(10) != injectParameters.order) {
                    order = Number.MAX_VALUE;
                }
                injectionPoints.push(new injectionPointClass(
                    method.name, parameters, requiredParameters, order));
            }
            if (injectionPoints.length > 0) {
                injectionPoints.sortOn('order');
            }
            return injectionPoints;
        },
        extractTagParameters: function (tag, metadata) {
            var length = metadata ? metadata.length : 0;
            for (var i = 0; i < length; i++) {
                var entry = metadata[i];
                if (entry.name == tag) {
                    var parametersList = entry.value;
                    var parametersMap = {};
                    var parametersCount = parametersList.length;
                    for (var j = 0; j < parametersCount; j++) {
                        var parameter = parametersList[j];
                        parametersMap[parameter.key] = parametersMap[parameter.key]
                            ? parametersMap[parameter.key] + ',' + parameter.value
                            : parameter.value;
                    }
                    return parametersMap;
                }
            }
            return null;
        }
    });

    return DescribeTypeJSONReflector
});