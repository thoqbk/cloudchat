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

var appConfig = require("./config/app");
var Input = require("./lib/Input");

var route = new (require("./lib/route"))();
require("./config/routes")(route);

var container = new (require("./lib/container"))();

require("./config/services")(container.register, container.registerClass);

var $logger = container.resolve("$logger");
var $event = container.resolve("$event");
var controllerLoader = container.build(require("./lib/controller-loader"));
var sessionService = container.resolve("sessionService");
//------------------------------------------------------------------------------
//  Initialize
$logger.info("-----");
$logger.info("Starting Cloudchat (c) 2015 Cloudchat.io");

appConfig.controllers.forEach(function (filePath) {
    controllerLoader.load(filePath);
});

var app = require("http").createServer();
var socketIO = require("socket.io")(app);
app.listen(appConfig.port);

socketIO.use(function (socket, next) {
    var userId = socket.handshake.query.userId;
    if (!sessionService.has(userId)) {
        sessionService.start(userId);
        $event.fire("auth.login", userId);
    }
    sessionService.map(socket, userId);
    next();
});

socketIO.on("connection", function (socket) {
    $event.fire("socket.connection", socket);
    socket.on("cloudchat", function (message) {
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
                            var userId = sessionService.getUserIdBySocket(socket);
                            retVal = new Input(userId, message, socket);
                            break;
                        }
                        case "$session":
                        {
                            var userId = sessionService.getUserIdBySocket(socket);
                            retVal = sessionService.get(userId);
                            break;
                        }
                        default:
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
});

//register events
container.invoke(require("./events"));

//debug
var now = new Date();
var nowInString = now.getDate() + "/" + now.getMonth() + "/" + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
$logger.info("Start Cloudchat successfully at port: " + appConfig.port + ". " + nowInString);
$logger.info("-----");
//------------------------------------------------------------------------------
//  Utils
