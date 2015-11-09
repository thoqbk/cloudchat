/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Jul 27, 2015 11:17:31 PM
 * 
 */
module.exports = Input;

function Input(userId, message, socket) {

    this.getSocket = function () {
        return socket;
    };

    this.getUserId = function () {
        return userId;
    };

    this.getNs = function () {
        return message.ns;
    };

    this.getType = function () {
        return message.type;
    };

    this.getStanza = function () {
        return message.stanza;
    };

    this.getReceiverId = function () {
        return message.receiverId;
    };

    this.getId = function () {
        return message.id;
    };

    this.get = function (key, defaultValue) {
        if (key == null) {
            return message.body;
        }
        //ELSE:
        var keyParts = key.split(".");
        var retVal = message.body;
        keyParts.forEach(function (keyPart) {
            if (retVal != null) {
                retVal = retVal[keyPart];
            }
        });
        if (retVal == null) {
            retVal = defaultValue;
        }
        //return
        return retVal;
    };

    this.has = function (key) {
        var retVal = false;
        if (key == null) {
            return retVal;
        }
        var keyParts = key.split(".");
        retVal = true;
        var value = message.body;
        keyParts.forEach(function (keyPart) {
            if (value[keyPart] != null && retVal) {
                value = value[keyPart];
            } else {
                retVal = false;
            }
        });
        return retVal;
    };
}