/**
 * Created by marco on 11/11/2014.
 */
define(function (require) {
    var _ = require("lodash");

    function functionName(fun) {
        var ret = fun.toString();
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        return ret;
    }

    function getQualifiedClassName(type) {
        if (typeof type == "string")return type;
        if (typeof type == "function")return type.name || functionName(type);
        if (_.isArray(type)) {
            type = _.last(type);
            return type.name || functionName(type);
        }
        return type;
    }

    return getQualifiedClassName;
});