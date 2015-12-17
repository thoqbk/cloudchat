/**
 * Implement user service using mysql database
 */

var Q = require("q");

module.exports = UserServiceMySqlImpl;

var filterCondition = " 1=1 ";//ex: user.type == 'staff'

function UserServiceMySqlImpl($logger, mysqlConnectionPool, $config) {
    
    var baseServiceSqlImpl = new (require("./base-service-sql-impl"))();

    this.__proto__ = baseServiceSqlImpl;

    var self = this;
    
    var tableName = $config.database.connections["mysql"].tables["user"].tableName;

    var columns = $config.database.connections["mysql"].tables["user"].columns;
    
    /**
     * 1. id
     * 2. onlineStatus
     * 3. ids
     * 
     * @param {type} filter
     */
    this.find = function (filter) {
        var retVal = Q.defer();
        mysqlConnectionPool.getConnection(function (error, connection) {
            if (error) {
                retVal.reject(error);
            } else {
                var queryString = "SELECT " + self.columnsToString(columns)
                        + " FROM " + tableName
                        + " WHERE " + filterCondition;
                var parameters = [];
                if (filter["id"] != null) {
                    queryString += " AND " + columns["id"] + " = ? ";
                    parameters.push(filter["id"]);
                }
                if (filter["onlineStatus"] != null) {
                    queryString += " AND " + columns["onlineStatus"] + " = ? ";
                    parameters.push(filter["onlineStatus"]);
                }
                if (filter["ids"] != null) {
                    queryString += " AND " + columns["id"] + " IN ? ";
                    parameters.push(filter["ids"]);
                }
                connection.query(queryString, parameters, function (error, result) {
                    if (error) {
                        retVal.reject(error);
                    } else {
                        retVal.resolve(result);
                    }
                    connection.release();
                });
            }
        });
        //return
        return retVal.promise;
    };

    this.getFriendsById = function (id) {
        var retVal = Q.defer();
        mysqlConnectionPool.getConnection(function (error, connection) {
            if (error != null) {
                retVal.reject(error);
            } else {
                var queryString = "SELECT " + self.columnsToString(columns)
                        + " FROM " + tableName
                        + " WHERE " + columns["id"] + " != ? "
                        + " AND " + filterCondition;
                connection.query(queryString, [id], function (error, users) {
                    if (error) {
                        retVal.reject(error);
                    } else {
                        retVal.resolve(users);
                    }
                    connection.release();
                });
            }
        });
        //return
        return retVal.promise;
    };

    this.update = function (user) {
        var retVal = Q.defer();
        mysqlConnectionPool.getConnection(function (error, connection) {
            if (error) {
                retVal.reject(error);
            } else {
                var queryString = "UPDATE " + tableName
                        + " SET " + columns["fullName"] + " = ? "
                        + " WHERE " + columns["id"] + " = ?";
                connection.query(queryString, [user.fullName, user.id], function (error) {
                    if (error) {
                        retVal.reject(error);
                    } else {
                        retVal.resolve();
                    }
                    //release connection
                    connection.release();
                });
            }
        });
        //return
        return retVal.promise;
    };

    /**
     * Get user by id
     * @param {type} id
     * @returns {undefined}
     */
    this.getById = function (id) {
        var retVal = Q.defer();
        mysqlConnectionPool.getConnection(function (error, connection) {
            if (error != null) {
                retVal.reject(error);
            } else {
                var queryString = "SELECT " + self.columnsToString(columns)
                        + " FROM " + tableName
                        + " WHERE " + columns["id"] + " = ?";
                connection.query(queryString, [id], function (error, result) {
                    if (error) {
                        retVal.reject(error);
                    } else if (result.length == 1) {
                        retVal.resolve(result[0]);
                    } else {
                        retVal.resolve(null);
                    }
                    //release connection
                    connection.release();
                });
            }
        });
        return retVal.promise;
    };

    /**
     * Change online status of a given user 
     * @param {type} id
     * @param {type} newStatus
     * @returns {undefined}
     */
    this.changeOnlineStatus = function (id, newStatus) {
        var retVal = Q.defer();
        mysqlConnectionPool.getConnection(function (error, connection) {
            if (error) {
                retVal.reject(error);
            } else {
                var queryString = "UPDATE " + tableName
                        + " SET " + columns["onlineStatus"] + " = ? "
                        + " WHERE " + columns["id"] + " = ?";
                connection.query(queryString, [newStatus, id], function (error) {
                    if (error) {
                        retVal.reject(error);
                    } else {
                        retVal.resolve();
                    }
                    //release connection
                    connection.release();
                });
            }
        });
        //return
        return retVal.promise;
    };
}