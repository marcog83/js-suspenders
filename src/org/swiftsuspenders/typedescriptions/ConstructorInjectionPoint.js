define(function (require, exports, module) {
    'use strict';
    var _ = require("lodash");
    var MethodInjectionPoint = require("./MethodInjectionPoint");
//----------------------               Public Methods               ----------------------//
    function ConstructorInjectionPoint(parameters) {
        MethodInjectionPoint.call(this, 'ctor', parameters);
    }

    ConstructorInjectionPoint.prototype = _.create(MethodInjectionPoint.prototype, {
        constructor: ConstructorInjectionPoint,
        createInstance: function (type, injector) {
            var p = this.gatherParameterValues(type, type, injector);
            var result;
            //the only way to implement ctor injections, really!
            if (_.isArray(type)) {
                type = _.last(type);
            }
            switch (p.length) {
                case 1 :
                    result = new type(p[0]);
                    break;
                case 2 :
                    result = new type(p[0], p[1]);
                    break;
                case 3 :
                    result = new type(p[0], p[1], p[2]);
                    break;
                case 4 :
                    result = new type(p[0], p[1], p[2], p[3]);
                    break;
                case 5 :
                    result = new type(p[0], p[1], p[2], p[3], p[4]);
                    break;
                case 6 :
                    result = new type(p[0], p[1], p[2], p[3], p[4], p[5]);
                    break;
                case 7 :
                    result = new type(p[0], p[1], p[2], p[3], p[4], p[5], p[6]);
                    break;
                case 8 :
                    result = new type(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7]);
                    break;
                case 9 :
                    result = new type(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8]);
                    break;
                case 10 :
                    result = new type(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9]);
                    break;
                default:
                    throw new Error("The constructor for " + type + " has too many arguments, maximum is 10");
            }
            p.length = 0;
            return result;
        }
    });


    module.exports = ConstructorInjectionPoint;
});