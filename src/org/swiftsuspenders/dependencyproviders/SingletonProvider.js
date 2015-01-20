/**
 * Created by marco on 11/11/2014.
 */
define(function (require) {


    function SingletonProvider(responseType, injector) {
        this._response = null;
        this._destroyed = false;
        this._responseType = responseType;
        this.injector = injector;
    }

    SingletonProvider.prototype = {
        apply: function () {
            this._response = this._response || this.createResponse(this.injector);
            return this._response;
        },
        createResponse: function (injector) {
            if (this._destroyed) {
                throw new Error("Forbidden usage of unmapped singleton provider for type " + this._responseType.toString());
            }
            return injector.instantiateUnmapped(this._responseType);
        },
        destroy: function () {
            this._destroyed = true;
            if (this._response && this.injector && this.injector.hasManagedInstance(this._response)) {
                this.injector.destroyInstance(this._response);
            }
            this.injector = null;
            this._response = null;
        }
    };
    return SingletonProvider;
});