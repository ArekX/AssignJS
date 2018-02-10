(function(core) {
    "use strict";

    function RawHtml() { }

    function Html() {}

    Html.prototype.setContents = setHtmlContents;
    Html.prototype.clearContents = clearContents;
    Html.prototype.encode = encodeHtmlContents;
    Html.prototype.wrapRawHtml = wrapRawHtmlContents;
    Html.prototype.parse = parseHtml;

    var vars = core.vars;
    core.html = new Html();
    return;

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

        if (element instanceof HTMLInputElement) {
            element.value = contents;
        } else {
            element.innerHTML = contents;
        }

        return clearedElements;
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

})(document.querySelector('script[data-assign-js-core]').$main);