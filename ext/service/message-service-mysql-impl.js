/**
 * Implement message service using mysql database
 */

var Q = require("q");

module.exports = MessageServiceMySqlImpl;

function MessageServiceMySqlImpl($logger, stringService, mysqlConnectionPool, $config) {

    //--------------------------------------------------------------------------
    // Initialization
    var baseServiceSqlImpl = new (require("./base-service-sql-impl"))();

    this.__proto__ = baseServiceSqlImpl;

    var self = this;

    var tablesConfiguration = $config.database.connections["mysql"].tables;

    //--------------------------------------------------------------------------
    //  Method binding
    /**
     * 1. startIdx, length
     * 2. userIds
     * 3. createTimeFrom
     * 4. metric: null or count
     * @param {type} filter
     * @returns {undefined}
     */
    this.find = function (filter) {
        var retVal = Q.defer();
        var hash = stringService.calculateHash(filter["userIds"]);
        getChatByHash(hash)
                .then(function (chat) {
                    if (chat == null) {
                        retVal.resolve(filter.metric == "count" ? 0 : []);
                    } else {
                        var messageTable = tablesConfiguration["messages"];
                        var queryString = "SELECT " + (filter.metric == "count" ? "COUNT(*) AS COUNT" : self.columnsToString(messageTable.columns))
                                + " FROM " + messageTable.tableName + " WHERE 1 = 1 ";
                        var parameters = [];
                        if (filter.createTimeFrom != null) {
                            queryString += messageTable.timestamp + " >= ? ";
                            parameters.push(filter.createTimeFrom);
                        }
                        //order:
                        queryString += "ORDER BY " + messageTable.columns["id"] + " DESC ";
                        //paging: startIdx, length
                        if (filter.startIdx != null && filter.length != null) {
                            queryString += "LIMIT ?, ?";
                            parameters.push(filter.startIdx);
                            parameters.push(filter.length);
                        }
                        mysqlConnectionPool.getConnection(function (error, connection) {
                            if (error) {
                                retVal.reject(error);
                            } else {
                                connection.query(queryString, parameters, function (error, result) {
                                    if (error) {
                                        retVal.reject(error);
                                    } else {
                                        if (filter.metric == "count") {
                                            retVal.resolve(result[0].COUNT);
                                        } else {
                                            retVal.resolve(result);
                                        }
                                    }
                                    connection.release();
                                });
                            }
                        });
                    }
                })
                .fail(function (error) {
                    retVal.reject(error);
                });
        return retVal.promise;
    };

    /**
     * message: {
     *      senderId, receiverId, content, timestamp
     * }
     * OR: {
     *      chatId, content, timestamp, senderId
     * }
     * @param {type} message
     * @returns {undefined}
     */
    this.create = function (message) {
        var retVal = Q.defer();
        var messageTable = tablesConfiguration["message"];
        var getChatPromise = null;
        if (message.senderId == null && message.receiverId == null) {
            getChatPromise = getChatById(message.chatId);
        } else {
            getChatPromise = getOrCreateChatByUderIds([message.senderId, message.receiverId]);
        }
        getChatPromise.then(function (chat) {
            mysqlConnectionPool.getConnection(function (error, connection) {
                if (error != null) {
                    retVal.reject(error);
                } else {
                    var messageData = {};
                    messageData[messageTable.columns["senderId"]] = message.senderId;
                    messageData[messageTable.columns["content"]] = message.content;
                    messageData[messageTable.columns["timestamp"]] = message.timestamp;
                    messageData[messageTable.columns["chatId"]] = chat.id;

                    (buildExecuteInsertQueryFx(connection, "INSERT INTO " + messageTable.tableName + " SET ?", messageData))()
                            .then(function () {
                                retVal.resolve();
                            })
                            .fail(function (error) {
                                retVal.reject(error);
                            });
                    //release connection to pool
                    connection.release();
                }
            });
        }).fail(function (error) {
            retVal.reject(error);
        });
        //return
        return retVal.promise;
    };

    this.getChatByUserIds = function (userIds) {
        var hash = stringService.calculateHash(userIds);
        return getChatByHash(hash);
    };

    //--------------------------------------------------------------------------
    //  Util

    //for caching pairs of hash -> Chat
    var hashNChatMap = {};

    var idNChatMap = {};

    function getChatByHash(hash) {
        var retVal = Q.defer();
        if (hashNChatMap[hash] != null) {
            retVal.resolve(hashNChatMap[hash]);
        } else {
            mysqlConnectionPool.getConnection(function (error, connection) {
                if (error) {
                    retVal.reject(error);
                } else {
                    var chatTable = tablesConfiguration["chat"];
                    var queryString = "SELECT " + self.columnsToString(chatTable.columns)
                            + " FROM " + chatTable.tableName
                            + " WHERE " + chatTable["columns"]["hash"] + " = ?";
                    connection.query(queryString, [hash], function (error, result) {
                        if (error) {
                            retVal.reject(error);
                        } else if (result.length == 1) {
                            //cache
                            hashNChatMap[hash] = result[0];
                            idNChatMap[result[0].id] = result[0];
                            retVal.resolve(result[0]);
                        } else {
                            retVal.resolve(null);
                        }
                        connection.release();
                    });
                }
            });
        }
        return retVal.promise;
    }

    function getOrCreateChatByUderIds(userIds) {
        var retVal = Q.defer();
        self.getChatByUserIds(userIds)
                .then(function (chat) {
                    if (chat != null) {
                        retVal.resolve(chat);
                        return;
                    }
                    //ELSE: create new chat and cache
                    createChat(userIds)
                            .then(function (chat) {
                                retVal.resolve(chat);
                            })
                            .fail(function (error) {
                                retVal.reject(error);
                            });

                })
                .fail(function (error) {
                    retVal.reject(error);
                });
        //return
        return retVal.promise;
    }

    function createChat(userIds) {
        var retVal = Q.defer();

        var hash = stringService.calculateHash(userIds);
        var chatTable = tablesConfiguration["chat"];
        var chatNUserTable = tablesConfiguration["chatNUser"];

        var newChatData = {};
        newChatData[chatTable.columns["hash"]] = hash;
        newChatData[chatTable.columns["createTime"]] = new Date();

        mysqlConnectionPool.getConnection(function (error, connection) {
            if (error != null) {
                retVal.reject(error);
            } else {
                connection.beginTransaction(function (error) {
                    if (error != null) {
                        retVal.reject(error);
                        return;
                    }
                    //ELSE:
                    var newChatId = null;
                    var insertNewChatFx = buildExecuteInsertQueryFx(connection, "INSERT INTO " + chatTable.tableName + " SET ?", newChatData);
                    insertNewChatFx()
                            .then(function (result) {
                                newChatId = result.id;
                                var promise = null;
                                userIds.forEach(function (userId) {
                                    var linkData = {};
                                    linkData[chatNUserTable.columns["chatId"]] = newChatId;
                                    linkData[chatNUserTable.columns["userId"]] = userId;
                                    var insertLinkFx = buildExecuteInsertQueryFx(connection,
                                            "INSERT INTO " + chatNUserTable.tableName + " SET ?", linkData);
                                    if (promise != null) {
                                        promise = promise.then(function () {
                                            return insertLinkFx();
                                        });
                                    } else {
                                        promise = insertLinkFx();
                                    }
                                });
                                if (promise != null) {
                                    return promise;
                                }
                            })
                            .then(function () {
                                return getChatById(newChatId);
                            })
                            .then(function (chat) {
                                retVal.resolve(chat);
                            })
                            .fail(function (error) {
                                retVal.reject(error);
                            });
                    //release connection
                    connection.release();
                });
            }
        });
        return retVal.promise;
    }

    function buildExecuteInsertQueryFx(connection, insertQuery, data) {
        return function () {
            var retVal = Q.defer();
            connection.query(insertQuery, data, function (error, result) {
                if (error != null) {
                    retVal.reject(error);
                } else {
                    retVal.resolve(result);
                }
            });
            return retVal.promise;
        };
    }

    function getChatById(id) {
        var retVal = Q.defer();
        if (idNChatMap[id] != null) {
            retVal.resolve(idNChatMap[id]);
            return retVal.promise;
        }
        //ELSE:
        mysqlConnectionPool.getConnection(function (error, connection) {
            if (error != null) {
                retVal.reject(error);
            } else {
                var chatTable = tablesConfiguration["chat"];
                var queryString = "SELECT " + self.columnsToString(chatTable.columns)
                        + " FROM " + chatTable.tableName
                        + " WHERE " + chatTable["columns"]["id"] + " = ?";
                connection.query(queryString, [id], function (error, result) {
                    if (error != null) {
                        retVal.reject(error);
                    } else if (result.length == 1) {
                        retVal.resolve(result[0]);
                        //cache
                        idNChatMap[id] = result[0];
                        hashNChatMap[result[0].hash] = result;
                    } else {
                        retVal.resolve(null);
                    }
                });
            }
            connection.release();
        });
        return retVal.promise;
    }

}

 