/**
 * Copyright (C) 2015, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Aug 04, 2015 12:04:22 AM
 *
 */
module.exports = SessionService;

function SessionService($event, $config, $logger) {

    var self = this;

    var userIdNOuttimeMap = {};//watch session

    var socketNUserIdMap = {};
    var socketNDeviceIdMap = {};
    var userIdNSocketsMap = {};
    var userIdNSessionDataMap = {};

    this.map = function (socket, userId, deviceId) {
        socketNUserIdMap[socket] = userId;
        var sockets = userIdNSocketsMap[userId];
        if (sockets == null) {
            sockets = [];
            userIdNSocketsMap[userId] = sockets;
        }
        sockets.push(socket);
        //check watch list
        var b1 = userIdNOuttimeMap[userId] == null;
        if (b1 && sockets.length == 1) {
            //user go online
            this.start(userId);
        }
        //remove user from watch list
        if (!b1) {
            delete userIdNOuttimeMap[userId];
        }
        //device
        if (deviceId != null) {
            socketNDeviceIdMap[socket] = deviceId;
        }
    };

    this.unmap = function (socket, userId) {
        delete socketNUserIdMap[socket];
        delete socketNDeviceIdMap[socket];
        var sockets = userIdNSocketsMap[userId];
        if (sockets != null) {
            var socketIdx = sockets.indexOf(socket);
            if (socketIdx > -1) {
                sockets.splice(socketIdx, 1);
            }
        }
        if (sockets.length == 0) {
            userIdNOuttimeMap[userId] = (new Date()).getTime();
        }
    };

    this.start = function (userId) {
        if (userIdNSessionDataMap[userId] == null) {
            userIdNSessionDataMap[userId] = {};
        }
        $event.fire("user.go.online", userId);
    };

    this.destroy = function (userId) {
        $event.fire("user.going.offline", userId);
        delete userIdNSessionDataMap[userId];
        delete userIdNOuttimeMap[userId];
        var sockets = userIdNSocketsMap[userId];
        if (sockets != null) {
            sockets.forEach(function (socket) {
                delete socketNUserIdMap[socket];
                delete socketNDeviceIdMap[socket];
            });
        }
        delete userIdNSocketsMap[userId];
        //fire event
        $event.fire("user.go.offline", userId);
    };

    this.get = function (userId) {
        return userIdNSessionDataMap[userId];
    };

    this.getSocketsByUserId = function (userId) {
        return userIdNSocketsMap[userId];
    };

    this.getDeviceId = function (socket) {
        return socketNDeviceIdMap[socket];
    };

    this.has = function (userId) {
        return userIdNSocketsMap[userId] != null;
    };

    this.getUserIdBySocket = function (socket) {
        return socketNUserIdMap[socket];
    };

    //validate sessions
    setInterval(checkUsersOnlineStatus, $config.sessionChecker.period);

    //--------------------------------------------------------------------------
    //  Utils
    function checkUsersOnlineStatus() {
        var offlineUserIds = [];
        var now = (new Date()).getTime();
        for (var userId in userIdNOuttimeMap) {
            var outTime = userIdNOuttimeMap[userId];
            if (now - outTime > $config.sessionChecker.timeout) {
                offlineUserIds.push(userId);
                //debug
                $logger.debug("User go offline, userId: " + userId);
            }
        }
        offlineUserIds.forEach(function (offlineUserId) {
            self.destroy(offlineUserId);
        });
    }
}
