define(function (require) {
	var DescribeTypeJSON = require("./DescribeTypeJSON");
	//
	var NoParamsConstructorInjectionPoint = require("../typedescriptions/NoParamsConstructorInjectionPoint");
	var ConstructorInjectionPoint = require("../typedescriptions/ConstructorInjectionPoint");

	function DescribeTypeJSONReflector() {
		this._descriptor = new DescribeTypeJSON();
	}

	DescribeTypeJSONReflector.prototype = {
		getClass: function (value) {
			return value.constructor;
		},
		describeInjections: function (type) {
			var description = this._descriptor.getInstanceDescription(type);
			return this.addCtorInjectionPoint({}, description.parameters, description.name);
		},
		addCtorInjectionPoint: function (description, parameters, typeName) {
			if (!parameters.length) {
				description.ctor = new NoParamsConstructorInjectionPoint();
			} else {
				description.ctor = new ConstructorInjectionPoint(parameters);
			}
			return description;
		}
	};
	return DescribeTypeJSONReflector
});