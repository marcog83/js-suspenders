/**
 * Created by marco on 11/11/2014.
 */
define(function (require) {
    var _ = require("lodash");
    var ForwardingProvider = require("./ForwardingProvider");

    function SoftDependencyProvider(provider) {
        ForwardingProvider.call(this, provider);
    }

    SoftDependencyProvider.prototype = _.create(ForwardingProvider.prototype, {
        constructor: SoftDependencyProvider

    });
    return SoftDependencyProvider;
});