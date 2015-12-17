/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Aug 11, 2015 10:17:20 PM
 * 
 */

var Q = require("q");

module.exports = MessageController;

function MessageController(messageService, userService, $response) {

    /**
     * message: {
     *  senderId,
     *  receiverId,
     *  content
     * }
     * @param {type} $input
     * @returns {undefined}
     */
    this.create = function ($input) {
        var receiverId = $input.getReceiverId();
        $response.to(receiverId, {
            senderId: $input.getUserId(),
            receiverId: receiverId,
            ns: "io:cloudchat:message:create",
            stanza: "m",
            body: {
                content: $input.get("content"),
                timestamp: $input.get("timestamp")
            }
        });

        //save message
        messageService.create({
            senderId: $input.getUserId(),
            receiverId: receiverId,
            content: $input.get("content"),
            timestamp: $input.get("timestamp")
        });

    };

    this.find = function ($input) {
        var messagesFilter = {startIdx: $input.get("startIdx"),
            length: $input.get("length"),
            userIds: $input.get("userIds")};
        var recordsCountFilter = {startIdx: $input.get("startIdx"),
            length: $input.get("length"),
            userIds: $input.get("userIds"),
            metric: "count"};

        var response = {
            id: $input.getId(),
            ns: "io:cloudchat:message:find",
            stanza: "iq"
        };
        Q.all([messageService.find(messagesFilter), messageService.find(recordsCountFilter)])
                .spread(function (messages, recordsCount) {
                    response.type = "result";
                    response.body = {
                        result: messages,
                        recordsCount: recordsCount
                    };
                    $response.echo($input.getSocket(), response);
                })
                .fail(function (error) {
                    response.body = error;
                    $response.echo($input.getSocket(), response);
                });
    };


    this.patch = function ($input) {
        var lastActiveTime = $input.get("lastActiveTime", (new Date()).getTime() - 24 * 3600);
        userService.getFriendsById($input.getUserId())
                .then(function (friends) {
                    friends.forEach(function (friend) {
                        messageService.find({
                            userIds: [friend.id, $input.getUserId()],
                            createTimeFrom: lastActiveTime
                        })
                                .then(function (messages) {
                                    if (messages.length > 0) {
                                        var response = {
                                            ns: "io:cloudchat:message:patch",
                                            stanza: "m",
                                            body: {
                                                friendId: friend.id,
                                                messages: messages
                                            }
                                        };
                                        $response.echo($input.getSocket(), response);
                                    }
                                });
                    });
                });
    };
}