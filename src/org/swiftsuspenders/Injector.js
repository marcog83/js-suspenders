/**
 * Created by marco on 10/11/2014.
 */
define(function (require) {
    var utils = require("./utils");
    var InjectionMapping = require("./mapping/InjectionMapping");
    var Reflector = require("./reflection/Reflector");


    function Injector() {
        this._mappings = {};
        this._managedObjects = {};
        this.providerMappings = {};
        this._descriptionsCache = {};
    }

    Injector.prototype = {
        getDescription: utils.memoize(function (type) {
            //get type description or cache it if the given type wasn't encountered before
            this._descriptionsCache[type] = Reflector.describeInjections(type);
            return this._descriptionsCache[type];
        }),
        map: utils.memoize(function (type, name) {
            //get id
            // cerca in cache
            // o crea un nuovo mapping
            var mappingId = utils.getId(type, name);
            var mapping = new InjectionMapping(this, type, name, mappingId);
            this._mappings[mappingId] = mapping;
            return mapping;

        }, utils.getId),
        unmap: function (type, name) {
            var mappingId = utils.getId(type, name);
            var mapping = this._mappings[mappingId];

            mapping && mapping.getProvider().destroy();
            delete this._mappings[mappingId];
            delete this.providerMappings[mappingId];
            delete this._descriptionsCache[type];
        },
        satisfies: function (type, name) {
            var mappingId = utils.getId(type, name);
            return this.getProvider(mappingId, true) != null;
        },
        satisfiesDirectly: function (type, name) {
            return this.hasDirectMapping(type, name);
        },
        getMapping: function (type, name) {
            var mappingId = utils.getId(type, name);
            var mapping = this._mappings[mappingId];
            if (!mapping) {
                throw new Error('Error while retrieving an injector mapping: '
                + 'No mapping defined for dependency ' + mappingId);
            }
            return mapping;
        },
        hasManagedInstance: function (instance) {
            return this._managedObjects[instance];
        },
        getInstance: function (type, name, targetType) {
            var mappingId = utils.getId(type, name);
            var provider = this.getProvider(mappingId);
            if (provider) {
                return provider.apply(targetType, this);
            }
            throw new Error('No mapping found for request ' + mappingId);
        },
        instantiateUnmapped: function (type) {
            if (!this.canBeInstantiated(type)) {
                throw new Error("Can't instantiate interface " + type.toString());
            }
            var description = this.getDescription(type);
            //
            return description.createInstance(type, this);
        },
        destroyInstance: function (instance) {
            delete this._managedObjects[instance];
        },
        teardown: function () {
            this._mappings.forEach(function (mapping) {
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
            this._mappings = {};
            this._managedObjects = {};
            this._descriptionsCache = {};
        },
        hasDirectMapping: function (type, name) {
            return this._mappings[utils.getId(type, name)] != null;

        },
        canBeInstantiated: function (type) {
            var description = this.getDescription(type);
            return description.createInstance != null;
        },
        getProvider: function (mappingId) {
            return this.providerMappings[mappingId];
        }
    };
    return Injector
});