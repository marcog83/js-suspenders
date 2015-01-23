(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else {
		root.jss = factory();
	}
}(this, function () {
	'use strict';
