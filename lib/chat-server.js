/**
 * Initialize socket io and http server
 */

var Q = require("q");

var path = require('path');


module.exports = function (container) {

    var retVal = Q.defer();

    var $logger = container.resolve("$logger");
    var $config = container.resolve("$config");
    var $event = container.resolve("$event");
    var authenticationService = container.resolve("authenticationService");

    var Input = require("../lib/Input");

    var sessionService = container.resolve("sessionService");

    var route = new (require("../lib/route.js"))();
    require("../start/routes.js")(route);

    var controllerLoader = container.build(require("../lib/controller-loader.js"));

    require("../start/controllers.js").forEach(function (filePath) {
        controllerLoader.load(filePath);
    });

    var express = require("express");
    var expressApp = express();
    var http = require("http").createServer(expressApp);

    //cloudchat.io client
    expressApp.set("view engine", "jade");
    expressApp.set("views", "./client/view");

    expressApp.use(express.static(path.resolve(__dirname + "/../client/public")));

    //common js libraries
    expressApp.get("/service/string-service.js", function (req, res) {
        res.sendFile(path.resolve(__dirname + "/../lib/service/string-service.js"));
    });

    expressApp.get("/script/q.js", function (req, res) {
        res.sendFile(path.resolve(__dirname + "/../node_modules/q/q.js"));
    });

    var loaderJsInString = null;
    expressApp.get("/load", function (req, res) {
        if (loaderJsInString == null) {
            var fs = require("fs");
            loaderJsInString = fs.readFileSync(path.resolve(__dirname + "/../client/public/script/loader.js.txt"), "utf8");
        }
        var host = req.get("host");
        var userId = req.query.userId;
        var token = req.query.token;
        var compiledLoaderJsInString = loaderJsInString
                .replace(/\$\{host\}/g, host)
                .replace(/\$\{meId\}/g, userId)
                .replace(/\$\{token\}/g, token);
        //respond
        res.setHeader("Content-Type", "text/javascript");
        res.setHeader("Cache-Control", "no-cache");
        res.end(compiledLoaderJsInString);
    });

    expressApp.get("/", function (req, res) {
        if (req.query.userId == null || isNaN(req.query.userId)) {
            res.send("Missing or invalid userId");
        } else {
            res.render("index", {host: req.query.host,
                userId: req.query.userId,
                token: req.query.token});
        }
    });

    expressApp.get("/generate-jwt-token", function (req, res) {
        if (req.query.userId == null || isNaN(req.query.userId)) {
            res.send("Missing or invalid userId");
        } else {
            authenticationService.generateToken(req.query.userId)
                    .then(function (token) {
                        res.end(token);
                    })
                    .fail(function (error) {
                        res.end("Generate token fail. Reason: " + error);
                    });
        }
    });


    expressApp.get("/check-jwt-token", function (req, res) {
        if (req.query.userId == null || isNaN(req.query.userId)) {
            res.send("Missing or invalid userId");
        } else {
            authenticationService.check(req.query.userId, req.query.token)
                    .then(function (ok) {
                        res.end("" + ok);
                    })
                    .fail(function (error) {
                        res.end("Check token fail. Reason: " + error);
                    });
        }
    });

    //socket IO
    var socketIO = require("socket.io")(http);
    http.listen($config.port);

    socketIO.use(function (socket, next) {

        var userId = socket.handshake.query.userId;
        var token = socket.handshake.query.token;

        authenticationService.check(userId, token)
                .then(function (ok) {
                    if (ok) {
                        var deviceId = socket.handshake.query.deviceId;
                        sessionService.map(socket, userId, deviceId);
                        next();
                    } else {
                        next(new Error("Authentication fail."));
                    }
                })
                .fail(function (error) {
                    next(new Error("Authentication fail."));
                    //debug
                    $logger.debug("Authentication fail, userId: " + userId + ", token: " + token + ". Reason: " + error);
                });
    });

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

    retVal.resolve();

    return retVal.promise;
};