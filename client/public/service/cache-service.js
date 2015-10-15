/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Oct 8, 2015 10:01:53 PM
 * @param {type} stringService description
 */
function CacheService(stringService) {
    
    var MAX_CACHED_MESSAGES = 10;
    var MAX_CACHED_CHATS = 5;

    var recentChats = null;

    var activeFriendId = null;

    var me;

    var recentChatsKey = null;
    var activeFriendIdKey = null;

    this.setMe = function (m) {
        me = m;
        recentChatsKey = "cloudchat." + me.id + ".recentChats";
        activeFriendIdKey = "cloudchat." + me.id + ".activeFriendId";
        recentChats = this.getRecentChats();
    };

    /**
     * @param {type} friendId
     * @param {type} message
     * @returns {undefined}
     */
    this.saveMessage = function (friendId, message) {
        var chat = null;
        recentChats.forEach(function (recentChat) {
            if (recentChat.friend.id == friendId) {
                chat = recentChat;
            }
        });
        if (chat == null) {
            chat = {
                friend: {
                    id: friendId
                },
                messages: []
            };
            recentChats.splice(0, 0, chat);
        }
        //update active friend Id
        if (message.senderId == me.id) {
            activeFriendId = friendId;
        }
        //add message
        chat.messages.push(message);
        //remove redundant messages
        if (chat.messages.length > MAX_CACHED_MESSAGES) {
            chat.messages.splice(0, chat.messages.length - MAX_CACHED_MESSAGES);
        }
        //remove redundant chats
        var removedChatIdx = recentChats.length - 1;
        while (recentChats.length > MAX_CACHED_CHATS && removedChatIdx >= 0) {
            var recentChat = recentChats[removedChatIdx];
            if (recentChat.friend.id != activeFriendId && recentChat.friend.id != friendId) {
                recentChats.splice(removedChatIdx, 1);
                removedChatIdx = recentChats.length;
            } else {
                removedChatIdx = recentChats.length - 1;
            }
        }
        //cache recent Chats
        localStorage.setItem(recentChatsKey, JSON.stringify(recentChats));
        //cache active Friend Id
        localStorage.setItem(activeFriendIdKey, "" + activeFriendId);
    };

    this.getActiveFriendId = function () {
        return localStorage.getItem(activeFriendIdKey);
    };

    this.getRecentChats = function () {
        var retVal = [];
        var recentChatsInString = localStorage.getItem(recentChatsKey);
        if (recentChatsInString != null) {
            retVal = JSON.parse(recentChatsInString);
        }
        //return
        return retVal;
    };
}