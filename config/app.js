/**
 * Copyright (C) 2015, Cloudchat
 *
 * Released under the MIT license
 * Tho Q Luong, June 15, 2015
 */
module.exports = {
    port: 5102,
    sessionChecker: {
        period: 5000, //ms
        timeout: 60000
    },
    nodeId: (new Date()).getTime(),
    client: {
        cacheInterval: 30, //second
        clearClientCacheIfNodeIdChanges: true
    },
    database: require("./database.js")
};