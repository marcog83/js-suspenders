/**
 * Created by marco on 10/11/2014.
 */
define(function (require) {
    var Event = require("../../../core/events/Event");
    var _ = require("lodash");

    function MappingEvent(type, mappedType, mappedName, mapping) {
        Event.call(this, type);
        this.mappedType = mappedType;
        this.mappedName = mappedName;
        this.mapping = mapping;
    }

    MappingEvent.prototype = _.create(Event.prototype, {
        constructor: MappingEvent,
        clone: function () {
            return new MappingEvent(this.type, this.mappedType, this.mappedName, this.mapping);
        }
    });
    //
    MappingEvent.PRE_MAPPING_CREATE="PRE_MAPPING_CREATE";
    MappingEvent.POST_MAPPING_CREATE="POST_MAPPING_CREATE";
    MappingEvent.PRE_MAPPING_CHANGE="PRE_MAPPING_CHANGE";
    MappingEvent.POST_MAPPING_CHANGE="POST_MAPPING_CHANGE";
    MappingEvent.POST_MAPPING_REMOVE="POST_MAPPING_REMOVE";
    MappingEvent.MAPPING_OVERRIDE="MAPPING_OVERRIDE";
    //
    return MappingEvent;
});