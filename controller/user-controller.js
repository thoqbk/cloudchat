/**
 * Copyright (C) 2015, Cloudchat
 *
 * Released under the MIT license
 * Tho Q Luong, 00:22 June 22, 2015
 */

module.exports = UserController;

function UserController($logger, $response, userService) {

    this.create = function ($session, $input) {
        $logger.info("This's UserController.create");
        $logger.info("Message: " + $input.get());
        if ($session.message == null) {
            var defaultMessage = "this's default message: " + Math.random();
            $session.message = defaultMessage;
            console.log(defaultMessage);
        } else {
            console.log("Found message:" + $session.message);
        }
    };

    this.update = function ($input) {
        var user = $input.get();
        userService.update(user)
                .then(function (id) {
                    return userService.find({id: id});
                })
                .then(function (user) {
                    $response.echo($input.getSocket(), {
                        id: $input.getId(),
                        ns: $input.getNs(),
                        stanza: "iq",
                        type: "result",
                        body: user
                    });
                });
    };

    /**
     * $input {
     *      deviceId, key, value
     * }
     * OR:
     * $input {
     *      deviceId, states: [{key, value}]
     * }
     * @param {type} $input
     * @param {type} $session
     * @returns {undefined}
     */
    this.updateWindowState = function ($input, $session) {
        var windowState = $session[$input.get("deviceId")];
        if (windowState == null) {
            windowState = {};
            $session[$input.get("deviceId")] = windowState;
        }
        if ($input.has("key")) {
            windowState[$input.get("key")] = $input.get("value");
        } else if ($input.has("states")) {
            $input.get("states").forEach(function (state) {
                windowState[state.key] = state.value;
            });
        }
        //response
        $response.echo($input.getSocket(), {
            receiverId: $input.getUserId(),
            ns: $input.getNs(),
            type: "result",
            stanza: $input.getStanza(),
            body: true
        });
    };

    this.find = function ($input) {
        var filter = {};
        if ($input.has("id")) {
            filter.id = $input.get("id");
        }
        if ($input.has("ids")) {
            filter.ids = $input.get("ids");
        }
        userService.find(filter)
                .then(function (result) {
                    $response.echo($input.getSocket(), {
                        receiverId: $input.getUserId(),
                        ns: $input.getNs(),
                        type: "result",
                        stanza: $input.getStanza(),
                        body: result
                    });
                });
    };
}
