// @import: core/assert.js
// @import: core/lists.js

"use strict";

lib(['assert', 'lists'], function(assert, lists) {

    this.object = {
        create: createObject,
        mixin: mixinObject,
        isInstance: isInstance
    };
    return;

    function createObject(ob, params) {
        var obItem = Object.create(ob);
        obItem.init && obItem.init.apply(obItem, params);
        return obItem;
    }

    function mixinObject(type, withTypes) {
        var allMixins = withTypes.concat([type]);
        var newObject = createObject(type, {__mixins__: {value: allMixins}});

        lists.each(allMixins, function(withType) {
            lists.each(withType, function(value, name) {
                newObject[name] = value;
            });
        });

        return newObject;
    }

    function isInstance(object, ofType) {
        if (ofType.__mixins__) {
            for(var i = 0; i < ofType.__mixins__.length; i++) {
                if (object.__proto__ === ofType.__mixins__[i]) {
                    return true;
                }
            }
        }

        return object.__proto__ === ofType;
    }

});