const fs = require('fs')
const logger = require('./logger').logger()

function Data(path) {
    this.path = path
}

Data.prototype.init = async function() {
    if (fs.existsSync(this.path)) {
        logger.info(`data file ${this.path} exists, read from it`)
        this.data = require(this.path)
    } else {
        logger.info(`data file ${this.path} not exists yet`)
    }
}

Data.prototype.flush = async function() {
    let content = JSON.stringify(this.data, null, 4)
    let tempPath = `${this.path}.temp`
    logger.info(`write file to ${tempPath}...`)
    fs.writeFileSync(tempPath, content)
    fs.renameSync(tempPath, this.path)
}

Data.prototype.loadData = function() {
    return this.data
}

Data.prototype.setData = function(data) {
    this.data = data
}

exports.Data = Data

