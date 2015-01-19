define(function (require, exports, module) {
    'use strict';
    var getQualifiedClassName = require("../../../core/getQualifiedClassName");
    var _ = require("lodash");

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function findConstructorParams(target) {
        var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
        var FN_ARG_SPLIT = /,/;
        var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
        var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        var text = target.toString();
        var argNames = text.match(FN_ARGS)[1].split(',');
        return _.compact(argNames).map(function (parameter) {
            return capitalize(parameter).trim()
        })
    }

    function DescribeTypeJSON() {

    }

    DescribeTypeJSON.prototype = {
        describeType: function (target, flags) {
            return target;//describeTypeJSON(target, flags);
        },

        getInstanceDescription: function (type) {
            var ctor = [];
            var name = "";
            if (_.isArray(type)) {
                ctor = type.slice(0, -1);
                name = getQualifiedClassName(_.last(type));
            }
            if (_.isString(type)) {
                ctor = [];
                name = getQualifiedClassName(type);
            }
            if (_.isFunction(type)) {
                ctor = findConstructorParams(type);
                name = getQualifiedClassName(type);
            }
            return {
                name: name,
                ctor: ctor
            };
        },

        getClassDescription: function (type) {
            return type;///describeTypeJSON(type, CLASS_FLAGS);
        }
    };

    module.exports = DescribeTypeJSON;
});