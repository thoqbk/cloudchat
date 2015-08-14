/**
 * Copyright (C) 2015, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Aug 05, 2015 11:43:22 PM
 *
 */

/**
 * 
 * @param {type} $event
 * @param {type} $logger
 * @param {type} userService
 * @param {type} sessionService
 * @returns {undefined}
 */
module.exports = function($event, $logger, userService, sessionService) {
  $event.listen("auth.login", function(userId) {
    $logger.debug("User has just login. UserId: " + userId);
    userService.changeOnlineStatus(userId, "online", function() {});
  });

  $event.listen("socket.connection", function(socket) {
    var userId = sessionService.getUserIdBySocket(socket);
    userService.find({
      onlineStatus: "online"
    }, function(err, users) {
      var onlineFriends = [];
      users.forEach(function(user) {
        if (user.id != userId) {
          onlineFriends.push(user);
        }
      });
      //emit
      userService.find({
        id: userId
      }, function(err, user) {
        socket.emit("cloudchat", {
          ns: "io:cloudchat:auth:login",
          stanza: "m",
          body: {
            user: user,
            onlineFriends: onlineFriends
          }
        });
      });
    });
  });
};
