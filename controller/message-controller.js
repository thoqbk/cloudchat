/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Aug 11, 2015 10:17:20 PM
 * 
 */

module.exports = MessageController;

function MessageController(sessionService, userService) {

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
        var receiverId = $input.get("receiverId");
        var receiverSockets = sessionService.getSocketsByUserId(receiverId);
        receiverSockets.forEach(function(receiverSocket){
            receiverSocket.emit("cloudchat",{
                senderId: $input.getUserId(),
                ns:"io:cloudchat:message:create",
                type:"m",
                content: $input.get("content")
            });
        });
    };

}