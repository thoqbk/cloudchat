/* global _ */

/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Oct 17, 2015 3:56:57 PM
 * 
 */
var CommonFilters = {
    timestampToDate: function (input) {
        return new Date(input);
    },
    dateToString: function (input, withYear) {
        var retVal = input.getDate() + "/" + (input.getMonth() + 1);
        if (withYear) {
            retVal += "/" + input.getFullYear();
        }
        return retVal;
    },
    timeToString: function (input, withSecond) {
        var retVal = input.getHours() + ":" + input.getMinutes();
        if (withSecond) {
            retVal += ":" + input.getSeconds();
        }
        return retVal;
    },
    toShortName: function (input, maxLength) {
        var retVal = "";
        if (input == null || input == "") {
            return retVal;
            ;
        }
        //ELSE:
        var regex = /(\b\w|[A-Z])/g;
        var chars = [];
        var found = null;
        while ((found = regex.exec(input)) != null) {
            chars.push(found[0]);
        }
        _.first(chars, maxLength == null ? 2 : maxLength).forEach(function (c) {
            retVal += c;
        });
        //return
        return retVal;
    }
};