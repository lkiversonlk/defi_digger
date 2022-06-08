const WEB3 = require('web3')
const logger = require('../lib/logger').logger()
const fs = require('fs')

let WEB3_INS

if (process.env.WEB3) {
    logger.info(`init web3 ins @${process.env.WEB3}`)
    WEB3_INS = new WEB3(process.env.WEB3)
}

exports.getWeb3 = function getWeb3(endpoint) {
    if (!endpoint) {
        if (!WEB3_INS) {
            throw `web3 instance not initialized yet`
        }
        return WEB3_INS
    } else {
        return new WEB3(endpoint)
    }
}

exports.dataPath = function(project, property) {
    let p = `${__dirname}/../data/${project}`

    if (!fs.existsSync(p)) {
        fs.mkdirSync(p)
    }

    return `${p}/${property}`
}

let CONTRACT_CACHE = {}
exports.loadContractWithCache = function loadContractWithCache(web3, abi, address) {
    const web3Key = web3.currentProvider.url
    const addrKey = `${address}_${abi.length}`
    if (CONTRACT_CACHE[web3Key]) {
        if (CONTRACT_CACHE[web3Key][addrKey]) {
            return CONTRACT_CACHE[web3Key][addrKey]
        }
    } else {
        CONTRACT_CACHE[web3Key] = {}
    }
    const c = new web3.eth.Contract(abi, address)
    CONTRACT_CACHE[web3Key][addrKey] = c
    return c
}