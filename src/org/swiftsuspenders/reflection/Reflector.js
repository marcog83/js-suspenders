define(function (require) {
	var ConstructorInjectionPoint = require("../typedescriptions/ConstructorInjectionPoint");

	function capitalize(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	function findConstructorParams(target) {
		var inject = [];
		if (target.length) {
			var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
			var FN_ARG_SPLIT = /,/;
			var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
			var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
			var fnText = target.toString().replace(STRIP_COMMENTS, '');
			var argDecl = fnText.match(FN_ARGS);
			argDecl[1].split(FN_ARG_SPLIT).forEach(function (arg) {
				arg.replace(FN_ARG, function (all, _, name) {
					inject.push(capitalize(name));
				});
			});
		}
		return inject;
	}

	function getInstanceDescription(type) {
		var parameters = [];
		if (_.isArray(type)) {
			parameters = type.slice(0, -1);
		}
		if (_.isString(type)) {
			parameters = [];
		}
		if (_.isFunction(type)) {
			parameters = findConstructorParams(type);
		}
		return parameters;
	}

	return {
		describeInjections: function (type) {
			var parameters = getInstanceDescription(type);
			console.log("describeInjections:", type, parameters);
			return {
				ctor: new ConstructorInjectionPoint(parameters)
			}
		}
	}
});