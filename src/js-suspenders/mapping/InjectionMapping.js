/**
 * Created by marco on 11/11/2014.
 */
define(function (require) {
    var Provider = require("../dependencyproviders/Provider");
    var _ = require("lodash");
    //
    var InjectionMapping = {
        create: function (injector, type, name, mappingId) {

            // set provider
            var setProvider = _.partial(function (providerMappings, mappingId, provider) {
                providerMappings[mappingId] = provider;
            }, injector.providerMappings, mappingId);
            //create provider & setProvider
            var toProvider = _.compose(setProvider, Provider.create);
            // get check provider
            var hasProvider = _.partial(function (providerMappings, mappingId) {
                return providerMappings[mappingId];
            }, injector.providerMappings, mappingId);
            //
            toProvider(type, injector.instantiateUnmapped.bind(injector));
            return {

                asSingleton: _.wrap(_.partial(toProvider, type, _.memoize(injector.instantiateUnmapped.bind(injector))), function (func, yes) {
                    func();
                    return yes && injector.getInstance(type, name);

                }),

                toType: _.partialRight(toProvider, injector.instantiateUnmapped.bind(injector)),

                toValue: _.partialRight(toProvider, function (e) {
                    return e
                }),

                hasProvider: hasProvider,
                getProvider: hasProvider
            }
        }
    };
    return InjectionMapping;
});