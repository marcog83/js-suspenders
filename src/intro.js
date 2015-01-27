(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(["lodash"], factory);
	} else {
		root.jss = factory(window._);
	}
}(this, function (_) {
	'use strict';
