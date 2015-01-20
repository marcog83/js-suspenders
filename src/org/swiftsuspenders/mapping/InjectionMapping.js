/**
 * Created by marco on 11/11/2014.
 */
define(function (require) {
    var ClassProvider = require("../dependencyproviders/ClassProvider");
    var SingletonProvider = require("../dependencyproviders/SingletonProvider");
    var ValueProvider = require("../dependencyproviders/ValueProvider");

    function InjectionMapping(injector, type, name, mappingId) {
        this.injector = injector;
        this._type = type;
        this._name = name;
        this._mappingId = mappingId;

        //
        this._mapProvider(new ClassProvider(type));
    }

    InjectionMapping.prototype = {
        asSingleton: function (initializeImmediately) {
            this.toProvider(new SingletonProvider(this._type, this.injector));
            if (initializeImmediately) {
                this.injector.getInstance(this._type, this._name);
            }
            return this;
        },
        toType: function (type) {
            return this.toProvider(new ClassProvider(type));
        },
        toValue: function (value, destroyOnUnmap) {
            return this.toProvider(new ValueProvider(value, destroyOnUnmap ? this.injector : null));
        },
        toProvider: function (provider) {
            this._mapProvider(provider);
            return this;
        },
        hasProvider: function () {
            return (this.injector.providerMappings[this._mappingId]);
        },
        getProvider: function () {
            return this.injector.providerMappings[this._mappingId];
        },
        //----------------------         Private / Protected Methods        ----------------------//
        _mapProvider: function (provider) {
            this.injector.providerMappings[this._mappingId] = provider;
        }
    };
    return InjectionMapping;
});