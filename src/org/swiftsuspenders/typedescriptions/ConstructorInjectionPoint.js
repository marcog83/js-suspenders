define(function (require, exports, module) {
	'use strict';
	var _ = require("lodash");

	function ConstructorInjectionPoint(parameters) {
		this._methodName = 'ctor';
		this.parameters = parameters;
		// MethodInjectionPoint.call(this, 'ctor', parameters);
	}

	ConstructorInjectionPoint.prototype = {
		createInstance: function (type, injector) {
			var func = _.isArray(type) ? _.last(type) : type;
			var args = this.parameters.map(function (paramId) {
				var provider = injector.getProvider(paramId);
				if (!provider) {
					throw(new Error('Injector is missing a mapping to handle injection into target: "' + paramId));
				}
				return provider.apply(type, injector);
			});
			args.unshift(type);
			//
			func = func.bind.apply(func, args);
			return new func();
		}
	};
	module.exports = ConstructorInjectionPoint;
});