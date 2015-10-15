/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Oct 2, 2015 3:03:23 PM
 * 
 * @param {type} $rootScope description 
 */

function SocketService($rootScope) {
    var socketIO = null;

    var stanzaNNsNCallbacks = {};


    var nextIqMessageId = 1;
    var iqMessageIdNCallbackMap = {};

    this.setSocketIO = function (sio) {
        socketIO = sio;
        socketIO.on("cloudchat", function (message) {
            //iq callback
            if (message.stanza == "iq" && message.id != null) {
                var iqMessageCallback = iqMessageIdNCallbackMap[message.id];
                if (iqMessageCallback != null) {
                    $rootScope.$apply(function () {
                        iqMessageCallback(message);
                    });
                    delete iqMessageIdNCallbackMap[message.id];
                }
            }
            //callback
            var path = message.ns + "@" + message.stanza;
            var callbacks = stanzaNNsNCallbacks[path];
            if (callbacks != null) {
                $rootScope.$apply(function () {
                    callbacks.forEach(function (callback) {
                        callback(message);
                    });
                });
            }
            //debug
            console.log("Received message: " + JSON.stringify(message, null, "\t"));
        });

    };

    this.emit = function (message, callback) {
        if (message.stanza == "iq" && message.id == null) {
            message.id = (nextIqMessageId++);
            if (callback != null) {
                iqMessageIdNCallbackMap[message.id] = callback;
            }
        }
        socketIO.emit("cloudchat", message);
    };

    this.onStanzaNNs = function (stanza, ns, callback) {
        var path = ns + "@" + stanza;
        var callbacks = stanzaNNsNCallbacks[path];
        if (callbacks == null) {
            callbacks = [callback];
        } else {
            callbacks.push(callback);
        }
        stanzaNNsNCallbacks[path] = callbacks;
    };
}