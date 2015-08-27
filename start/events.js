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
 * @returns {undefined}
 */
module.exports = function ($event, $logger, $response, userService, sessionService, messageService) {
    $event.listen("user.go.online", function (userId) {
        $logger.debug("User has just login. UserId: " + userId);
        userService.changeOnlineStatus(userId, "online", function () {
        });
        //broadcast to friends
        userService.find({id: userId}, function (err, onlineUser) {
            $response.toOnlineFriends(userId, {
                ns: "io:cloudchat:user:go:online",
                body: onlineUser
            });
        });
    });

    $event.listen("user.go.offline", function (userId) {
        userService.changeOnlineStatus(userId, "offline", function () {
        });
        //broadcast friends
        $response.toOnlineFriends(userId, {
            ns: "io:cloudchat:user:go:offline",
            body: userId
        });
    });

    $event.listen("socket.connection", function (socket) {
        var userId = sessionService.getUserIdBySocket(socket);
        userService.find({
            onlineStatus: "online"
        }, function (err, users) {
            var onlineFriends = [];
            var me = null;
            users.forEach(function (user) {
                if (user.id != userId) {
                    onlineFriends.push(user);
                } else {
                    me = user;
                }
            });
            var result = {
                user: me,
                onlineFriends: onlineFriends
            };
            //windowState
            $session = sessionService.get(userId);
            var deviceId = sessionService.getDeviceId(socket);
            var windowState = $session[deviceId];
            $logger.debug("WindowState: " + JSON.stringify(windowState));
            if (windowState != null && windowState.activeFriendId != null) {
                messageService.find({userIds: [windowState.activeFriendId, userId],
                    startIdx: 0,
                    length: 20},
                function (err, messages) {
                    result.messages = messages;
                    $response.echo(socket, {
                        ns: "io:cloudchat:auth:login",
                        stanza: "m",
                        body: result
                    });
                });
            } else {
                $response.echo(socket, {
                    ns: "io:cloudchat:auth:login",
                    stanza: "m",
                    body: result
                });
            }
        });
    });
};
