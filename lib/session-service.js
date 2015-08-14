/**
 * Copyright (C) 2015, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Aug 04, 2015 12:04:22 AM
 *
 */
module.exports = SessionService;

function SessionService() {
    var socketNUserIdMap = {};
    var userIdNSocketsMap = {};
    var userIdNSessionDataMap = {};

    this.map = function (socket, userId) {
        socketNUserIdMap[socket] = userId;
        if (userIdNSocketsMap[userId] == null) {
            userIdNSocketsMap[userId] = [];
        }
        userIdNSocketsMap[userId].push(socket);
    };

    this.unmap = function (socket, userId) {
        delete socketNUserIdMap[socket];
        var sockets = userIdNSocketsMap[userId];
        if (sockets != null) {
            var socketIdx = sockets.indexOf(socket);
            if (socketIdx > -1) {
                sockets.splice(socketIdx, 1);
            }
        }
    };

    this.start = function (userId) {
        if (userIdNSessionDataMap[userId] == null) {
            userIdNSessionDataMap[userId] = {id: 111};
        }
    };

    this.destroy = function (userId) {
        delete userIdNSessionDataMap[userId];
        var sockets = userIdNSocketsMap[userId];
        if (sockets != null) {
            sockets.forEach(function (socket) {
                delete socketNUserIdMap[socket];
            });
        }
        delete userIdNSocketsMap[userId];
    };

    this.get = function (userId) {
        return userIdNSessionDataMap[userId];
    };

    this.getSocketsByUserId = function (userId) {
        return userIdNSocketsMap[userId];
    };

    this.has = function (userId) {
        return userIdNSocketsMap[userId] != null;
    };

    this.getUserIdBySocket = function (socket) {
        return socketNUserIdMap[socket];
    };
}
