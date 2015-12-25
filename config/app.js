/**
 * Copyright (C) 2015, Cloudchat
 *
 * Released under the MIT license
 * Tho Q Luong, June 15, 2015
 */
module.exports = {
    //Its value will be set when run cloudchat
    //Depend on input argument, applicationMode could be full, app or service
    applicationMode: null,
    port: 5102,
    //When start cloudchat with option "mode=service", cloudchat will use service port
    //to serve all its services (ex: message-service, user-service)
    remoteService: {
        host: "localhost", //CloudServiceClient will use this config to open connection to remote service server
        port: 6102,
        names: [
            "messageService", "userService", "authenticationService"
        ]
    },
    //check online status of users
    sessionChecker: {
        period: 5000, //ms
        timeout: 60000
    },
    nodeId: (new Date()).getTime(),
    client: {
        cacheInterval: 30, //second
        clearClientCacheIfNodeIdChanges: true
    },
    database: require("./database.js"),
    jwt: {
        secretKey: "!!!hellovietnam!!!",
        algorithm: "HS256",
        expiresIn: "1h",
        //if this value is false, authentication serivce will only check 
        //user exists in authentication logic
        enableAuthentication: true
    }
};