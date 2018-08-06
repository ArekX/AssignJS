// @import: core

lib(['io', 'inspect', 'html', 'object'], function IoBase(io, inspect, html, object) {

    io.addHandler('io.html', /\~html/, {
         init: init,
         read: read,
         write: write,
         shouldWrite: shouldWrite
    });

    function init() {
        return {
            oldContents: null
        };
    }

    function read() {
        return this.element.innerHTML;
    }

    function write(contents) {
        this.oldContents = null;
        var element = this.element;

        var oldChildrenParents = [];
        var oldChildren = [];
        for(var i = 0; i < element.children.length; i++) {
           oldChildren.push(element.children[i]);
           oldChildrenParents.push(element.children[i].parentElement);
        }

        element.innerHTML = '';

        if (contents && inspect.isIterable(contents)) {
            for (var i = 0; i < contents.length; i++) {
                writeItem(element, contents[i]);
            }

            checkRemovedChildren();
            return;
        }

        this.oldContents = contents;
        writeItem(element, contents);
        checkRemovedChildren();

        function checkRemovedChildren() {
            while(oldChildren.length) {
                var child = oldChildren.shift();
                var oldChildParent = oldChildrenParents.shift();

                var r = inspect.getElementObject(child);

                if (r === null) {
                   continue;
                }

                if (oldChildParent !== child.parentElement) {
                    r.parentChanged && r.parentChanged(oldChildParent, child.parentElement);
                }
            }
        }
    }

    function writeItem(element, contents) {
        if (html.isRawHtml(contents)) {
           contents = contents.toElement();
        }

        if (!(contents instanceof Node)) {
           contents = html.toTextNode(contents);
        }

        element.appendChild(contents);
    }

    function shouldWrite(contents) {
        if (inspect.isElementList(contents) &&
            inspect.isElementParent(contents, this.element)) {
            return false;
        }

        if (this.oldContents === null) {
           return true;
        }

        return this.oldContents !== contents;
    }
});
