/**
 * Copyright (C) 2015, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Aug 06, 2015 21:43:22 PM
 *
 */

var Q = require("q");

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
     * 3. ids
     * 
     * @param {type} filter
     * @returns {undefined}
     */
    this.find = function (filter) {
        var retVal = Q.defer();
        //id
        if (filter["id"] != null) {
            var tempUsers = users.filter(function (user) {
                return user.id == filter["id"];
            });
            retVal.resolve(tempUsers.length == 1 ? tempUsers[0] : null);
            //return
            return retVal.promise;
        }
        //onlineStatus
        if (filter["onlineStatus"] != null) {
            var tempUsers = users.filter(function (user) {
                return user.onlineStatus == filter["onlineStatus"];
            });
            retVal.resolve(tempUsers);
            //return
            return retVal.promise;
        }
        //ids
        if (filter["ids"] != null) {
            var tempUsers = [];
            filter["ids"].forEach(function (id) {
                users.forEach(function (user) {
                    if (user.id == id) {
                        tempUsers.push(user);
                    }
                });
            });
            retVal.resolve(tempUsers);
            //return
            return retVal.promise;
        }
        //ELSE: all users
        retVal.resolve(users);
        //return
        return retVal.promise;
    };

    this.getFriendsById = function (id) {
        var retVal = Q.defer();
        var friends = users.filter(function (user) {
            return user.id != id;
        });
        retVal.resolve(friends);
        //return
        return retVal.promise;
    };

    this.update = function (user) {
        var retVal = Q.defer();
        users.forEach(function (tempUser) {
            if (user.id == tempUser.id) {
                tempUser.fullName = user.fullName;
                retVal.resolve(user.id);
            }
        });
        //return
        return retVal.promise;
    };

    this.getById = function (id) {
        var retVal = Q.defer();
        var tempUsers = users.filter(function (tempUser) {
            return tempUser.id == id;
        });
        retVal.resolve(tempUsers.length == 1 ? tempUsers[0] : null);
        //return
        return retVal.promise;
    };

    this.changeOnlineStatus = function (id, newStatus) {
        var retVal = Q.defer();

        var tempUsers = users.filter(function (user) {
            return user.id == id;
        });
        if (tempUsers.length == 1) {
            tempUsers[0].onlineStatus = newStatus;
            retVal.resolve();
        }
        //return
        return retVal.promise;
    };
}
