/**
 * Copyright (C) 2015, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Aug 06, 2015 21:43:22 PM
 *
 */

module.exports = UserService;

var users = [{
        id: 23,
        username: "thoqbk",
        fullName: "Luong Quy Tho",
        onlineStatus: "offline",
        avatarPath: "/image/avatar.png"
    }, {
        id: 64,
        username: "hiencolla",
        fullName: "HienColla",
        onlineStatus: "offline",
        avatarPath: "/image/avatar.png"
    }, {
        id: 66,
        username: "honghanh",
        fullName: "Hồng Hạnh",
        onlineStatus: "offline",
        avatarPath: "/image/avatar.png"
    }, {
        id: 67,
        username: "phanhao",
        fullName: "Phan Hảo",
        onlineStatus: "offline",
        avatarPath: "/image/avatar.png"
    }, {
        id: 68,
        username: "tiendung",
        fullName: "Tiến Dũng",
        onlineStatus: "offline",
        avatarPath: "/image/avatar.png"
    }, {
        id: 69,
        username: "tranphuong",
        fullName: "Trần Phương",
        onlineStatus: "offline",
        avatarPath: "/image/avatar.png"
    }, {
        id: 71,
        username: "thanhtam",
        fullName: "Thanh Tâm",
        onlineStatus: "offline",
        avatarPath: "/image/avatar.png"
    }, {
        id: 72,
        username: "thuthao",
        fullName: "Thu Thảo",
        onlineStatus: "offline",
        avatarPath: "/image/avatar.png"
    }, {
        id: 220,
        username: "linhnana",
        fullName: "Linhnana",
        onlineStatus: "offline",
        avatarPath: "/image/avatar.png"
    }];

function UserService() {
    /**
     * 1. id
     * 2. onlineStatus
     * 
     * @param {type} filter
     * @param {type} callback (err, result)
     * @returns {undefined}
     */
    this.find = function (filter, callback) {
        //id
        if (filter["id"] != null) {
            var retVal = null;
            users.forEach(function (user) {
                if (user.id == filter["id"]) {
                    retVal = user;
                }
            });
            callback(null, retVal);
        }
        //onlineStatus
        var retVal = [];
        if (filter["onlineStatus"] != null) {
            users.forEach(function (user) {
                if (user.onlineStatus == filter["onlineStatus"]) {
                    retVal.push(user);
                }
            });
        }
        callback(null, retVal);
    };

    this.changeOnlineStatus = function (id, newStatus, callback) {
        this.find({id: id}, function (err, user) {
            if (err != null) {
                callback(err);
            } else {
                user.onlineStatus = newStatus;
                callback(null);
            }
        });
    };
}