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
 * @param {type} container
 * 
 * @returns {undefined}
 */
module.exports = function (container) {
    container.register("$config", $config);
    container.registerByClass("$event", Event);
    container.registerByClass("stringService", StringService);
    container.registerByClass("userService", UserService);
    container.registerByClass("sessionService", SessionService);
    container.registerByClass("messageService", MessageService);
    container.registerByClass("$response", Response);

    //invoke extension services
    return require("../ext/services.js")(container);
};