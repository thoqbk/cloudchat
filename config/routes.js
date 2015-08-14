/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * June 15, 2015
 * 
 */


/**
 * 
 * @param {type} route
 * @returns {undefined}
 */
module.exports = function (route) {
    route.iq("cloudchat:user:find", "UserController@find");

    route.iq("cloudchat:user:logout", "UserController@logout");

    route.iq("cloudchat:user:login", "UserController@login");

    route.iq("io:cloudchat:message:create", "MessageConroller@create");

    route.iq("cloudchat:chat:create", "ChatController@create");

    route.m("cloudchat:chat:notify-typing", "ChatController@notifyTyping");

    route.m("io:cloudchat:user:create", "UserController@create");

    route.m("io:cloudchat:user:update", "UserController@update");
};