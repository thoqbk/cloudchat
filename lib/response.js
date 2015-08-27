/**
 * Copyright (C) 2015, Cloudchat
 *
 * Released under the MIT license
 * Tho Q Luong, 22:48 August 21, 2015
 */

module.exports = Response;

function Response(userService, sessionService) {

    var self = this;

    this.toOnlineFriends = function (userId, message, callback) {
        userService.find({onlineStatus: "online"}, function (err, users) {
            users.forEach(function (user) {
                if (user.id != userId) {
                    self.to(user.id, message, callback);
                }
            });
        });
    };

    this.to = function (userId, message, callback) {
        var sockets = sessionService.getSocketsByUserId(userId);
        if (sockets != null) {
            sockets.forEach(function (socket) {
                socket.emit("cloudchat", message);
            });
            if (callback != null) {
                callback();
            }
        }
    };

    this.echo = function (socket, message, callback) {
        socket.emit("cloudchat",message);
        if (callback != null) {
            callback();
        }
    };
}
