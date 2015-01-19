define(function (require, exports, module) {
    'use strict';
    var getQualifiedClassName = require("../../../core/getQualifiedClassName");

    function ReflectorBase() {
    }

    ReflectorBase.prototype = {
        getClass: function (value) {
            /*
             There are several types for which the 'constructor' property doesn't work:
             - instances of Proxy, XML and XMLList throw exceptions when trying to access 'constructor'
             - instances of Vector, always returns Vector.<*> as their constructor except numeric vectors
             - for numeric vectors 'value is Vector.<*>' wont work, but 'value.constructor' will return correct result
             - int and uint return Number as their constructor
             For these, we have to fall back to more verbose ways of getting the constructor.
             */
            /* if (value is Proxy || value is Number || value is XML || value is XMLList || value is Vector.<*>)
             {
             return Class(getDefinitionByName(getQualifiedClassName(value)));
             }*/
            return value.constructor;
        },
        getFQCN: function (value, replaceColons) {
            var fqcn;
            if (typeof value == "string") {
                fqcn = value;
                // Add colons if missing and desired.
                if (!replaceColons && fqcn.indexOf('::') == -1) {
                    var lastDotIndex = fqcn.lastIndexOf('.');
                    if (lastDotIndex == -1) {
                        return fqcn;
                    }
                    return fqcn.substring(0, lastDotIndex) + '::' +
                        fqcn.substring(lastDotIndex + 1);
                }
            }
            else {
                fqcn = getQualifiedClassName(value);
            }
            return replaceColons ? fqcn.replace('::', '.') : fqcn;
        }

    };
    module.exports = ReflectorBase;
});