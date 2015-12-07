/* global __dirname */

/**
 * Copyright (C) 2015, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Jul 22, 2015 11:27:37 PM
 *
 */

//------------------------------------------------------------------------------
//  Members

var container = new (require("./lib/container.js"))();

require("./start/services")(container.register, container.registerClass);

var $config = container.resolve("$config");
var Input = require("./lib/Input");

var route = new (require("./lib/route.js"))();
require("./start/routes.js")(route);

var $logger = container.resolve("$logger");
var $event = container.resolve("$event");
var controllerLoader = container.build(require("./lib/controller-loader.js"));
var sessionService = container.resolve("sessionService");
//------------------------------------------------------------------------------
//  Initialize
$logger.info("-----");
$logger.info("Starting Cloudchat (c) 2015 Cloudchat.io");

require("./start/controllers.js").forEach(function (filePath) {
    controllerLoader.load(filePath);
});

var express = require("express");
var expressApp = express();
var http = require("http").createServer(expressApp);

//cloudchat.io client
expressApp.set("view engine", "jade");
expressApp.set("views", "./client/view");

expressApp.use(express.static(__dirname + "/client/public"));

//common js libraries
expressApp.get("/service/string-service.js", function (req, res) {
    res.sendFile(__dirname + "/lib/service/string-service.js");
});

expressApp.get("/script/q.js", function (req, res) {
    res.sendFile(__dirname + "/node_modules/q/q.js");
});



var loaderJsInString = null;
expressApp.get("/load", function (req, res) {
    if (loaderJsInString == null) {
        var fs = require("fs");
        loaderJsInString = fs.readFileSync("./client/public/script/loader.js.txt", "utf8");
    }
    var userId = req.query.userId;
    var compiledLoaderJsInString = loaderJsInString.replace(/\$\{meId\}/g, userId);
    //respond
    res.setHeader("Content-Type", "text/javascript");
    res.setHeader("Cache-Control", "no-cache");
    res.end(compiledLoaderJsInString);
});

expressApp.get("/", function (req, res) {
    if (req.query.userId == null || isNaN(req.query.userId)) {
        res.send("Missing or invalid userId");
    } else {
        res.render("index", {userId: req.query.userId});
    }
});

//socket IO
var socketIO = require("socket.io")(http);
http.listen($config.port);

socketIO.use(function (socket, next) {
    var userId = socket.handshake.query.userId;
    var deviceId = socket.handshake.query.deviceId;
    sessionService.map(socket, userId, deviceId);
    next();
});

var Response = require("./lib/response.js");

socketIO.on("connection", function (socket) {
    var userId = sessionService.getUserIdBySocket(socket);
    $event.fire("socket.connection", socket);
    socket.on("cloudchat", function (message) {
        //debug
        $logger.debug("Received message: " + JSON.stringify(message) + " from: " + userId + "; socketId: " + socket.id);

        var ns = message.ns;
        var actionPath = route.getActionPath(ns, message.stanza);
        var notFound = true;
        if (actionPath != null) {
            var controller = controllerLoader.getController(actionPath);
            var actionFx = controllerLoader.getAction(actionPath);

            if (controller != null && actionFx != null) {
                container.invoke(actionFx, controller, function (parameter) {
                    var retVal = null;
                    switch (parameter) {
                        case "$input":
                        {
                            retVal = new Input(userId, message, socket);
                            break;
                        }
                        case "$session":
                        {
                            retVal = sessionService.get(userId);
                            break;
                        }
                        default:
                        {

                        }
                    }
                    return retVal;
                });
                notFound = false;
            }
        }
        if (notFound) {
            $logger.debug("Action not found: " + ns + ", stanza: " + message.stanza);
        }
    });
    socket.on("disconnect", function () {
        sessionService.unmap(socket, userId);
    });
});

//register events
container.invoke(require("./start/events"));

//debug
var now = new Date();
var nowInString = now.getDate() + "/" + now.getMonth() + "/" + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
$logger.info("Start Cloudchat successfully at port: " + $config.port + ". " + nowInString);
$logger.info("-----");
//------------------------------------------------------------------------------
//  Utils
