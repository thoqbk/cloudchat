/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Sep 13, 2015 10:59:38 AM
 * 
 * @param {type} $scope description
 * @param {type} $rootScope description
 * 
 */

app.controller("CloudchatController", CloudchatController);

function CloudchatController($scope, $rootScope, $timeout, userService,
        commandService, socketService, cacheService) {
    //--------------------------------------------------------------------------
    //  Members
    $scope.socketIsReady = false;
    $scope.me = null;
    $scope.friends = null;

    $scope.input = "";

    $scope.chats = [];//{friend, messages:{id, content, senderId}}
    $scope.activeChat = null;

    $scope.activeModule = {
        code: "home"
    };

    $scope.body = {
        height: 0
    };

    $scope.contentBox = {
        height: 0
    };

    //--------------------------------------------------------------------------
    //  Initialize
    var baseController = new BaseController($scope, $rootScope);
    this.__proto__ = baseController;

    function initialize() {
        socketService.onStanzaNNs("m", "io:cloudchat:auth:login", function (message) {
            $scope.$broadcast("cloudchat.socket.isReady");
            $scope.socketIsReady = true;
            userService.setMe(message.body.me);
            userService.setFriends(message.body.friends);
            $scope.me = message.body.me;
            $scope.friends = message.body.friends;
            //initialize cacheService
            cacheService.setMe($scope.me);

            loadRecentChatsAndActiveChat();

            //change activeModule
            $scope.activeModule.code = "console";

            //debug
            console.log("Me: " + JSON.stringify(message.body.me));
            console.log("All friends: " + JSON.stringify(message.body.friends));
        });

        socketService.onStanzaNNs("m", "io:cloudchat:message:create", function (message) {
            var friend = $scope.getByField($scope.friends, "id", message.senderId);
            var chat = getOrCreateChat(friend.username);
            chat.messages.push({
                senderId: friend.id,
                content: message.body.content
            });
            //cache message
            cacheService.saveMessage(friend.id, {
                senderId: friend.id,
                content: message.body.content
            });
        });

        var socketIO = io.connect("http://localhost:8689", {query: "userId=" + window.userId + "&deviceId=" + window.deviceId});
        socketService.setSocketIO(socketIO);

        fitWindow();

        $(window).resize(function () {
            $rootScope.$apply(function () {
                fitWindow();
            });
        });

    }

    function loadRecentChatsAndActiveChat() {
        var activeFriendId = cacheService.getActiveFriendId();
        var recentChats = cacheService.getRecentChats();
        if (recentChats.length == 0) {
            return;
        }
        //ELSE:
        recentChats.forEach(function (recentChat) {
            var friendId = recentChat.friend.id;
            var messages = recentChat.messages;
            //{friend, messages:{id, content, senderId}}
            var chat = {
                friend: $scope.getByField($scope.friends, "id", friendId),
                messages: messages
            };
            $scope.chats.push(chat);
            if (activeFriendId == friendId) {
                $scope.activeChat = chat;
                $scope.contentBox.code = "chat";
            }
        });
    }

    //--------------------------------------------------------------------------
    //  Method bindings
    $scope.loadMoreMessages = function () {
        socketService.emit({
            type: "get",
            stanza: "iq",
            ns: "io:cloudchat:message:find",
            body: {
                startIdx: $scope.activeChat.messages.length,
                length: 10,
                userIds: [$scope.me.id, $scope.activeChat.friend.id]
            }
        }, function (response) {
            var messages = response.body.result;
            messages.forEach(function (message) {
                $scope.activeChat.messages.splice(0, 0, message);
            });
            if ($scope.activeChat.messages.length == response.body.recordsCount) {
                $scope.activeChat.isUpToDate = true;
            }
        });
    };

    //--------------------------------------------------------------------------
    //  Events
    var isCtrlDown = false;

    var requestClearInput = false;

    $scope.onInputKeyup = function (event) {
        var which = getWhich(event);
        if (which == 17) {
            isCtrlDown = false;
        }
        if (requestClearInput) {
            clearInput();
            requestClearInput = false;
        }
    };

    $scope.onInputKeydown = function (event) {
        var which = getWhich(event);
        if (which == 17) {
            isCtrlDown = true;
        }
    };

    $scope.onInputKeypress = function (event) {
        var which = getWhich(event);
        if (which == 13 && !isCtrlDown) {//ENTER
            var command = commandService.parse($scope.input);
            processCommand(command);
        }
    };

    $scope.$on("cloudchat.run", function (event, commandString) {
        var command = commandService.parse(commandString);
        processCommand(command);
    });

    //--------------------------------------------------------------------------
    //  Utils
    function processCommand(command) {
        if (command == null) {
            return;
        }
        //ELSE:
        if (command.type == "createChat") {
            createChat(command.value);
            $scope.contentBox.code = "chat";
            requestClearInput = true;
        } else if (command.type == "message") {
            sendMessage(command.value);
            requestClearInput = true;
        } else if (command.type == "listFriends") {
            $scope.$broadcast("cloudchat.listFriends", command);
            $scope.contentBox.code = "friend";
            requestClearInput = true;
        } else if (command.type == "goHome") {
            $scope.activeModule.code = "home";
            requestClearInput = true;
            //initialize chat module
            $timeout(fitWindow, 0);
        } else if (command.type == "goConsole") {
            $scope.activeModule.code = "console";
            //initialize console module
            $timeout(fitWindow, 0);
            clearInput();
        }
    }

    function createChat(username) {
        var chat = getOrCreateChat(username);
        if (chat != null) {
            $scope.activeChat = chat;
        }
    }

    function sendMessage(message) {
        var stdMessage = message.replace(/(?:\r\n|\r|\n)/g, "<br/>");
        //emit
        socketService.emit({
            senderId: $scope.me.id,
            receiverId: $scope.activeChat.friend.id,
            stanza: "iq",
            ns: "io:cloudchat:message:create",
            body: {
                content: stdMessage
            }
        });
        $scope.activeChat.messages.push({
            content: stdMessage,
            senderId: $scope.me.id
        });
        $timeout(function () {
            gotoNewestMessage();
        }, 0);
        //cache message
        cacheService.saveMessage($scope.activeChat.friend.id, {
            senderId: $scope.me.id,
            content: stdMessage
        });
    }

    function getWhich(event) {
        return event.which == 0 ? event.keyCode : event.which;
    }

    function getOrCreateChat(username) {
        var retVal = null;
        $scope.chats.forEach(function (tempChat) {
            if (tempChat.friend.username == username.toLowerCase()) {
                retVal = tempChat;
            }
        });
        if (retVal == null) {
            var friend = $scope.getByField($scope.friends, "username", username.toLowerCase());
            if (friend != null) {
                retVal = {friend: friend, messages: []};
                $scope.chats.push(retVal);
            }
        }
        if ($scope.activeChat == null) {
            $scope.activeChat = retVal;
        }
        //return
        return retVal;
    }

    function clearInput() {
        $scope.input = "";
    }

    function gotoNewestMessage() {
        var div = document.getElementById("content-box");
        div.scrollTop = div.scrollHeight;
    }

    function fitWindow() {
        $scope.body.height = $("body").outerHeight()
                - $("#header").outerHeight()
                - $("#footer").outerHeight();
        $scope.contentBox.height = $scope.body.height
                - $("#command-input").outerHeight();
        //debug
        console.log("Comand-input.outerHeight(): " + $("#command-input").outerHeight());
    }

    initialize();
}
