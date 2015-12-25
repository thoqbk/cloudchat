/* global __dirname */

/**
 * Copyright (C) 2015, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Jul 22, 2015 11:27:37 PM
 *
 */

var startTime = (new Date()).getTime();

var Q = require("q");
var container = new (require("./lib/container.js"))();//service container

var log4js = require("log4js");
log4js.configure("config/log4js.json");
var $logger = log4js.getLogger("app");
container.register("$logger", $logger);

$logger.info("-----");
$logger.info("Starting Cloudchat (c) 2015 Cloudchat.io");

require("./start/services.js")(container)
        .then(function(){
            container.flushLazyServiceClasses();
        })
        .then(function () {
            var $config = container.resolve("$config");
            if ($config.applicationMode == "app" || $config.applicationMode == "full") {
                return require("./lib/chat-server.js")(container);
            } else {
                return require("./lib/cloud-service-server.js")(container);
            }
        })
        .then(function () {
            var $config = container.resolve("$config");

            var $logger = container.resolve("$logger");

            //register events
            if ($config.applicationMode == "full" || $config.applicationMode == "app") {
                container.invoke(require("./start/chat-events.js"));
            }

            var now = new Date();
            var nowInString = now.getDate() + "/" + now.getMonth() + "/" + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            var appName = $config.applicationMode == "full" ? "Cloudchat" : ($config.applicationMode == "service" ? "Cloudchat-service" : "Cloudchat-app");
            $logger.info("Start " + appName + " successfully in " + (now.getTime() - startTime)
                    + "ms at port: " + ($config.applicationMode == "full" || $config.applicationMode == "app" ? $config.port : $config.remoteService.port)
                    + ". " + nowInString);
            $logger.info("-----");
        })
        .fail(function (err) {
            $logger.info("Start cloudchat FAIL. Reason: " + err);
        });



        