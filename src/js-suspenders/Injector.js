/**
 * Created by marco on 10/11/2014.
 */
define(function (require) {
    var _ = require("lodash");
    var utils = require("./utils");
    var InjectionMapping = require("./mapping/InjectionMapping");
    var Reflector = require("./reflection/Reflector");


    var Injector = {
        _managedObjects: {},
        providerMappings: {},
        _descriptionsCache: {},
        getDescription: utils.memoize(function (type) {
            //get type description or cache it if the given type wasn't encountered before
            this._descriptionsCache[type] = Reflector.describeInjections(type);
            return this._descriptionsCache[type];
        }),
        map: utils.memoize(function (type, name) {
            //get id
            // cerca in cache
            // o crea un nuovo mapping
            var createMapping = InjectionMapping.create.bind(InjectionMapping, this, type, name);
            return _.compose(createMapping, utils.getId)(type, name);

        }, utils.getId),
        unmap: function (type, name) {
            var mappingId = utils.getId(type, name);
            var mapping = this.map.cache[mappingId];

            mapping && mapping.getProvider().destroy();
            delete this.map.cache[mappingId];
            delete this.providerMappings[mappingId];
            delete this._descriptionsCache[type];
        },

        getOrCreateNewInstance: function (type, name) {
            //serve a robojs
            return this.satisfies(type, name) && this.getInstance(type, name) || this.instantiateUnmapped(type);
        },
        satisfies: function (type, name) {
            var mappingId = utils.getId(type, name);
            return this.getProvider(mappingId, true) != null;
        },
        satisfiesDirectly: function (type, name) {
            return this.hasDirectMapping(type, name);
        },
        getMapping: function (type, name) {
            return this.map.cache[utils.getId(type, name)];
        },
        hasManagedInstance: function (instance) {
            return this._managedObjects[instance];
        },
        getInstance: function (type, name) {
            var mappingId = utils.getId(type, name);
            var provider = this.getProvider(mappingId);
            return provider && provider.apply(type, this);
        },
        instantiateUnmapped: function (type) {
            return this.getDescription(type).createInstance(type, this);
        },
        destroyInstance: function (instance) {
            delete this._managedObjects[instance];
        },
        teardown: function () {
            this.map.cache.forEach(function (mapping) {
                mapping.getProvider().destroy();
            });
            var objectsToRemove = [];
            this._managedObjects.forEach(function (instance) {
                instance && objectsToRemove.push(instance);
            });
            while (objectsToRemove.length) {
                this.destroyInstance(objectsToRemove.pop());
            }
            this.providerMappings.forEach(function (mappingId) {
                delete this.providerMappings[mappingId];
            });
            this.map.cache = {};
            this._managedObjects = {};
            this._descriptionsCache = {};
        },
        hasDirectMapping: function (type, name) {
            return this.map.cache[utils.getId(type, name)] != null;

        },
        getProvider: function (mappingId) {
            return this.providerMappings[mappingId];
        }
    };
    return Injector
});