define(function (require, exports, module) {
    'use strict';
    function InjectionPoint() {
        this.next;
        this.last;
        this.injectParameters;
        this.applyInjection = function (target, targetType, injector) {
        };
    }


    module.exports = InjectionPoint;
});