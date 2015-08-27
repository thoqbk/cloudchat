/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Aug 11, 2015 10:17:20 PM
 * 
 */

module.exports = MessageController;

function MessageController(messageService, $response) {

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
            body: {content: $input.get("content")}
        });
        //save message
        messageService.create({
            senderId: $input.getUserId(),
            receiverId: receiverId,
            content: $input.get("content"),
            timestamp: (new Date()).getTime()
        });
    };

}