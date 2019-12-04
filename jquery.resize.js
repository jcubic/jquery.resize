/**@license
 *
 * Custom resize jQuery event for element (version 1.1.0)
 *
 * Copyright (c) 2018-2019 Jakub T. Jankiewicz <https://jcubic.pl/me>
 * Released under the MIT license
 *
 */
/* global ResizeObserver, module, define, global, require */
(function(factory, undefined) {
    var root = typeof window !== 'undefined' ? window : global;
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        // istanbul ignore next
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function(root, jQuery) {
            if (jQuery === undefined) {
                // require('jQuery') returns a factory that requires window to
                // build a jQuery instance, we normalize how we use modules
                // that require this pattern but the window provided is a noop
                // if it's defined (how jquery works)
                if (window !== undefined) {
                    jQuery = require('jquery');
                } else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        // Browser
        // istanbul ignore next
        factory(root.jQuery);
    }
})(function($, undefined) {
    "use strict";
    // ----------------------------------------------------------------------------------
    // :: Cross-browser resize element plugin
    // :: usage:
    // :: to add callback use:
    // ::     $('node').resize(handler_function);
    // :: to remove use:
    // ::     $('node').resize('unbind', handler_function);
    // :: handler function in unbind is optional if omitted all handlers will be removed
    // ----------------------------------------------------------------------------------
    $.fn.resizer = function(callback) {
        var unbind = arguments[0] === "unbind";
        if (!unbind && !$.isFunction(callback)) {
            throw new Error(
                'Invalid argument, it need to a function or string "unbind".'
            );
        }
        if (unbind) {
            callback = $.isFunction(arguments[1]) ? arguments[1] : null;
        }
        return this.each(function() {
            var $this = $(this);
            var iframe;
            var callbacks;
            if (unbind) {
                callbacks = $this.data('callbacks');
                if (callback && callbacks) {
                    callbacks.remove(callback);
                    if (!callbacks.has()) {
                        callbacks = null;
                    }
                } else {
                    callbacks = null;
                }
                if (!callbacks) {
                    $this.removeData('callbacks');
                    if (window.ResizeObserver) {
                        var observer = $this.data('observer');
                        if (observer) {
                            observer.unobserve(this);
                            $this.removeData('observer');
                        }
                    } else {
                        iframe = $this.find('> iframe');
                        if (iframe.length) {
                            // just in case of memory leaks in IE
                            $(iframe[0].contentWindow).off('resize').remove();
                            iframe.remove();
                        }
                    }
                }
            } else if ($this.data('callbacks')) {
                $(this).data('callbacks').add(callback);
            } else {
                callbacks = $.Callbacks();
                callbacks.add(callback);
                $this.data('callbacks', callbacks);
                var resizer;
                var first = true;
                if (window.ResizeObserver) {
                    resizer = new ResizeObserver(function() {
                        if (!first) {
                            var callbacks = $this.data('callbacks');
                            callbacks.fire();
                        }
                        first = false;
                    });
                    resizer.observe(this);
                    $this.data('observer', resizer);
                } else {
                    this.css('position', 'relative');
                    var style = {
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        overflow: 'hidden',
                        'z-index': -1,
                        visibility: 'hidden',
                        height: '100%',
                        border: 'none',
                        padding: 0,
                        width: '100%'
                    };
                    iframe = $('<iframe/>').css(style).appendTo(this)[0];

                    $(iframe.contentWindow).on('resize', function() {
                        callbacks.fire();
                    });
                }
            }
        });
    };
    var window_events = $.Callbacks();
    // custom resize jQuery event with handling of default window resize and resizer
    // use $(DOM).on('resize', function() {});
    // or  $(DOM).off('resize', function() {});
    $.event.special.resize = {
        setup: function(data, namespaces, eventHandle) {
            if (this === window) {
                window.addEventListener('resize', eventHandle);
                $(window).data('handler', eventHandle);
            }
        },
        teardown: function() {
            if (this === window) {
                var eventHandle = $(window).data('handler');
                window.removeEventListener('resize', eventHandle);
            }
        },
        add: function(handleObj) {
            if (this === window) {
                window_events.add(handleObj.handler);
            } else {
                $(this).resizer(handleObj.handler);
            }
        },
        remove: function(handleObj) {
            if (this === window) {
                if (!handleObj.handler) {
                    window_events.empty();
                } else {
                    window_events.remove(handleObj.handler);
                }
            } else {
                $(this).resizer('unbind', handleObj.handler);
            }
        },
        handle: function(event, data) {
            window_events.fireWith(window, event, data);
        }
    };
});
