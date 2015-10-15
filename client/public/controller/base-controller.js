/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Sep 7, 2015 11:48:42 PM
 * 
 * @param {type} $scope 
 * @param {type} $rootScope 
 * 
 */

function BaseController($scope, $rootScope) {

    $scope.getByField = function (list, fieldName, value) {
        var retVal = null;
        list.forEach(function (item) {
            if (item[fieldName] == value) {
                retVal = item;
            }
        });
        //return
        return retVal;
    };

    $scope.getByCode = function (list, code) {
        var retVal = null;
        list.forEach(function (item) {
            if (item.code == code) {
                retVal = item;
            }
        });

        //return
        return retVal;
    };

    $scope.run = function (commandString) {
        $scope.$emit("cloudchat.run", commandString);
    };

    this.showLoading = function () {
        $scope.$emit("cloudchat.header.showLoading");
    };

    this.hideLoading = function () {
        $scope.$emit("cloudchat.header.hideLoading");
    };

    this.showTabs = function (tabs) {
        $rootScope.$broadcast("cloudchat.header.showTabs", tabs);
    };

    this.showSidebar = function () {
        $scope.$emit("cloudchat.sidebar.show", tabs);
    };

    this.hideSidebar = function () {
        $scope.$emit("cloudchat.sidebar.hide", tabs);
    };

    this.showBody = function (code) {
        $scope.$emit("cloudchat.body.setCode", code);
    };


}