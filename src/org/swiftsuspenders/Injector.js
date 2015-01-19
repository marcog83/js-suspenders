/**
 * Created by marco on 10/11/2014.
 */
define(function (require) {
    //var _ = require("lodash");
    var EventDispatcher = require("../../core/events/EventDispatcher");

    var InjectionMapping = require("./mapping/InjectionMapping");
    var SoftDependencyProvider = require("./dependencyproviders/SoftDependencyProvider");
    var LocalOnlyProvider = require("./dependencyproviders/LocalOnlyProvider");
    var MappingEvent = require("./mapping/MappingEvent");
    var InjectionEvent = require("./InjectionEvent");
    var TypeDescriptor = require("./utils/TypeDescriptor");
    var DescribeTypeJSONReflector = require("./reflection/DescribeTypeJSONReflector");
    var getQualifiedClassName = require("../../core/getQualifiedClassName");

    function getId(type, name) {
        // name = name || "";
        var mappingId = name || getQualifiedClassName(type);
        return mappingId;
    }

    function Injector() {
        this._baseTypes = [Object, Array, Function, Boolean, Number, String].map(function (type) {
            return getQualifiedClassName(type);
        });

        this._mappings = {};
        this._mappingsInProcess = {};
        this._managedObjects = {};
        this._reflector = new DescribeTypeJSONReflector();
        this._classDescriptor = new TypeDescriptor(this._reflector, {});

        this.providerMappings = {};
        this._fallbackProvider = null;
        this.dispatcher = new EventDispatcher();
    }

    Injector.prototype = {
        'constructor': Injector,

        map: function (type, name) {
            //
            //
            //
            var mappingId = getId(type, name);
            return this._mappings[mappingId] || this.createMapping(type, name, mappingId);

        },
        unmap: function (type, name) {
            var mappingId = getId(type, name);
            var mapping = this._mappings[mappingId];
            if (mapping && mapping.isSealed) {
                throw new Error('Can\'t unmap a sealed mapping');
            }
            if (!mapping) {
                throw new Error('Error while removing an injector mapping: ' +
                'No mapping defined for dependency ' + mappingId);
            }
            mapping.getProvider().destroy();
            delete this._mappings[mappingId];
            delete this.providerMappings[mappingId];
            this.dispatcher.hasEventListener(MappingEvent.POST_MAPPING_REMOVE) && this.dispatcher.dispatchEvent(
                new MappingEvent(MappingEvent.POST_MAPPING_REMOVE, type, name, null));

        },
        satisfies: function (type, name) {
            var mappingId = getId(type, name);
            return this.getProvider(mappingId, true) != null;

        },
        satisfiesDirectly: function (type, name) {
            return this.hasDirectMapping(type, name)
                || this.getDefaultProvider(getQualifiedClassName(type) + '|' + name, false) != null;

        },
        getMapping: function (type, name) {
            var mappingId = getId(type, name);
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
        injectInto: function (target) {
            var type = this._reflector.getClass(target);
            this.applyInjectionPoints(target, type, this._classDescriptor.getDescription(type));

        },
        getInstance: function (type, name, targetType) {
            name = name || "";
            var mappingId = getId(type, name);
            var provider = this.getProvider(mappingId) || this.getDefaultProvider(mappingId, true);
            if (provider) {
                var ctor = this._classDescriptor.getDescription(type).ctor;
                return provider.apply(targetType, this, ctor ? ctor.injectParameters : null);
            }

            var fallbackMessage = this._fallbackProvider
                ? "the fallbackProvider, '" + this._fallbackProvider + "', was unable to fulfill this request."
                : "the injector has no fallbackProvider.";

            throw new Error('No mapping found for request ' + mappingId
            + ' and ' + fallbackMessage);
        }
        ,
        getOrCreateNewInstance: function (type) {
            return this.satisfies(type) && this.getInstance(type) || this.instantiateUnmapped(type);
        }
        ,
        instantiateUnmapped: function (type) {
            if (!this.canBeInstantiated(type)) {
                throw new Error(
                    "Can't instantiate interface " + getQualifiedClassName(type));
            }
            var description = this._classDescriptor.getDescription(type);
            var instance = description.ctor.createInstance(type, this);
            this.dispatcher.hasEventListener(InjectionEvent.POST_INSTANTIATE) && this.dispatcher.dispatchEvent(
                new InjectionEvent(InjectionEvent.POST_INSTANTIATE, instance, type));
            this.applyInjectionPoints(instance, type, description);
            return instance;
        }
        ,
        destroyInstance: function (instance) {
            delete this._managedObjects[instance];
            var type = this._reflector.getClass(instance);
            var typeDescription = this.getTypeDescription(type);
            for (var preDestroyHook = typeDescription.preDestroyMethods;
                 preDestroyHook; preDestroyHook = preDestroyHook.next) {
                preDestroyHook.applyInjection(instance, type, this);
            }
        }
        ,
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
            this._mappingsInProcess = {};
            this._managedObjects = {};
            this._fallbackProvider = null;
            this._blockParentFallbackProvider = false;
        }
        ,
        createChildInjector: function () {
            var injector = new Injector();

            injector.parentInjector = this;
            return injector;
        },
        set parentInjector(parentInjector) {
            this._parentInjector = parentInjector;
        },
        get parentInjector() {
            return this._parentInjector;
        },
        addTypeDescription: function (type, description) {
            this._classDescriptor.addDescription(type, description);
        },
        getTypeDescription: function (type) {
            return this._reflector.describeInjections(type);
        },
        hasMapping: function (type, name) {
            return this.getProvider(getQualifiedClassName(type) + '|' + name) != null;
        },
        hasDirectMapping: function (type, name) {
            return this._mappings[getQualifiedClassName(type) + '|' + name] != null;
        },
        get fallbackProvider() {
            return this._fallbackProvider;
        },
        set fallbackProvider(provider) {
            this._fallbackProvider = provider;
        },
        get blockParentFallbackProvider() {
            return this._blockParentFallbackProvider;
        },
        set blockParentFallbackProvider(value) {
            this._blockParentFallbackProvider = value;
        },
        canBeInstantiated: function (type) {
            var description = this._classDescriptor.getDescription(type);
            return description.ctor != null;
        },
        getProvider: function (mappingId, fallbackToDefault) {
            fallbackToDefault = fallbackToDefault == undefined ? true : fallbackToDefault;
            var softProvider;
            var injector = this;
            while (injector) {
                var provider = injector.providerMappings[mappingId];
                if (provider) {
                    if (provider instanceof SoftDependencyProvider) {
                        softProvider = provider;
                        injector = injector.parentInjector;
                        continue;
                    }
                    if (provider instanceof LocalOnlyProvider && injector !== this) {
                        injector = injector.parentInjector;
                        continue;
                    }
                    return provider;
                }
                injector = injector.parentInjector;
            }
            if (softProvider) {
                return softProvider;
            }
            return fallbackToDefault ? this.getDefaultProvider(mappingId, true) : null;
        },
        getDefaultProvider: function (mappingId, consultParents) {
            //No meaningful way to automatically create base types without names
            if (this._baseTypes.indexOf(mappingId) > -1) {
                return null;
            }

            if (this._fallbackProvider && this._fallbackProvider.prepareNextRequest(mappingId)) {
                return this._fallbackProvider;
            }
            if (consultParents && !this._blockParentFallbackProvider && this._parentInjector) {
                return this._parentInjector.getDefaultProvider(mappingId, consultParents);
            }
            return null;
        },
        createMapping: function (type, name, mappingId) {
            if (this._mappingsInProcess[mappingId]) {
                throw new Error(
                    'Can\'t change a mapping from inside a listener to it\'s creation event');
            }
            this._mappingsInProcess[mappingId] = true;

            this.dispatcher.hasEventListener(MappingEvent.PRE_MAPPING_CREATE) && this.dispatcher.dispatchEvent(
                new MappingEvent(MappingEvent.PRE_MAPPING_CREATE, type, name, null));

            var mapping = new InjectionMapping(this, type, name, mappingId);
            this._mappings[mappingId] = mapping;

            var sealKey = mapping.seal();
            this.dispatcher.hasEventListener(MappingEvent.POST_MAPPING_CREATE) && this.dispatcher.dispatchEvent(
                new MappingEvent(MappingEvent.POST_MAPPING_CREATE, type, name, mapping));
            delete this._mappingsInProcess[mappingId];
            mapping.unseal(sealKey);
            return mapping;
        },
        applyInjectionPoints: function (target, targetType, description) {
            var injectionPoint = description.injectionPoints;
            this.dispatcher.hasEventListener(InjectionEvent.PRE_CONSTRUCT) && this.dispatcher.dispatchEvent(
                new InjectionEvent(InjectionEvent.PRE_CONSTRUCT, target, targetType));
            while (injectionPoint) {
                injectionPoint.applyInjection(target, targetType, this);
                injectionPoint = injectionPoint.next;
            }
            if (description.preDestroyMethods) {
                this._managedObjects[target] = target;
            }
            this.dispatcher.hasEventListener(InjectionEvent.POST_CONSTRUCT) && this.dispatcher.dispatchEvent(
                new InjectionEvent(InjectionEvent.POST_CONSTRUCT, target, targetType));
        }

    };

    return Injector
});