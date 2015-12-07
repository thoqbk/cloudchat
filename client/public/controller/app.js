/* global CommonFilters */

var app = angular.module("app", ["ngSanitize"])
        .filter("timestampToDate", function () {
            return CommonFilters.timestampToDate;
        })
        .filter("dateToString", function () {
            return CommonFilters.dateToString;
        })
        .filter("timeToString", function () {
            return CommonFilters.timeToString;
        })
        .filter("addNewDayMessages", function () {
            return CommonFilters.addNewDayMessages;
        })
        .filter("toShortName", function () {
            return CommonFilters.toShortName;
        });

app.factory("stringService", function () {
    return new StringService();
});

app.factory("cacheService", function (stringService) {
    return new AutoCacheService(stringService);
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