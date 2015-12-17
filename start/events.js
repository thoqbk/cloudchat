/**
 * Copyright (C) 2015, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Aug 05, 2015 11:43:22 PM
 *
 */

/**
 * 
 * @param {type} $event
 * @param {type} $logger
 * @param {type} $response
 * @param {type} userService
 * @param {type} sessionService
 * @param {type} messageService
 * @param {type} $config
 * @returns {undefined}
 */
module.exports = function ($event, $logger, $response, userService,
        sessionService, messageService, $config) {
    $event.listen("user.go.online", function (userId) {
        $logger.debug("User has just login. UserId: " + userId);
        userService.changeOnlineStatus(userId, "online", function () {
        });
        //broadcast to friends
        $response.toOnlineFriends(userId, {
            stanza: "m",
            ns: "io:cloudchat:user:go:online",
            body: userId
        });
    });

    $event.listen("user.go.offline", function (userId) {
        userService.changeOnlineStatus(userId, "offline", function () {
        });
        //broadcast friends
        $response.toOnlineFriends(userId, {
            stanza: "m",
            ns: "io:cloudchat:user:go:offline",
            body: userId
        });
    });

    $event.listen("socket.connection", function (socket) {
        var userId = sessionService.getUserIdBySocket(socket);
        
        userService.find({}).then(function (users) {
            var friends = [];
            var me = null;
            users.forEach(function (user) {
                if (user.id != userId) {
                    friends.push(user);
                } else {
                    me = user;
                }
            });
            var result = {
                me: me,
                friends: friends,
                serverTimestamp: (new Date()).getTime(),
                nodeId: $config.nodeId,
                clearClientCacheIfNodeIdChanges: $config.client.clearClientCacheIfNodeIdChanges,
                cacheInterval: $config.client.cacheInterval
            };
            
            $response.echo(socket, {
                ns: "io:cloudchat:auth:login",
                stanza: "m",
                body: result
            });
        });
    });

    //invoke extension events
    require("../ext/events.js")($event, $logger, $response, userService,
            sessionService, messageService, $config);
};
