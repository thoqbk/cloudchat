/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Oct 9, 2015 10:06:00 PM
 * 
 */
app.controller("UserController", UserController);

function UserController($scope, userService, socketService) {
    //--------------------------------------------------------------------------
    //  Members
    $scope.friends = null;
    $scope.me = null;

    $scope.mode = null;

    $scope.form = {
    };

    //--------------------------------------------------------------------------
    //  Method Binding
    $scope.openUserDetail = function (user) {
        $scope.form.user = angular.copy(user);
        $scope.form.mode = "detail";
        $scope.mode = "profile";
    };

    $scope.cancelUpdate = function () {
        $scope.form.user = angular.copy($scope.me);
        $scope.form.mode = "detail";
    };

    $scope.save = function () {
        socketService.emit({
            ns: "io:cloudchat:user:update",
            stanza: "iq",
            type: "set",
            body: $scope.form.user
        }, function (message) {
            if (message.type == "error") {
                alert("Update user profile fail: " + message.body);
            } else {
                $scope.me.fullName = message.body.fullName;
                $scope.run("$ls");
            }
        });
    };

    //--------------------------------------------------------------------------
    //  Event
    $scope.$on("cloudchat.listFriends", function (event, command) {
        $scope.friends = userService.getFriends();
        $scope.me = userService.getMe();
        $scope.mode = "list";
    });

    //--------------------------------------------------------------------------
    //  Utils
}