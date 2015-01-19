/**
 * Created by marco on 11/11/2014.
 */
define(function () {
    function FactoryProvider(factoryClass) {
        this._factoryClass = factoryClass;
    }

    FactoryProvider.prototype = {
        apply: function (targetType, activeInjector, injectParameters) {
            return activeInjector.getInstance(this._factoryClass).apply(targetType, activeInjector, injectParameters);
        },
        destroy: function () {
        }
    };
    return FactoryProvider;
});