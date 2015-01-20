/**
 * Created by marco on 11/11/2014.
 */
define(function () {
    function ValueProvider(value, creatingInjector) {
        this._value = value;
        this._creatingInjector = creatingInjector;
    }

    ValueProvider.prototype = {
        apply: function () {
            return this._value;
        },
        destroy: function () {
            if (this._value && this._creatingInjector && this._creatingInjector.hasManagedInstance(this._value)) {
                this._creatingInjector.destroyInstance(this._value);
            }
            this._creatingInjector = null;
            this._value = null;
        }
    };
    return ValueProvider;
});