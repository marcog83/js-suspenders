/**
 * Created by marco on 11/11/2014.
 */
define(function () {
    function ForwardingProvider(provider) {
        this.provider = provider;
    }

    ForwardingProvider.prototype = {
        apply: function (targetType, activeInjector, injectParameters) {
            return this.provider.apply(targetType, activeInjector, injectParameters);
        },
        destroy: function () {
            this.provider.destroy();
        }
    };
    return ForwardingProvider;
});