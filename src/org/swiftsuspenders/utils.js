define(function (require, exports, module) {
    'use strict';


    var utils = {
        __keyPrefix: new Date + '',
        isString: function (value) {
            return typeof value == 'string' ||
                value && typeof value == 'object' && toString.call(value) == '[object String]' || false;
        },
        isArray: Array.isArray,
        isFunction: function (value) {
            return typeof value == 'function';
        },
        memoize: function (func, resolver) {
            if (!utils.isFunction(func)) {
                throw new TypeError;
            }
            var memoized = function () {
                var cache = memoized.cache,
                    key = resolver ? resolver.apply(this, arguments) : utils.__keyPrefix + arguments[0];

                return Object.prototype.hasOwnProperty.call(cache, key)
                    ? cache[key]
                    : (cache[key] = func.apply(this, arguments));
            };
            memoized.cache = {};
            return memoized;
        },
        functionName: function (fun) {
            var ret = fun.toString();
            ret = ret.substr('function '.length);
            ret = ret.substr(0, ret.indexOf('('));
            return ret.trim();
        },
        getQualifiedClassName: function (type) {
            if (utils.isString(type))return type;
            if (utils.isFunction(type))return type.name || utils.functionName(type);
            if (utils.isArray(type)) {
                type = type[type.length - 1];
                return type.name || utils.functionName(type);
            }
            return type;
        },
        getId: function (type, name) {
            return name || utils.getQualifiedClassName(type);
        }
    };


    module.exports = utils;
});