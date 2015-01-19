define(function (require, exports, module) {
    'use strict';
    function TypeDescriptor(reflector, descriptionsCache) {
        this._descriptionsCache = descriptionsCache;
        this._reflector = reflector;
    }

    TypeDescriptor.prototype = {
        getDescription: function (type) {
            //get type description or cache it if the given type wasn't encountered before
            this._descriptionsCache[type] = this._descriptionsCache[type] || this._reflector.describeInjections(type);
            return this._descriptionsCache[type];
        },

        addDescription: function (type, description) {
            this._descriptionsCache[type] = description;
        }
    };
    module.exports = TypeDescriptor;
});