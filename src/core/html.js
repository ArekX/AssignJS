(function(core) {
    "use strict";

    function RawHtml() { }

    function Html() {}

    Html.prototype.contentTypes = {
        INTO_HTML: 'html',
        INTO_VALUE: 'value'
    };
    
    Html.prototype.setContents = setContents;
    Html.prototype.setHtmlContents = setHtmlContents;
    Html.prototype.setInputContents = setInputContents;
    Html.prototype.createTemplate = createElementTemplate;
    Html.prototype.create = createElement;
    Html.prototype.extend = extendElement;
    Html.prototype.clearContents = clearContents;
    Html.prototype.encode = encodeHtmlContents;
    Html.prototype.wrapRawHtml = wrapRawHtmlContents;
    Html.prototype.isInputElement = getIsInputElement;
    Html.prototype.parse = parseHtml;

    var vars = core.vars;
    core.html = new Html();
    return;

    function setContents(element, contents, into) {
        if (this.isInputElement(element) && into !== this.contentTypes.INTO_HTML) {
            return this.setInputContents(element, contents, into);
        } 
        return this.setHtmlContents(element, contents);
    }

    function setHtmlContents(element, contents) {
        var clearedElements = [];

        if (vars.isString(contents)) {
            contents = this.encode(contents);
            clearedElements = this.clearContents(element);
        }

        if (contents instanceof RawHtml) {
            contents = contents.value;
        }

        if (contents instanceof HTMLElement) {
            if (element.children.length === 1 && contents.parentElement === element) {
                return clearedElements;
            }

            clearedElements = this.clearContents(element);
            element.appendChild(contents);
            return clearedElements;
        }

        if (contents instanceof HTMLCollection) {
            if (contents === element.children) {
                return clearedElements;
            }

            clearedElements = this.clearContents(element);

            while(contents.length > 0) {
                element.appendChild(contents[0]);
            }

            return clearedElements;
        }

        if (vars.isArray(contents)) {
            clearedElements = this.clearContents(element);

            for(var i = 0; i < contents.length; i++) {
                element.appendChild(contents[i]);
            }

            return clearedElements;
        }

        element.innerHTML = contents;

        return clearedElements;
    }

    function setInputContents(element, contents, into) {
        if (contents instanceof RawHtml) {
            contents = contents.value;
        }

        element.value = contents;
        return [];
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
        if (options.attributes) {
            for(var attribute in options.attributes) {
                if (options.attributes.hasOwnProperty(attribute)) {
                    var setAttribute = attribute.replace(/([A-Z])/g, function(char){
                        return "-" + char.toLowerCase();
                    });

                    element.setAttribute(setAttribute, options.attributes[attribute]);
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

    function getIsInputElement(element) {
        return (element instanceof HTMLInputElement) || 
               (element instanceof HTMLSelectElement) ||
               (element instanceof HTMLTextAreaElement);
    }

})(document.querySelector('script[data-assign-js-core]').$main);