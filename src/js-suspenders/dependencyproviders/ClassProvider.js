/**
 * Created by marco on 11/11/2014.
 */
define(function (require) {
    function ClassProvider(responseType) {
        this._responseType = responseType;
    }

    ClassProvider.prototype = {
        apply: function (targetType, injector) {
            return injector.instantiateUnmapped(this._responseType);
        },
        destroy: function () {}

    };
    return ClassProvider;
});