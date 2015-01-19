/**
 * Created by marco on 11/11/2014.
 */
define(function (require) {
    var _ = require("lodash");
    var ForwardingProvider = require("./ForwardingProvider");

    function InjectorUsingProvider(injector, provider) {
        ForwardingProvider.call(this, provider);
        this.injector = injector;
    }

    InjectorUsingProvider.prototype = _.create(ForwardingProvider.prototype, {
        constructor: InjectorUsingProvider,
        apply: function (targetType, activeInjector, injectParameters) {
            return this.provider.apply(targetType, this.injector, injectParameters);
        }

    });
    return InjectorUsingProvider;
});