(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(["lodash"], factory);
	} else {
		root.jss = factory(window._);
	}
}(this, function (_) {
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
 * Created by marco.gobbi on 27/01/2015.
 */

	"use strict";
	var Provider = {
		create: function (responseType, instantiateUnmapped) {
			return {
				apply: function (responseType, instantiateUnmapped) {
					return instantiateUnmapped(responseType);
				}.bind(this, responseType, instantiateUnmapped),
				//
				destroy: function (responseType, injector) {
					if (responseType && injector && injector.hasManagedInstance(responseType)) {
						injector.destroyInstance(responseType);
					}
					//this.injector = null;
					//this._value = null;
				}.bind(this, responseType)
			}
		}
	};
	
/**
 * Created by marco on 11/11/2014.
 */

	
	
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
            var createMapping = InjectionMapping.create.bind(InjectionMapping,this, type, name);
            return _.compose(createMapping,utils.getId)(type, name);

        }, utils.getId),
        unmap: function (type, name) {
            var mappingId = utils.getId(type, name);
            var mapping = this.map.cache[mappingId];

            mapping && mapping.getProvider().destroy();
            delete this.map.cache[mappingId];
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
    

    'use strict';
    
    
    JSSuspenders = {
        Injector: Injector
    };



;





return JSSuspenders;
}));