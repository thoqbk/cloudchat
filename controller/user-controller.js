/**
 * Copyright (C) 2015, Cloudchat
 *
 * Released under the MIT license
 * Tho Q Luong, 00:22 June 22, 2015
 */

module.exports = UserController;

function UserController($logger) {

    this.message = "This's UserController";

    $logger.info(this.message);

    this.create = function ($input, $session) {
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
        $logger.info("This's UserController.update");
        $logger.info("City: " + $input.get("address.city") + ", username: " + $input.get("username"));
    };
}
