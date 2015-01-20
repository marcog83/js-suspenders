define(function (require, exports, module) {
	'use strict';

	var getQualifiedClassName = require("../../../core/getQualifiedClassName");

	function MethodInjectionPoint(methodName, parameters) {

		//----------------------       Private / Protected Properties       ----------------------//
		this._methodName = methodName;
		this.parameters = parameters;
	}

	MethodInjectionPoint.prototype = {
		applyInjection: function (target, targetType, injector) {
			var p = this.gatherParameterValues(target, targetType, injector);
			target[this._methodName].apply(target, p);
		},
		gatherParameterValues: function (target, targetType, injector) {
			return this.parameters.map(function (paramId, i) {
				var provider = injector.getProvider(paramId);
				if (!provider) {
					throw(new Error(
						'Injector is missing a mapping to handle injection into target "' +
						target + '" of type "' + getQualifiedClassName(targetType) + '". \
						Target dependency: ' + paramId + ', method: ' + this._methodName + ', parameter: ' + (i + 1)
					));
				}
				return provider.apply(targetType, injector);
			}.bind(this));
		}
	};
	module.exports = MethodInjectionPoint;
});