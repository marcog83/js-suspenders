/**
 * Created by marco on 11/11/2014.
 */
define(function (require) {
	var Provider = require("../dependencyproviders/Provider");
	var _ = require("lodash");
	//
	var InjectionMapping = {
		create: function (injector, type, name, mappingId) {
			injector.providerMappings[mappingId] = Provider.create(type, injector.instantiateUnmapped.bind(injector));
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
			return {
				asSingleton: _.partial(function (type, name, injector, initializeImmediately) {
					toProvider(type, _.memoize(injector.instantiateUnmapped.bind(injector)));
					if (initializeImmediately) {
						injector.getInstance(type, name);
					}
				}, type, name, injector),
				toType: _.partial(function (instantiateUnmapped, type) {
					toProvider(type, instantiateUnmapped);
				}, injector.instantiateUnmapped.bind(injector)),
				toValue: function (value) {
					toProvider(value, function (e) {return e}.bind(this, value));
					//return this.toProvider(Provider.create(value, function (e) {return e}.bind(this, value)));
				},
				hasProvider: hasProvider,
				getProvider: hasProvider
			}
		}
	};
	return InjectionMapping;
});