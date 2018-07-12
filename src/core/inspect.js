// @import: core/base.js
// @import: core/html.js

lib(['config', 'html'], function CoreInspect(config, html) {
    
    var plainObjectConstructor = ({}).constructor;

    this.inspect = {
        isEmpty: isEmpty,
        isObject: isObject,
        isPlainObject: isPlainObject,
        isNumber: isNumber,
        isString: isString,
        isDefined: isDefined,
        isBoolean: isBoolean,
        isFunction: isFunction,
        isIterable: isIterable,
        isArray: isArray,
        isElement: isElement,
        isInputElement: isInputElement,
        isElementList: isElementList,
        isCompiledElement: isCompiledElement,
        getCompiledObject: getCompiledObject,
        isElementParent: isElementParent,
        isRawHtml: isRawHtml
    };

    return;

    function isEmpty(value) {
        return !isFunction(value) && (
                   value === "" ||
                   value === "0" ||
                   value === 0 ||
                   value === null ||
                   value === undefined ||
                   (isObject(value) && Object.keys(value).length == 0)
               );
    }

    function isFunction(value) {
        return typeof value === "function";
    }

    function isArray(value) {
        return isObject(value) && value.constructor === Array;
    }

    function isPlainObject(value) {
        return isObject(value) && plainObjectConstructor === value.constructor;
    }

    function isObject(value) {
        return typeof value === "object";
    }

    function isNumber(value) {
        return typeof value === "number";
    }

    function isDefined(value) {
        return typeof value !== "undefined";
    }

    function isString(value) {
        return typeof value === "string";
    }

    function isBoolean(value) {
        return typeof value === "boolean";  
    }

    function isElement(value) {
        return value instanceof HTMLElement;
    }

    function isInputElement(value) {
        return isElement(value) && (
                (element instanceof HTMLInputElement) || 
                (element instanceof HTMLSelectElement) ||
                (element instanceof HTMLTextAreaElement)
        );
    }

    function isIterable(value) {
        return Array.isArray(value) ||
            (
                ('0' in value) 
                && ('length' in value) 
                && ((value.length - 1).toFixed(0) in value)
            );
    }

    function isCompiledElement(element) {
        return (element[config.assignParam] || {}).compiled || false;
    }

    function getCompiledObject(element) {
        if (!isCompiledElement(element)) {
            return null;
        }

        return element[config.assignParam];
    }

    function isElementList(element) {
        return (element instanceof NodeList) || (element instanceof HTMLCollection);
    }

    function isElementParent(elements, parent) {
        if (!isElementList(elements)) {
            return elements.parentElement === parent;
        }

        for(var i = 0; i < elements.length; i++) {
            if (elements[i].parentElement !== parent) {
                return false;
            }
        }

        return true;
    }

    function isRawHtml(contents) {
        return contents instanceof html._rawHtmlConstructor;
    }
});