/**
 * Created by marco on 10/11/2014.
 */
define(function (require) {
    var Event = require("../../core/events/Event");
    var _ = require("lodash");

    function InjectionEvent(type, instance, instanceType) {
        Event.call(this, type);
        this.instance = instance;
        this.instanceType = instanceType;

    }

    InjectionEvent.prototype = _.create(Event.prototype, {
        constructor: InjectionEvent,
        clone: function () {
            return new InjectionEvent(this.type, this.instance, this.instanceType);
        }
    });

    InjectionEvent.POST_INSTANTIATE = 'postInstantiate';

    InjectionEvent.PRE_CONSTRUCT = 'preConstruct';

    InjectionEvent.POST_CONSTRUCT = 'postConstruct';
    return InjectionEvent;
});