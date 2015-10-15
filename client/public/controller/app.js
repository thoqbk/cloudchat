var app = angular.module("app", ["ngSanitize"]);

app.factory("stringService", function () {
    return new StringService();
});

app.factory("cacheService", function (stringService) {
    return new CacheService(stringService);
});

app.factory("commandService", function (stringService) {
    return new CommandService(stringService);
});

app.factory("socketService", function ($rootScope) {
    return new SocketService($rootScope);
});

app.factory("userService", function (stringService, socketService) {
    return new UserService(stringService, socketService);
});