/**
 * Created by marco on 10/11/2014.
 */
define(function (require) {

	var InjectionMapping = require("./mapping/InjectionMapping");



	var TypeDescriptor = require("./utils/TypeDescriptor");
	var DescribeTypeJSONReflector = require("./reflection/DescribeTypeJSONReflector");
	var getQualifiedClassName = require("../../core/getQualifiedClassName");

	function getId(type, name) {
		return name || getQualifiedClassName(type);
	}

	function Injector() {
		this._baseTypes = [
			Object,
			Array,
			Function,
			Boolean,
			Number,
			String
		].map(function (type) {
				return getQualifiedClassName(type);
			});
		this._mappings = {};
		this._managedObjects = {};
		this._reflector = new DescribeTypeJSONReflector();
		this._classDescriptor = new TypeDescriptor(this._reflector, {});
		this.providerMappings = {};

	}

	Injector.prototype = {
		'constructor': Injector,
		map: function (type, name) {
			//get id
			// cerca in cache
			// o crea un nuovo mapping
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
		},
		satisfies: function (type, name) {
			var mappingId = getId(type, name);
			return this.getProvider(mappingId, true) != null;
		},
		satisfiesDirectly: function (type, name) {
			return this.hasDirectMapping(type, name);
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
			console.log("non implementato");
			//var type = this._reflector.getClass(target);
			//this.applyInjectionPoints(target, type, this._classDescriptor.getDescription(type));
		},
		getInstance: function (type, name, targetType) {
			var mappingId = getId(type, name);
			var provider = this.getProvider(mappingId);
			if (provider) {
				var ctor = this._classDescriptor.getDescription(type).ctor;
				return provider.apply(targetType, this, ctor ? ctor.injectParameters : null);
			}
			throw new Error('No mapping found for request ' + mappingId);
		},
		getOrCreateNewInstance: function (type) {
			return this.satisfies(type) && this.getInstance(type) || this.instantiateUnmapped(type);
		},
		instantiateUnmapped: function (type) {
			if (!this.canBeInstantiated(type)) {
				throw new Error("Can't instantiate interface " + getQualifiedClassName(type));
			}
			var description = this._classDescriptor.getDescription(type);
			//
			return description.ctor.createInstance(type, this);
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
		},

		addTypeDescription: function (type, description) {
			this._classDescriptor.addDescription(type, description);
		},
		getTypeDescription: function (type) {
			return this._reflector.describeInjections(type);
		},
		hasMapping: function (type, name) {
			return this.getProvider(getId(type, name)) != null;
			//return this.getProvider(getQualifiedClassName(type) + '|' + name) != null;
		},
		hasDirectMapping: function (type, name) {
			return this._mappings[getId(type, name)] != null;
			//return this._mappings[getQualifiedClassName(type) + '|' + name] != null;
		},
		canBeInstantiated: function (type) {
			var description = this._classDescriptor.getDescription(type);
			return description.ctor != null;
		},
		getProvider: function (mappingId) {
			return this.providerMappings[mappingId];
		},
		createMapping: function (type, name, mappingId) {
			//crea un nuovo mapping
			//salvalo in cache
			//ritornalo
			var mapping = new InjectionMapping(this, type, name, mappingId);
			this._mappings[mappingId] = mapping;
			return mapping;
		}
	};
	return Injector
});