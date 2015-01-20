define(function (require) {

    var utils = require("../utils");
    var Reflector = {
        capitalize: function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        findConstructorParams: function (target) {
            var inject = [];
            if (target.length) {
                var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
                var FN_ARG_SPLIT = /,/;
                var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
                var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
                var fnText = target.toString().replace(STRIP_COMMENTS, '');
                var argDecl = fnText.match(FN_ARGS);
                var self = this;
                inject = argDecl[1].split(FN_ARG_SPLIT).map(function (arg) {
                    return arg.replace(FN_ARG, function (all, _, name) {
                        return self.capitalize(name);
                    });
                });
            }
            return inject;
        },
        getInstanceDescription: function (type) {
            var parameters = [];
            if (utils.isArray(type)) {
                parameters = type.slice(0, -1);
            } else if (utils.isString(type)) {
                parameters = [];
            } else if (utils.isFunction(type)) {
                parameters = this.findConstructorParams(type);
            }
            return parameters;
        },
        describeInjections: function (type) {
            return {
                createInstance: this.createInstance.bind(this, this.getInstanceDescription(type))
            }
        },
        createInstance: function (parameters, type, injector) {
            var func = utils.isArray(type) ? type[type.length - 1] : type;
            var args = parameters.map(function (paramId) {
                return injector.getProvider(paramId).apply(type, injector);
            });
            args.unshift(type);
            //
            func = func.bind.apply(func, args);
            return new func();
        }
    };
    return Reflector;
});