/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Aug 9, 2015 12:10:55 AM
 * 
 */

//config
var $config = require("../config/app.js");

//logger
var log4js = require("log4js");
log4js.configure("config/log4js.json");
var $logger = log4js.getLogger("app");

//event service
var Event = require("../lib/event.js");

//string service
var StringService = require("../lib/service/string-service.js");

//user service
var UserService = require("../lib/service/user-service.js");

//session service
var SessionService = require("../lib/session-service.js");

var MessageService = require("../lib/service/message-service.js");

var Response = require("../lib/response.js");

/**
 * 
 * @param {type} register
 * @param {type} registerClass
 * @returns {undefined}
 */
module.exports = function (register, registerClass) {
    register("$config", $config);
    register("$logger", $logger);
    registerClass("$event", Event);
    registerClass("stringService", StringService);
    registerClass("userService", UserService);
    registerClass("sessionService", SessionService);
    registerClass("messageService", MessageService);
    registerClass("$response", Response);
};