/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Aug 9, 2015 12:10:55 AM
 * 
 */

var $config = require("../config/app.js");

var Event = require("../lib/event.js");

var StringService = require("../lib/service/string-service.js");

var UserService = require("../lib/service/user-service.js");

var SessionService = require("../lib/session-service.js");

var MessageService = require("../lib/service/message-service.js");

var AuthenticationService = require("../lib/service/authentication-service.js");

var Response = require("../lib/response.js");

var _ = require("underscore");

var Q = require("q");

/**
 * 
 * @param {type} container
 * 
 * @returns {undefined}
 */
module.exports = function (container) {
    $logger = container.resolve("$logger");
    
    //get application mode
    var applicationMode = "full";//app+service
    process.argv.forEach(function (val) {
        if (val == "mode=service") {
            applicationMode = "service";
        }
        if (val == "mode=app") {
            applicationMode = "app";
        }
    });
    $config.applicationMode = applicationMode;
    
    $logger.info("Application mode: " + applicationMode);
    
    //Init default services
    container.register("$config", $config);
    container.registerByClass("stringService", StringService);

    if (applicationMode == "full") {
        container.registerByClass("$event", Event);
        container.registerByClass("$response", Response);
        container.registerByClass("sessionService", SessionService);
        
        container.registerByClass("userService", UserService);
        container.registerByClass("messageService", MessageService);
        container.registerByClass("authenticationService", AuthenticationService);
        
        //invoke extension services
        return require("../ext/services.js")(container);
    } else if (applicationMode == "app") {
        container.registerByClass("$event", Event);
        container.registerByClass("$response", Response);
        container.registerByClass("sessionService", SessionService);
        if (!_($config.remoteService.names).contains("userService")) {
            container.registerByClass("userService", UserService);
        }
        if (!_($config.remoteService.names).contains("messageService")) {
            container.registerByClass("messageService", MessageService);
        }
        if (!_($config.remoteService.names).contains("authenticationService")) {
            container.registerByClass("authenticationService", AuthenticationService);
        }                
        //invoke extension services
        var retVal = Q.defer();
        require("../ext/services.js")(container)
                .then(function () {
                    return require("../lib/cloud-service-client.js")(container);
                })
                .then(function () {
                    retVal.resolve();
                })
                .fail(function (error) {
                    retVal.reject(error);
                });
        return retVal.promise;
    } else {//service
        container.registerByClass("$event", Event);
        if (_($config.remoteService.names).contains("authenticationService")) {
            container.registerByClass("authenticationService", AuthenticationService);
        }
        if (_($config.remoteService.names).contains("userService")) {
            container.registerByClass("userService", UserService);
        }
        if (_($config.remoteService.names).contains("messageService")) {
            container.registerByClass("messageService", MessageService);
        }
        return require("../ext/services.js")(container);
    }
};