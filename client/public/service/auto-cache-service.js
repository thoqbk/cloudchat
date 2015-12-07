/* global _ */

/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Nov 8, 2015 3:12:42 PM
 * 
 */

function AutoCacheService() {

    var MAX_CACHED_MESSAGES = 100;
    var MAX_CACHED_CHATS = 5;

    var chats = null;
    var me = null;
    var friends = null;

    var recentChatsKey = null;
    var activeFriendIdKey = null;
    var lastActiveTimeKey = null;
    var nodeIdKey = null;

    this.configure = function (m, fs, cs) {
        friends = fs;
        me = m;
        chats = cs;
        recentChatsKey = "cloudchat." + me.id + ".recentChats";
        activeFriendIdKey = "cloudchat." + me.id + ".activeFriendId";
        lastActiveTimeKey = "cloudchat." + me.id + ".lastActiveTime";
        nodeIdKey = "cloudchat." + me.id + ".nodeId";
        activeFriendId = this.getActiveFriendId();
        //add recentChats
        _.each(getRecentChats(), function (recentChat) {
            chats.push(recentChat);
        });
    };

    this.getActiveFriendId = function () {
        return localStorage.getItem(activeFriendIdKey);
    };

    this.saveActiveFriendId = function (friendId) {
        localStorage.setItem(activeFriendIdKey, "" + friendId);
    };

    this.saveLastActiveTime = function (lastActiveTime) {
        localStorage.setItem(lastActiveTimeKey, "" + lastActiveTime);
    };

    this.getLastActiveTime = function () {
        return localStorage.getItem(lastActiveTimeKey);
    };

    this.getNodeId = function () {
        return localStorage.getItem(nodeIdKey);
    };

    this.saveNodeId = function (nodeId) {
        localStorage.setItem(nodeIdKey, nodeId);
    };

    this.save = function () {
        //recentChats
        var recentChats = buildRecentChats();
        localStorage.setItem(recentChatsKey, JSON.stringify(recentChats));
        //lastActiveTime
        var lastActiveTime = calculateLastActiveTime();
        var cachedLastActiveTime = this.getLastActiveTime();
        if (cachedLastActiveTime == null || cachedLastActiveTime > lastActiveTime) {
            this.saveLastActiveTime(lastActiveTime);
        }
    };

    this.clear = function () {
        localStorage.removeItem(recentChatsKey);
        localStorage.removeItem(activeFriendIdKey);
        localStorage.removeItem(lastActiveTimeKey);
        localStorage.removeItem(nodeIdKey);
    };

    //--------------------------------------------------------------------------
    //  Utils

    function buildRecentChats() {
        var sortedChats = _.sortBy(chats, function (chat) {
            var retVal = 0;
            if (chat.messages.length > 0) {
                retVal = chat.messages[chat.messages.length - 1].timestamp;
            }
            return retVal;
        });
        //return
        var shortlist = _.first(sortedChats, MAX_CACHED_CHATS);
        var retVal = [];
        shortlist.forEach(function (shortlistItem) {
            var chat = {
                friend: {
                    id: shortlistItem.friend.id
                },
                messages: _.last(shortlistItem.messages, MAX_CACHED_MESSAGES)
            };
            retVal.push(chat);
        });
        //return
        return retVal;
    }

    function calculateLastActiveTime() {
        var retVal = 0;
        chats.forEach(function (chat) {
            if (chat.messages.length > 0) {
                retVal = Math.max(chat.messages[chat.messages.length - 1].timestamp, retVal);
            }
        });
        //return
        return retVal;
    }

    function getRecentChats() {
        var retVal = [];
        var recentChatsInString = localStorage.getItem(recentChatsKey);
        if (recentChatsInString != null) {
            retVal = JSON.parse(recentChatsInString);
        }
        retVal.forEach(function (chat) {
            chat.friend = _.chain(friends)
                    .find(function (f) {
                        return f.id == chat.friend.id;
                    })
                    .value();
        });
        //return
        return retVal;
    }
}

