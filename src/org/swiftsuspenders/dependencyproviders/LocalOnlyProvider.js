/**
 * Created by marco on 11/11/2014.
 */
define(function (require) {
    var _ = require("lodash");
    var ForwardingProvider = require("./ForwardingProvider");

    function LocalOnlyProvider(provider) {
        ForwardingProvider.call(this, provider);
    }

    LocalOnlyProvider.prototype = _.create(ForwardingProvider.prototype, {
        constructor: LocalOnlyProvider

    });
    return LocalOnlyProvider;
});