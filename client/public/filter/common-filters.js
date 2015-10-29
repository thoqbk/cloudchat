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
    }
};