/**
 * Created by marco on 11/11/2014.
 */
define(function (require) {
    var getQualifiedClassName = require("../../../core/getQualifiedClassName");


    function SingletonProvider(responseType, creatingInjector) {
        this._response = null;
        this._destroyed = false;
        this._responseType = responseType;
        this._creatingInjector = creatingInjector;
    }

    SingletonProvider.prototype = {
        apply: function () {
            this._response = this._response || this.createResponse(this._creatingInjector);
            return this._response;
        },
        createResponse: function (injector) {
            if (this._destroyed) {
                throw new Error("Forbidden usage of unmapped singleton provider for type " + getQualifiedClassName(this._responseType));
            }
            return injector.instantiateUnmapped(this._responseType);
        },
        destroy: function () {
            this._destroyed = true;
            if (this._response && this._creatingInjector && this._creatingInjector.hasManagedInstance(this._response)) {
                this._creatingInjector.destroyInstance(this._response);
            }
            this._creatingInjector = null;
            this._response = null;
        }
    };
    return SingletonProvider;
});