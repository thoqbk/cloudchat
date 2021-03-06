/* 
 * This class for serving all remote services. The remote service request
 * will be fired from CloudServiceClient
 */


var Q = require("q");

var serviceDefinitionService = null;

module.exports = function (container) {

    serviceDefinitionService = new (require("./service-definition-service.js"))(container);

    return initializeHttpServer(container);
};


function initializeHttpServer(container) {

    var retVal = Q.defer();

    var $logger = container.resolve("$logger");

    var $config = container.resolve("$config");

    var express = require("express");
    var expressApp = express();
    var http = require("http").createServer(expressApp);

    expressApp.post("/cloud-service", function (request, response) {
        var body = "";
        request.on("data", function (data) {
            body += data;
        });
        request.on("end", function () {
            processRemoteRequest(container, $logger, body, response);
        });
    });

    http.listen($config.remoteService.port, "localhost", function (error) {
        if (error) {
            retVal.reject(new Error("Start http server fail, port: " + $config.remoteService.port + ". Reason: " + error));
        } else {
            retVal.resolve();
        }
    });

    return retVal.promise;
}

function processRemoteRequest(container, $logger, body, res) {
    $logger.debug("Begin processing request: " + body);
    var requestInJson = null;
    var response = {
        stanza: "iq"
    };
    try {
        requestInJson = JSON.parse(body);
    } catch (error) {
        var errorMessage = "Receive invalid data request: " + body;
        $logger.debug(errorMessage);
        response.type = "error";
        response.body = errorMessage;

        res.end(JSON.stringify(response));
        return;
    }
    //ELSE:
    response.ns = requestInJson.ns;

    var regex = /cloudchat\:cloud-service\:([^\:]+)\:([^\:]+)/;
    var matches = regex.exec(requestInJson.ns);
    var serviceName = matches != null ? matches[1] : null;
    var methodName = matches != null ? matches[2] : null;

    //invoke method:
    var service = container.resolve(serviceName, function (serviceName) {
        if (serviceName == "serviceDefinitionService") {
            return serviceDefinitionService;
        } else {
            return null;
        }
    });
    var methodFx = (service != null) ? service[methodName] : null;
    if (service == null || methodFx == null) {
        response.type = "error";
        if (service == null) {
            response.body = "Service not found: " + serviceName;
        } else {
            response.body = "Service " + serviceName + " does not contain method: " + methodName;
        }
        //send response
        res.end(JSON.stringify(response));
    } else {
        //invoke service
        var serviceResult = methodFx.apply(service, requestInJson.body);
        Q(serviceResult)
                .then(function (result) {
                    response.type = "result";
                    response.body = result;
                    //send response
                    res.end(JSON.stringify(response));
                })
                .fail(function (error) {
                    response.type = "error";
                    response.body = error;
                    //send response
                    res.end(JSON.stringify(response));
                });
    }
}

