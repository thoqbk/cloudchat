/* 
 * Query util
 */

module.exports = BaseServiceSqlImpl;

function BaseServiceSqlImpl() {

    this.columnsToString = function (columns) {
        var retVal = "";
        for (var key in columns) {
            if (retVal != "") {
                retVal += ", ";
            }
            retVal += columns[key] + " AS " + key;
        }
        //return
        return retVal;
    };

}

