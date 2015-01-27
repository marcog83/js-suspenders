/**
 * Created by marco.gobbi on 27/01/2015.
 */
define(function (require) {
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
	return Provider;
});