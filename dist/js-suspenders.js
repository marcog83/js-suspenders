(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else {
		root.jss = factory();
	}
}(this, function () {
	'use strict';

    var JSSuspenders = {};


    'use strict';


    var utils = {
        __keyPrefix: new Date + '',
        isString: function (value) {
            return typeof value == 'string' ||
                value && typeof value == 'object' && toString.call(value) == '[object String]' || false;
        },
        isArray: Array.isArray,
        isFunction: function (value) {
            return typeof value == 'function';
        },
        memoize: function (func, resolver) {
            if (!utils.isFunction(func)) {
                throw new TypeError;
            }
            var memoized = function () {
                var cache = memoized.cache,
                    key = resolver ? resolver.apply(this, arguments) : utils.__keyPrefix + arguments[0];

                return Object.prototype.hasOwnProperty.call(cache, key)
                    ? cache[key]
                    : (cache[key] = func.apply(this, arguments));
            };
            memoized.cache = {};
            return memoized;
        },
        functionName: function (fun) {
            var ret = fun.toString();
            ret = ret.substr('function '.length);
            ret = ret.substr(0, ret.indexOf('('));
            return ret.trim();
        },
        getQualifiedClassName: function (type) {
            if (utils.isString(type))return type;
            if (utils.isFunction(type))return type.name || utils.functionName(type);
            if (utils.isArray(type)) {
                type = type[type.length - 1];
                return type.name || utils.functionName(type);
            }
            return type;
        },
        getId: function (type, name) {
            return name || utils.getQualifiedClassName(type);
        }
    };


    
/**
 * Created by marco on 11/11/2014.
 */

    function ClassProvider(responseType) {
        this._responseType = responseType;
    }

    ClassProvider.prototype = {
        apply: function (targetType, injector) {
            return injector.instantiateUnmapped(this._responseType);
        },
        destroy: function () {}

    };
    
/**
 * Created by marco on 11/11/2014.
 */



    function SingletonProvider(responseType, injector) {
        this._response = null;
        this._destroyed = false;
        this._responseType = responseType;
        this.injector = injector;
    }

    SingletonProvider.prototype = {
        apply: function () {
            this._response = this._response || this.createResponse(this.injector);
            return this._response;
        },
        createResponse: function (injector) {
            if (this._destroyed) {
                throw new Error("Forbidden usage of unmapped singleton provider for type " + this._responseType.toString());
            }
            return injector.instantiateUnmapped(this._responseType);
        },
        destroy: function () {
            this._destroyed = true;
            if (this._response && this.injector && this.injector.hasManagedInstance(this._response)) {
                this.injector.destroyInstance(this._response);
            }
            this.injector = null;
            this._response = null;
        }
    };
    
/**
 * Created by marco on 11/11/2014.
 */

    function ValueProvider(value, injector) {
        this._value = value;
        this.injector = injector;
    }

    ValueProvider.prototype = {
        apply: function () {
            return this._value;
        },
        destroy: function () {
            if (this._value && this.injector && this.injector.hasManagedInstance(this._value)) {
                this.injector.destroyInstance(this._value);
            }
            this.injector = null;
            this._value = null;
        }
    };
    
/**
 * Created by marco on 11/11/2014.
 */

    
    
    

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
    


    
    var Reflector = {
        capitalize: function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        findConstructorParams: function (target) {
            var inject = [];
            if (target.length) {
                var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
                var FN_ARG_SPLIT = /,/;
                var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
                var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
                var fnText = target.toString().replace(STRIP_COMMENTS, '');
                var argDecl = fnText.match(FN_ARGS);
                var self = this;
                inject = argDecl[1].split(FN_ARG_SPLIT).map(function (arg) {
                    return arg.replace(FN_ARG, function (all, _, name) {
                        return self.capitalize(name);
                    });
                });
            }
            return inject;
        },
        getInstanceDescription: function (type) {
            var parameters = [];
            if (utils.isArray(type)) {
                parameters = type.slice(0, -1);
            } else if (utils.isString(type)) {
                parameters = [];
            } else if (utils.isFunction(type)) {
                parameters = this.findConstructorParams(type);
            }
            return parameters;
        },
        describeInjections: function (type) {
            return {
                createInstance: this.createInstance.bind(this, this.getInstanceDescription(type))
            }
        },
        createInstance: function (parameters, type, injector) {
            var func = utils.isArray(type) ? type[type.length - 1] : type;
            var args = parameters.map(function (paramId) {
                return injector.getProvider(paramId).apply(type, injector);
            });
            args.unshift(type);
            //
            func = func.bind.apply(func, args);
            return new func();
        }
    };
    
/**
 * Created by marco on 10/11/2014.
 */

    
    
    


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

        getOrCreateNewInstance: function (type,name) {
            //serve a robojs
            return this.satisfies(type,name) && this.getInstance(type,name) || this.instantiateUnmapped(type);
        },
        satisfies: function (type, name) {
            var mappingId = utils.getId(type, name);
            return this.getProvider(mappingId, true) != null;
        },
        satisfiesDirectly: function (type, name) {
            return this.hasDirectMapping(type, name);
        },
        getMapping: function (type, name) {
            return this._mappings[utils.getId(type, name)];
        },
        hasManagedInstance: function (instance) {
            return this._managedObjects[instance];
        },
        getInstance: function (type, name, targetType) {
            var mappingId = utils.getId(type, name);
            var provider = this.getProvider(mappingId);
            return provider && provider.apply(targetType, this);
        },
        instantiateUnmapped: function (type) {
            return this.getDescription(type).createInstance(type, this);
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

        getProvider: function (mappingId) {
            return this.providerMappings[mappingId];
        }
    };
    

    'use strict';
    
    
    JSSuspenders = {
        Injector: Injector
    };



;





return JSSuspenders;
}));