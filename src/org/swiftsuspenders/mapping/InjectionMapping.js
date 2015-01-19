/**
 * Created by marco on 11/11/2014.
 */
define(function (require) {
    var ClassProvider = require("../dependencyproviders/ClassProvider");
    var SingletonProvider = require("../dependencyproviders/SingletonProvider");
    var ValueProvider = require("../dependencyproviders/ValueProvider");
    var ForwardingProvider = require("../dependencyproviders/ForwardingProvider");
    var SoftDependencyProvider = require("../dependencyproviders/SoftDependencyProvider");
    var LocalOnlyProvider = require("../dependencyproviders/LocalOnlyProvider");
    var InjectorUsingProvider = require("../dependencyproviders/InjectorUsingProvider");
    var MappingEvent = require("./MappingEvent");
    var _ = require("lodash");

    function InjectionMapping(creatingInjector, type, name, mappingId) {
        this._creatingInjector = creatingInjector;
        this._type = type;
        this._name = name;
        this._mappingId = mappingId;
        this._defaultProviderSet = true;


        this.mapProvider(new ClassProvider(type));
        //
        this._overridingInjector = null;
        this._soft = null;
        this._local = null;
        this._sealed = null;
        this._sealKey = null;
    }

    InjectionMapping.prototype = {
        /**
         * Makes the mapping return a lazily constructed singleton instance of the mapped type for
         * each consecutive request.
         *
         * <p>Syntactic sugar method wholly equivalent to using <code>toSingleton(type)</code>.</p>
         *
         * @return InjectionMapping the method is invoked on
         *
         * @throws org.swiftsuspenders.errors.InjectorError Sealed mappings can't be changed in any way
         *
         * @see #toSingleton()
         */
        asSingleton: function (initializeImmediately) {
            this.toSingleton(this._type, initializeImmediately);
            return this;
        },
        /**
         * Makes the mapping return a newly created instance of the given <code>type</code> for
         * each consecutive request.
         *
         * <p>Syntactic sugar method wholly equivalent to using
         * <code>toProvider(new ClassProvider(type))</code>.</p>
         *
         * @param type The <code>class</code> to instantiate upon each request
         *
         * @return InjectionMapping the method is invoked on
         *
         * @throws org.swiftsuspenders.errors.InjectorError Sealed mappings can't be changed in any way
         *
         * @see #toProvider()
         */
        toType: function (type) {
            this.toProvider(new ClassProvider(type));
            return this;
        },
        /**
         * Makes the mapping return a lazily constructed singleton instance of the mapped type for
         * each consecutive request.
         *
         * <p>Syntactic sugar method wholly equivalent to using
         * <code>toProvider(new SingletonProvider(type, injector))</code>, where
         * <code>injector</code> denotes the Injector that should manage the singleton.</p>
         *
         * @param type The <code>class</code> to instantiate upon each request
         *
         * @return InjectionMapping the method is invoked on
         *
         * @throws org.swiftsuspenders.errors.InjectorError Sealed mappings can't be changed in any way
         *
         * @see #toProvider()
         */
        toSingleton: function (type, initializeImmediately) {
            this.toProvider(new SingletonProvider(type, this._creatingInjector));
            if (initializeImmediately) {
                this._creatingInjector.getInstance(this._type, this._name);
            }
            return this;
        },
        /**
         * Makes the mapping return the given value for each consecutive request.
         *
         * <p>Syntactic sugar method wholly equivalent to using
         * <code>toProvider(new ValueProvider(value))</code>.</p>
         *
         * @param value The instance to return upon each request
         *
         * @return InjectionMapping the method is invoked on
         *
         * @throws org.swiftsuspenders.errors.InjectorError Sealed mappings can't be changed in any way
         *
         * @see #toProvider()
         */
        toValue: function (value, autoInject, destroyOnUnmap) {
            this.toProvider(new ValueProvider(value, destroyOnUnmap ? this._creatingInjector : null));
            if (autoInject) {
                this._creatingInjector.injectInto(value);
            }
            return this;
        },
        /**
         * Makes the mapping apply the given <code>DependencyProvider</code> and return the
         * resulting value for each consecutive request.
         *
         * @param provider The <code>DependencyProvider</code> to use for fulfilling requests
         *
         * @return InjectionMapping the method is invoked on
         *
         * @throws org.swiftsuspenders.errors.InjectorError Sealed mappings can't be changed in any way
         */
        toProvider: function (provider) {
            this._sealed && this.throwSealedError();
            if (this.hasProvider() && provider != null && !this._defaultProviderSet) {
                console.log('Warning: Injector already has a mapping for ' + this._mappingId + '.\n ' +
                'If you have overridden this mapping intentionally you can use ' +
                '"injector.unmap()" prior to your replacement mapping in order to ' +
                'avoid seeing this message.');
                this._creatingInjector.dispatcher.hasEventListener(MappingEvent.MAPPING_OVERRIDE)
                && this._creatingInjector.dispatcher.dispatchEvent(
                    new MappingEvent(MappingEvent.MAPPING_OVERRIDE, this._type, this._name, this));
            }
            this.dispatchPreChangeEvent();
            this._defaultProviderSet = false;
            this.mapProvider(provider);
            this.dispatchPostChangeEvent();
            return this;
        },
        /**
         * Causes the Injector the mapping is defined in to look further up in its inheritance
         * chain for other mappings for the requested dependency. The Injector will use the
         * inner-most strong mapping if one exists or the outer-most soft mapping otherwise.
         *
         * <p>Soft mappings enable modules to be set up in such a way that some of their settings
         * can optionally be configured from the outside without them failing to run in standalone
         * mode.</p>
         *
         * @return InjectionMapping the method is invoked on
         *
         * @throws org.swiftsuspenders.errors.InjectorError Sealed mappings can't be changed in any way
         */
        softly: function () {
            this._sealed && this.throwSealedError();
            if (!this._soft) {
                var provider = this.getProvider();
                this.dispatchPreChangeEvent();
                this._soft = true;
                this.mapProvider(provider);
                this.dispatchPostChangeEvent();
            }
            return this;
        },
        /**
         * Disables sharing the mapping with child Injectors of the Injector it is defined in.
         *
         * @return InjectionMapping the method is invoked on
         *
         * @throws org.swiftsuspenders.errors.InjectorError Sealed mappings can't be changed in any way
         */
        locally: function () {
            this._sealed && this.throwSealedError();
            if (this._local) {
                return this;
            }
            var provider = this.getProvider();
            this.dispatchPreChangeEvent();
            this._local = true;
            this.mapProvider(provider);
            this.dispatchPostChangeEvent();
            return this;
        },
        /**
         * Prevents all subsequent changes to the mapping, including removal. Trying to change it
         * in any way at all will throw an <code>InjectorError</code>.
         *
         * <p>To enable unsealing of the mapping at a later time, <code>seal</code> returns a
         * unique object that can be used as the argument to <code>unseal</code>. As long as that
         * key object is kept secret, there's no way to tamper with or remove the mapping.</p>
         *
         * @returns An internally created object that can be used as the key for unseal
         *
         * @throws org.swiftsuspenders.errors.InjectorError Can't be invoked on a mapping that's already sealed
         *
         * @see #unseal()
         */
        seal: function () {
            if (this._sealed) {
                throw new Error('Mapping is already sealed.');
            }
            this._sealed = true;
            this._sealKey = {};
            return this._sealKey;
        },
        /**
         * Reverts the effect of <code>seal</code>, makes the mapping changeable again.
         *
         * @param key The key to unseal the mapping. Has to be the instance returned by
         * <code>seal()</code>
         *
         * @return InjectionMapping the method is invoked on
         *
         * @throws org.swiftsuspenders.errors.InjectorError Has to be invoked with the unique key object returned by an earlier call to <code>seal</code>
         * @throws org.swiftsuspenders.errors.InjectorError Can't unseal a mapping that's not sealed
         *
         * @see #seal()
         */
        unseal: function (key) {
            if (!this._sealed) {
                throw new Error('Can\'t unseal a non-sealed mapping.');
            }
            if (key !== this._sealKey) {
                throw new Error('Can\'t unseal mapping without the correct key.');
            }
            this._sealed = false;
            this._sealKey = null;
            return this;
        },
        /**
         * @return <code>true</code> if the mapping is sealed, <code>false</code> if not
         */
        get isSealed() {
            return this._sealed;
        },
        /**
         * @return <code>true</code> if the mapping has a provider, <code>false</code> if not
         */
        hasProvider: function () {
            return (this._creatingInjector.providerMappings[this._mappingId]);
        },
        /**
         * @return The provider currently associated with the mapping
         */
        getProvider: function () {
            var provider = this._creatingInjector.providerMappings[this._mappingId];
            while (provider instanceof ForwardingProvider) {
                provider = (provider).provider;
            }
            return provider;
        },
        /**
         * Sets the Injector to supply to the mapped DependencyProvider or to query for ancestor
         * mappings.
         *
         * An Injector is always provided when calling apply, but if one is also set using
         * setInjector, it takes precedence. This is used to implement forks in a dependency graph,
         * allowing the use of a different Injector from a certain point in the constructed object
         * graph on.
         *
         * @param injector - The Injector to use in the mapping. Set to null to reset.
         *
         * @return InjectionMapping the method is invoked on
         */
        setInjector: function (injector) {
            this._sealed && this.throwSealedError();
            if (injector == this._overridingInjector) {
                return this;
            }
            var provider = this.getProvider();
            this._overridingInjector = injector;
            this.mapProvider(provider);
            return this;
        },
        //----------------------         Private / Protected Methods        ----------------------//
        mapProvider: function (provider) {

            if (this._soft) {
                provider = new SoftDependencyProvider(provider);
            }
            if (this._local) {
                provider = new LocalOnlyProvider(provider);
            }
            if (this._overridingInjector) {
                provider = new InjectorUsingProvider(this._overridingInjector, provider);
            }
            this._creatingInjector.providerMappings[this._mappingId] = provider;
        },
        throwSealedError: function () {
            throw new Error('Can\'t change a sealed mapping');
        },
        dispatchPreChangeEvent: function () {
            this._creatingInjector.dispatcher.hasEventListener(MappingEvent.PRE_MAPPING_CHANGE)
            && this._creatingInjector.dispatcher.dispatchEvent(
                new MappingEvent(MappingEvent.PRE_MAPPING_CHANGE, this._type, this._name, this));
        },
        dispatchPostChangeEvent: function () {
            this._creatingInjector.dispatcher.hasEventListener(MappingEvent.POST_MAPPING_CHANGE)
            && this._creatingInjector.dispatcher.dispatchEvent(
                new MappingEvent(MappingEvent.POST_MAPPING_CHANGE, this._type, this._name, this));
        }

    };
    return InjectionMapping;
});