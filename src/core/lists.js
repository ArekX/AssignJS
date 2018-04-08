// @import: core/vars.js

"use strict";

lib(['vars'], function(vars) {

    this.lists = {
        each: forEach,
        map: mapItems,
        mapBy: mapBy,
        column: getItemsColumn,
        indexBy: indexItemsBy
    };

    return;

    function forEach(list, iterator) {
        if (vars.isPlainObject(list)) {
            for(var name in list) {
                if (!list.hasOwnProperty(name)) {
                    continue;
                }

                iterator(list[name], name);
            }

            return;
        }

        [].forEach.call(list, iterator);
    }

    function mapItems(items, mapper) {
        if (items.map) {
            return items.map(mapper);
        }

        return items;
    }

    function mapBy(items, mapKey, mapValue) {
        var mapped = {};

        this.each(items, function(item) {
            mapped[item[mapKey]] = item[mapValue];
        });

        return mapped;
    }

    function getItemsColumn(items, columnName) {
        return this.map(items, function(item) {
            return item[columnName];
        });
    } 

    function indexItemsBy(items, key) {
        var mapped = {};

        this.each(items, function(item) {
            mapped[item[key]] = item;
        });

        return mapped;
    }

});