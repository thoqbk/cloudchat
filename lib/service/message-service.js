/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Aug 24, 2015 10:16:44 PM
 * 
 */


module.exports = MessageService;


function MessageService($logger) {
    //--------------------------------------------------------------------------
    //  Members
    var nextChatId = 1;
    var chats = [];
    //--------------------------------------------------------------------------
    //  Method binding
    /**
     * 1. startIdx, length
     * 2. userIds
     * 3. metric: null or count
     * @param {type} filter
     * @param {type} callback
     * @returns {undefined}
     */
    this.find = function (filter, callback) {

        var chat = getChat(filter.userIds);

        $logger.debug("Find messages for chat: " + JSON.stringify(chat) + "; filter: " + JSON.stringify(filter));

        if (chat == null) {
            if (filter.metric == "count") {
                callback(null, 0);
            } else {
                callback(null, []);
            }
        } else {
            if (filter.metric == "count") {
                callback(null, chat.messages.length);
            } else {
                var idx1 = chat.messages.length - filter.startIdx - 1;
                var idx2 = Math.min(idx1 + filter.length, chat.messages.length);

                $logger.debug("Idx1: " + idx1 + "; idx2: " + idx2);

                if (idx1 >= 0) {
                    callback(null, chat.messages.slice(idx1, idx2));
                } else {
                    callback(null, []);
                }
            }
        }
    };

    /**
     * message: {
     *      senderId, receiverId, content, timestamp
     * }
     * OR: {
     *      chatId, content, timestamp, senderId
     * }
     * @param {type} message
     * @param {type} callback
     * @returns {undefined}
     */
    this.create = function (message, callback) {
        var chat = null;
        if (message.chatId != null) {
            chat = getChatById(message.chatId);
        } else {
            var userIds = [message.senderId, message.receiverId];
            chat = getChatById(userIds);
            if (chat == null) {
                //create new chat
                chat = {
                    userIds: userIds,
                    hash: getHash(userIds),
                    messages: [],
                    id: nextChatId++
                };
                chats.push(chat);
            }
        }
        if (chat == null) {
            var errorMessage = "Chat not found for message: " + JSON.stringify(message);
            $logger.info(errorMessage);
            if (callback != null) {
                callback(errorMessage);
            }
        } else {
            chat.messages.push({
                senderId: message.senderId,
                content: message.content,
                timestamp: message.timestamp
            });
            if (callback != null) {
                callback();
            }
        }
    };

    this.getChatIdByUserIds = function (userIds, callback) {
        var chat = getChat(userIds);
        if (callback != null) {
            callback(null, chat != null ? chat.id : null);
        }
    };


    //--------------------------------------------------------------------------
    //  Utils
    function getChat(userIds) {
        var retVal = null;
        var hash = getHash(userIds);

        $logger.debug("All chats: " + JSON.stringify(chats));

        chats.forEach(function (chat) {
            if (chat.hash == hash) {
                retVal = chat;
            }
        });
        //return
        return retVal;
    }

    function getChatById(id) {
        var retVal = null;
        chats.forEach(function (chat) {
            if (chat.id == id) {
                retVal = chat;
            }
        });
        return retVal;
    }

    function getHash(userIds) {
        var retVal = "";
        userIds.slice(0).sort(function (a, b) {
            return parseInt(a) - parseInt(b);
        }).forEach(function (userId) {
            if (retVal.length > 0) {
                retVal += ".";
            }
            retVal += userId;
        });

        $logger.debug("Hash: " + retVal);

        return retVal;
    }

}