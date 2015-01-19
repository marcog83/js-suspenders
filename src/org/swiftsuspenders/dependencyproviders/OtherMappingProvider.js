/**
 * Created by marco on 11/11/2014.
 */
define(function () {
    function OtherMappingProvider(mapping) {
        this._mapping = mapping;
    }

    OtherMappingProvider.prototype = {
        apply: function (targetType, activeInjector, injectParameters) {
            return this._mapping.getProvider().apply(targetType, activeInjector, injectParameters);
        },
        destroy: function () {
        }
    };
    return OtherMappingProvider;
});