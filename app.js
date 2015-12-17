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
        .then(function () {
            return require("./start/http-server.js")(container);
        })
        .then(function () {
            var $config = container.resolve("$config");

            var $logger = container.resolve("$logger");

            //register events
            container.invoke(require("./start/events"));

            var now = new Date();
            var nowInString = now.getDate() + "/" + now.getMonth() + "/" + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            $logger.info("Start Cloudchat successfully in " + (now.getTime() - startTime) + "ms at port: " + $config.port + ". " + nowInString);
            $logger.info("-----");
        })
        .fail(function (err) {
            $logger.info("Start cloudchat FAIL. Reason: " + err);
        });