/**
 * Created by marco on 11/11/2014.
 */
define(function (require) {
    function ClassProvider(responseType) {
        this._responseType = responseType;
    }

    ClassProvider.prototype = {
        apply: function (targetType, activeInjector, injectParameters) {
            return activeInjector.instantiateUnmapped(this._responseType);
        },
        destroy: function () {
        }

    };
    return ClassProvider;
});