// @import: core/vars.js

"use strict";

lib(['vars'], function(vars) {

    function RawHtml() { }

    this.html = {
        contentTypes: {
            TYPE_HTML: 'html',
            TYPE_VALUE: 'value'
        },
        getContents: getContents,
        getHtmlContents: getHtmlContents,
        getInputContents: getInputContents,
        getAttributeContents: getAttributeContents,
        setContents: setContents,
        setAttributeContents: setAttributeContents,
        setHtmlContents: setHtmlContents,
        setInputContents: setInputContents,
        createTemplate: createElementTemplate,
        create: createElement,
        extend: extendElement,
        clearContents: clearContents,
        encode: encodeHtmlContents,
        wrapRawHtml: wrapRawHtmlContents,
        parse: parseHtml
    };

    return;

    function getContents(element, from) {
        if (vars.isInputElement(element) && from !== this.contentTypes.TYPE_HTML) {
            return this.getInputContents(element);
        } 

        if (vars.isString(from) && from[0] === '[') {
            return this.getAttributeContents(element, from.substr(1, from.length - 2));
        }

        return this.getHtmlContents(element);
    }

    function setContents(element, contents, into) {
        if (vars.isString(into) && into[0] === '[') {
            return this.setAttributeContents(element, contents, into.substr(1, into.length - 2));
        }

        if (this.isInputElement(element) && into !== this.contentTypes.TYPE_HTML) {
            return this.setInputContents(element, contents, into);
        } 

        return this.setHtmlContents(element, contents);
    }

    function setHtmlContents(element, contents) {
        var clearedElements = [];

        if (vars.isString(contents)) {
            contents = this.encode(contents);
            clearedElements = this.clearContents(element);
        } else if (contents instanceof RawHtml) {
            contents = contents.value;
        }

        if (contents instanceof HTMLElement) {
            if (element.children.length === 1 && contents.parentElement === element) {
                return clearedElements;
            }

            clearedElements = this.clearContents(element);
            element.appendChild(contents);
            return clearedElements;
        } else if (contents instanceof HTMLCollection) {
            if (contents === element.children) {
                return clearedElements;
            }

            clearedElements = this.clearContents(element);

            while(contents.length > 0) {
                element.appendChild(contents[0]);
            }

            return clearedElements;
        } else if (vars.isArray(contents)) {
            clearedElements = this.clearContents(element);
            var addedChildElements = false;

            for(var i = 0; i < contents.length; i++) {
                var item = contents[i];

                if (item instanceof HTMLElement) {
                    element.appendChild(contents[i]);
                    addedChildElements = true;
                }
            }

            if (addedChildElements) {
                return clearedElements;
            }
        } else {
            clearedElements = this.clearContents(element);
            element.innerHTML = contents;
        }


        return clearedElements;
    }

    function getHtmlContents(element) {
        return element.innerHTML;
    }

    function setInputContents(element, contents, into) {
        if (contents instanceof RawHtml) {
            contents = contents.value;
        }

        if (vars.isArray(contents) && element.options && element.multiple) {
            for(var i = 0; i < element.options.length; i++) {
                element.options[i].selected = contents.indexOf(element.options[i].value) !== -1;
            }

            return [];
        }

        element.value = contents;
        return [];
    }

    function getInputContents(element) {
        if (element.options && element.multiple) {
            var values = [];

            for(var i = 0; i < element.options.length; i++) {
                var option = element.options[i];
                if (option.selected) {
                    values.push(option.value);    
                }
            }

            return values;
        }

        return element.value;
    }

    function setAttributeContents(element, contents, attribute) {
        if (attribute.length > 0) {
            element.setAttribute(attribute, contents);
        }
        return [];
    }

    function getAttributeContents(element, attribute) {
        return element.getAttribute(attribute);
    }

    function clearContents(element) {
        var removedChildren = [];
        while (element.firstChild) {
            var child = element.firstChild;
            
            element.removeChild(child);

            if (child instanceof HTMLElement) {
                removedChildren.push(child);
            }
        }

        return removedChildren;
    }

    function encodeHtmlContents(contents) {
        return contents.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
    }

    function wrapRawHtmlContents(contents) {
        return Object.create(RawHtml.prototype, { 
            value: {
                value: contents, 
                writable: false
            } 
        });
    }

    function parseHtml(wrapperTag, contents) {
        var tag = vars.isString(wrapperTag) ? document.createElement(wrapperTag) : wrapperTag;
        this.setContents(tag, vars.isString(contents) ? this.wrapRawHtml(contents) : contents);
        return tag;
    }

    function createElement(tag, contents, options) {
        var el = document.createElement(tag);

        if (!vars.isDefined(options) && vars.isPlainObject(contents)) {
            options = contents;
        }

        if (vars.isDefined(contents) && !vars.isPlainObject(contents)) {
            this.setContents(el, contents);
        }

        if (options) {
            this.extend(el, options);
        }

        return el;
    }

    function extendElement(element, options) {
        if (options.attrs) {
            for(var attribute in options.attrs) {
                if (options.attrs.hasOwnProperty(attribute)) {
                    var setAttribute = attribute.replace(/([A-Z])/g, function(char){
                        return "-" + char.toLowerCase();
                    });

                    element.setAttribute(setAttribute, options.attrs[attribute]);
                }
            }
        }

        if (options.events) {
            for(var event in options.events) {
                if (options.events.hasOwnProperty(event)) {
                    var value = options.events[event];

                    if (vars.isArray(value)) {
                        element.addEventListener.apply(el, [event].concat(value));
                    } else {
                        element.addEventListener(event, value);
                    }
                }
            }
        }

        if (options.style) {
            var styleString = "";
            for(var style in options.style) {
                if (options.style.hasOwnProperty(style)) {
                    var setStyle = style.replace(/([A-Z])/g, function(char) {
                        return "-" + char.toLowerCase();
                    });
                    styleString += setStyle + ':' + options.style[style] + ';';
                }
            }

            element.setAttribute('style', styleString);
        }
    }

    function createElementTemplate(tag, contents, options) {
        var self = this;

        if (!vars.isDefined(options) && vars.isPlainObject(contents)) {
            options = contents;
        } else {
            options = vars.defaultValue(options, {});
        }

        options = vars.merge({}, options);

        ElementTemplate.tag = tag;
        ElementTemplate.contents = vars.defaultValue(contents, null);
        ElementTemplate.options = options;

        return ElementTemplate;

        function ElementTemplate(overrideContents, overrideOptions) {
            var useOverrideOptions = {};
            var useOverrideContents = null;

            if (!vars.isDefined(overrideOptions) && vars.isPlainObject(overrideContents)) {
                useOverrideOptions = overrideContents;
            }

            if (vars.isDefined(overrideContents) && !vars.isPlainObject(overrideContents)) {
                useOverrideContents = overrideContents;
            }

            var useOptions = vars.merge({}, options, overrideOptions);

            return self.create(tag, useOverrideContents || contents, useOptions);
        }
    }
});