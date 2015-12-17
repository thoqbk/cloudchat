/**
 * For declaring or replace a default service.
 * For example, to replace the default message-service we need invoke:
 * container.registerByClass("messageService", new MessageServiceImpl())
 * 
 * @param {type} container
 * 
 * @returns {undefined}
 */

var Q = require("q");

module.exports = function (container) {
    return initializeMySqlConnectionPoolAndServices(container);
};

function initializeMySqlConnectionPoolAndServices(container) {
    var retVal = Q.defer();
    
    var $config = container.resolve("$config");
    if ($config.database.default != "mysql") {
        retVal.resolve();
        return retVal.promise;
    }
    //ELSE:
    var $logger = container.resolve("$logger");
    var mysqlConfiguration = $config.database.connections["mysql"];

    $logger.info("Database mode: MYSQL. Connection info: " + JSON.stringify({
        host: mysqlConfiguration.host,
        port: mysqlConfiguration.port,
        database: mysqlConfiguration.database,
        user: mysqlConfiguration.username,
        password: "***"
    }, 2));
    $logger.info("Begin creating mysql connection pool ...");
    //initialize mysql connection pool

    var mysql = require("mysql");

    var pool = mysql.createPool({
        host: mysqlConfiguration.host,
        port: mysqlConfiguration.port,
        database: mysqlConfiguration.database,
        user: mysqlConfiguration.username,
        password: mysqlConfiguration.password,
        connectTimeout: mysqlConfiguration.connectTimeout,
        acquireTimeout: mysqlConfiguration.acquireTimeout,
        queueLimit: mysqlConfiguration.queueLimit,
        connectionLimit: mysqlConfiguration.connectionLimit
    });

    //try to get connection
    pool.getConnection(function (err, connection) {
        if (err == null) {
            $logger.info("Create mysql connection pool successfully!");
            connection.release();
            //register mysql pool in service container
            container.register("mysqlConnectionPool", pool);

            //initialize UserServiceMySqlImpl, MessageServiceMySqlImpl
            container.registerByClass("userService", require("./service/user-service-mysql-impl.js"));
            container.registerByClass("messageService", require("./service/message-service-mysql-impl.js"));

            $logger.info("Register services: user-service-mysql-impl, message-service-mysql-impl successfully!");
            
            retVal.resolve();
        } else {
            $logger.info("Create mysql connection pool FAIL, reason: " + err);
            retVal.reject(err);
        }
    });
    //return
    return retVal.promise;
}