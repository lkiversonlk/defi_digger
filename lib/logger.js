
function tempLogger() {

}


tempLogger.prototype.info = function(msg) {
    console.log(msg)
}

tempLogger.prototype.error = function(msg) {
    console.error(msg)
}

exports.logger = function() {
    return new tempLogger()
}