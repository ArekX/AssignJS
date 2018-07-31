// @import: core/base.js

lib(['config'], function CoreInspect(config) {

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
        getElementObject: getElementObject,
        isElementParent: isElementParent
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
        if (!isDefined(value)) {
            return false;
        }

        if (isString(value)) {
            return false;
        }

        return Array.isArray(value) || isDefined(value.length);
    }

    function isCompiledElement(element) {
        return (element[config.assignParam] || {}).compiled || false;
    }

    function getElementObject(element) {
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
            return isElementParent(elements, parent);
        }

        for(var i = 0; i < elements.length; i++) {
            if (isElementParent(elements[i], parent)) {
                return false;
            }
        }

        return true;
    }

    function isElementParent(element, parent)
    {
       if (isRawHtml(element)) {
          return element.toElement().parentElement === parent;
       }

       return element.parentElement === parent;
    }
});
