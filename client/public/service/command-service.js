/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Oct 1, 2015 3:50:07 PM
 * 
 * @param {type} stringService description
 * 
 * Command type: 
 * 1. cw: chat with
 * 2. ls: -on online friends; -off: offline friends
 * 3. ls -off: offline friends
 * 4. msg
 */

function CommandService(stringService) {

    /**
     * type: cw
     * @param {type} inputString
     * @returns {undefined} {type, value: can be json or string}
     */
    this.parse = function (inputString) {
        if (stringService.isEmptyString(inputString)) {
            return null;
        }
        //ELSE:
        var commandRegex = /^(?:\$([a-zA-Z0-9]+))?([\s\S]*)/m;
        var commandMatches = inputString.match(commandRegex);
        var commandType = commandMatches[1] != null ? commandMatches[1] : "msg";//default command type: "msg"
        var commandBody = commandMatches[2] != null ? commandMatches[2] : "";
        var retVal = null;
        switch (commandType) {
            case "cw":
            {
                retVal = buildChatCommand(commandBody);
                break;
            }
            case "ls":
            {
                retVal = buildListCommand(commandBody);
                break;
            }
            case "msg":
            {
                retVal = buildMessageCommand(commandBody);
                break;
            }
            case "home":
            {
                retVal = {
                    type: "goHome"
                };
                break;
            }
            case "console":
            {
                retVal = {
                    type: "goConsole"
                };
                break;
            }
        }
        //DEBUG
        console.log("Command: " + JSON.stringify(retVal));
        return retVal;
    };

    //--------------------------------------------------------------------------
    //  Utils
    function buildMessageCommand(commandBody) {
        return {
            type: "message",
            value: commandBody
        };
    }

    function buildListCommand(commandBody) {
        var parameters = {};
        if (commandBody.indexOf("-on") >= 0) {
            parameters["onlyOnlineFriend"] = true;
        } else if (commandBody.indexOf("-off") >= 0) {
            parameters["onlyOfflineFriends"] = true;
        }
        return {
            type: "listFriends",
            parameters: parameters
        };
    }

    function buildChatCommand(commandBody) {
        return {
            type: "createChat",
            value: commandBody.trim()
        };
    }
}