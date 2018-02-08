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
        if (vars.isString(contents)) {
            contents = this.encode(contents);
        }

        if (contents instanceof RawHtml) {
            contents = contents.value;
        }

        if (contents instanceof HTMLElement) {
            if (element.children.length === 1 && contents.parentElement === element) {
                return;
            }

            this.clearContents(element);
            element.appendChild(contents);
            return;
        }

        if (contents instanceof HTMLCollection) {
            if (contents === element.children) {
                return;
            }

            this.clearContents(element);

            while(contents.length > 0) {
                element.appendChild(contents[0]);
            }

            return;
        }

        if (vars.isArray(contents)) {

            this.clearContents(element);

            for(var i = 0; i < contents.length; i++) {
                element.appendChild(contents[i]);
            }

            return;
        }

        element.innerHTML = contents;
    }

    function clearContents(element) {
        while (element.firstChild) {
            var child = element.firstChild;

            element.removeChild(child);
            child.parentElement = null;
        }
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