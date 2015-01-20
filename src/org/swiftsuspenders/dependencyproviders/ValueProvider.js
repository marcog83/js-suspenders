/**
 * Created by marco on 11/11/2014.
 */
define(function () {
    function ValueProvider(value, injector) {
        this._value = value;
        this.injector = injector;
    }

    ValueProvider.prototype = {
        apply: function () {
            return this._value;
        },
        destroy: function () {
            if (this._value && this.injector && this.injector.hasManagedInstance(this._value)) {
                this.injector.destroyInstance(this._value);
            }
            this.injector = null;
            this._value = null;
        }
    };
    return ValueProvider;
});