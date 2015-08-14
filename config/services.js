/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Aug 9, 2015 12:10:55 AM
 * 
 */

//logger
var log4js = require("log4js");
log4js.configure("./config/log4js.json");
var $logger = log4js.getLogger("app");

//event service
var Event = require("../lib/event");

//user service
var UserService = require("../lib/service/user-service.js");

//session service
var SessionService = require("../lib/session-service.js");

/**
 * 
 * @param {type} register
 * @param {type} registerClass
 * @returns {undefined}
 */
module.exports = function (register, registerClass) {
    register("$logger", $logger);
    registerClass("$event", Event);
    registerClass("userService", UserService);
    registerClass("sessionService", SessionService);
};