/**
 * Created by marco on 10/11/2014.
 */
define(function () {
    function Event(type, bubbles, cancelable) {
        this.type = type;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
        this.timeStamp = (new Date()).getTime();
        //
        this.defaultPrevented = false;
        this.propagationStopped = false;
        this.immediatePropagationStopped = false;
        this.removed = false;
        this.target;
        this.currentTarget;
        this.eventPhase = 0;
    }

    Event.prototype = {
        preventDefault: function () {
            this.defaultPrevented = true;
        },
        stopPropagation: function () {
            this.propagationStopped = true;
        },
        stopImmediatePropagation: function () {
            this.immediatePropagationStopped = this.propagationStopped = true;
        },
        remove: function () {
            this.removed = true;
        },
        clone: function () {
            return new Event(this.type, this.bubbles, this.cancelable);
        }
    };
    return Event;
});