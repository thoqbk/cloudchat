/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Sep 17, 2015 10:08:02 PM
 * 
 * @param {type} stringService description
 * @param {type} socketService description
 */
function UserService(stringService, socketService) {

    var friends = null;
    var me = null;
    var users = [];

    this.setFriends = function (fs) {
        fs.forEach(function (f) {
            f.search = stringService.toFriendlyString(f.username + " " + f.fullName);
        });
        friends = fs;
        var newUsers = fs;
        if (me != null) {
            newUsers.push(me);
        }
        users = newUsers;
    };

    this.setMe = function (m) {
        me = m;
        m.search = stringService.toFriendlyString(m.username + " " + m.fullName);
        var meIdx = -1;
        for (var idx = 0; idx < users.length; idx++) {
            if (users[idx].id == m.id) {
                meIdx = idx;
                break;
            }
        }
        if (meIdx != -1) {
            users.splice(meIdx, 1, me);
        } else {
            users.push(me);
        }
    };

    this.getFriends = function () {
        return friends;
    };

    this.getFriendById = function (id) {
        var retVal = Q.defer();
        var friend = null;
        friends.forEach(function (f) {
            if (f.id == id) {
                friend = f;
            }
        });
        retVal.resolve(friend);
        return retVal.promise;
    };

    this.getMe = function () {
        return me;
    };

    /**
     * id,
     * ids
     * 
     * @param {type} filter
     * @param {type} callback
     * @returns {undefined}
     */
    this.find = function (filter, callback) {
        if (filter.id != null) {
            var user = null;
            users.forEach(function (u) {
                if (u.id == filter.id) {
                    user = u;
                }
            });
            callback(null, user);
        } else if (filter.ids != null) {
            var us = [];
            users.forEach(function (u) {
                if (filter.ids.indexOf(u.id) != -1) {
                    us.push(u);
                }
            });
            callback(null, us);
        } else {
            callback(null, users);
        }
    };

}