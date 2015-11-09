/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Aug 24, 2015 10:16:44 PM
 * 
 */
var Q = require("q");

module.exports = MessageService;


function MessageService($logger, stringService) {
    //--------------------------------------------------------------------------
    //  Members
    var nextChatId = 1;
    var chats = [];
    //--------------------------------------------------------------------------
    //  Method binding
    /**
     * 1. startIdx, length
     * 2. userIds
     * 3. createTimeFrom
     * 4. metric: null or count
     * @param {type} filter
     * @returns {undefined}
     */
    this.find = function (filter) {
        var retVal = Q.defer();
        var chat = getChat(filter.userIds);

        $logger.debug("Find messages for chat: " + JSON.stringify(chat) + "; filter: " + JSON.stringify(filter));

        if (chat == null) {
            if (filter.metric == "count") {
                retVal.resolve(0);
            } else {
                retVal.resolve([]);
            }
        } else {
            if (filter.metric == "count") {
                retVal.resolve(chat.messages.length);
            } else if (filter.startIdx != null && filter.length != null) {
                var idx2 = chat.messages.length - filter.startIdx;
                var idx1 = Math.max(idx2 - filter.length, 0);
                //get messages
                retVal.resolve(getMessagesByRange(chat, idx1, idx2));
            } else if (filter.createTimeFrom != null) {
                retVal.resolve(getMessagesByCreateTimeFrom(chat, filter.createTimeFrom));
            }
        }
        //return
        return retVal.promise;
    };

    /**
     * message: {
     *      senderId, receiverId, content, timestamp
     * }
     * OR: {
     *      chatId, content, timestamp, senderId
     * }
     * @param {type} message
     * @returns {undefined}
     */
    this.create = function (message) {
        var retVal = Q.defer();
        var chat = null;
        if (message.chatId != null) {
            chat = getChatById(message.chatId);
        } else {
            var userIds = [message.senderId, message.receiverId];
            chat = getChat(userIds);
            if (chat == null) {
                //create new chat
                chat = {
                    userIds: userIds,
                    hash: stringService.calculateHash(userIds),
                    messages: [],
                    id: nextChatId++
                };
                chats.push(chat);
            }
        }
        if (chat == null) {
            var errorMessage = "Chat not found for message: " + JSON.stringify(message);
            retVal.reject(new Error(errorMessage));
            //debug
            $logger.info(errorMessage);
        } else {
            chat.messages.push({
                senderId: message.senderId,
                content: message.content,
                timestamp: message.timestamp
            });
            retVal.resolve();
        }
        //return
        return retVal.promise;
    };

    this.getChatIdByUserIds = function (userIds) {
        var retVal = Q.defer();
        var chat = getChat(userIds);
        retVal.resolve(chat != null ? chat.id : null);
        //return
        return retVal.promise;
    };


    //--------------------------------------------------------------------------
    //  Utils
    function getChat(userIds) {
        var retVal = null;
        var hash = stringService.calculateHash(userIds);
        
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

    function getMessagesByRange(chat, idx1, idx2) {
        var retVal = [];
        if (idx1 >= 0) {
            retVal = chat.messages.slice(idx1, idx2).reverse();
        }
        return retVal;
    }

    function getMessagesByCreateTimeFrom(chat, createTimeFrom) {
        return chat.messages.filter(function (message) {
            return message.timestamp >= createTimeFrom;
        }).reverse();
    }
}