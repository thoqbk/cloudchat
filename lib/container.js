/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Aug 9, 2015 12:25:14 AM
 * 
 */

var Fx = require("./fx");

module.exports = Container;

/**
 * IoC Container
 * @returns {Container}
 */
function Container() {

    var self = this;

    var nameNServiceMap = {
        "$container": self
    };

    this.build = function (constructor, missingResolver) {
        var arguments = getArguments(constructor, missingResolver);
        return new (constructor.bind.apply(constructor, [null].concat(arguments)))();
    };

    this.invoke = function (fx, thisContext, missingResolver) {
        var arguments = getArguments(fx, missingResolver);
        return fx.apply(thisContext, arguments);
    };

    this.register = function (name, service) {
        nameNServiceMap[name] = service;
    };

    this.registerByClass = function (name, serviceClass) {
        self.register(name, self.build(serviceClass));
    };

    /**
     * 
     * @param {type} query array of service-names or single service name
     * @param {type} missingResolver
     * @returns {Array|service|ServiceProvider.nameNServiceMap|ServiceProvider.resolve.retVal}
     */
    this.resolve = function (query, missingResolver) {
        var retVal = null;
        if (query instanceof Array) {
            retVal = [];
            query.forEach(function (serviceName) {
                var service = nameNServiceMap[serviceName];
                if (service == null && missingResolver != null) {
                    service = missingResolver(serviceName);
                }
                retVal.push(service);
            });
        } else {
            retVal = nameNServiceMap[query];
        }
        //return
        return retVal;
    };

    function getArguments(fx, missingResolver) {        
        var parameters = Fx.extractParameters(fx);
        return self.resolve(parameters, missingResolver);
    }
}