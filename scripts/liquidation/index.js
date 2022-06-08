const { argv } = require('process')
const META = require('./meta').Config
const logger = require('../../lib/logger').logger()
const DATA = require('../../lib/data')
const utils = require('../../lib/utils')

/**
 * usage:
 * 
 * index.js project from_block <to_block>
 */
let project
let startBlock
let toBlock

if (process.argv.length < 4 || process.env.length > 5) {
    logger.error(`usage: /index.js %project name% %start block% <%end block%>`)
    process.exit(-1)
}

project = argv[2].trim()
startBlock = parseInt(argv[3])
toBlock = null
if (argv.length == 5) {
    toBlock = parseInt(argv[4])
}

logger.info(`[INIT] project ${project}, from ${startBlock}, to ${toBlock}`)



//console.log(META)

if (!META[project]) {
    throw `project ${project} not configured in metadata`
}

let projectConf = META[project]
let libAddr = projectConf.lib
let endpoint = projectConf.web3

if (!endpoint) {
    throw `${project} web3 not specified yet`
}
let libPath = `../liquidation/${libAddr}`

logger.info(`lib path is ${libPath}`)
const LIB = require(libPath)

let gap = projectConf.gap
gap = process.env.GAP ? parseInt(process.env.GAP) : (gap ? gap : 100)         //how many blocks in each web3 call

let batch = projectConf.batch
batch = process.env.BATCH ? parseInt(process.env.BATCH) : (batch ? batch : 10)     //how many concurrent requests sends

logger.info(`gap ${gap} batch ${batch}`)
/**
 * call f from start to end by Concurrency batch, each time by gap blocks
 */
async function loopTo(start, end, web3, f, e) {
    let _start = start
    
    while(true) {
        if (_start > end) {
            break
        }

        //processed end
        let _end = _start
        logger.info(`loop start ${_start}`)
        await Promise.all(
            Array.apply(null, { length: batch})
                .map((_, i) => {
                    let __start = _start + gap * i
                    let __end = __start + gap - 1

                    if (__start > end) {
                        return Promise.resolve(null)
                    } else if (__end > end) {
                        __end = end
                    }

                    if (__end > _end) {
                        _end = __end
                    }

                    logger.info(`processing from ${__start} to ${__end}`)
                    return f(__start, __end, web3)
                })
        )

        if (e) {
            await e(_start, _end) 
        }

        _start = _end + 1        
    }
}

async function main() {
    const dataPath = utils.dataPath(project, 'liquidations.json')
    let data = new DATA.Data(dataPath)
    await data.init()

    logger.info(`use endpoint ${endpoint}`)
    let web3 = utils.getWeb3(endpoint)

    let liquidationRecords = data.loadData()
    if (liquidationRecords == null) {
        liquidationRecords = {
            startBlock: META[project].start ? META[project].start : 0,
        }
    }

    if (liquidationRecords.records) {
        logger.info(`load ${liquidationRecords.records.length} records`)
    }
    let _startBlock = startBlock > liquidationRecords.startBlock ? startBlock : liquidationRecords.startBlock

    if (!toBlock) {
        logger.info(`try read current block nubmer`)
        toBlock = await web3.eth.getBlockNumber()
    }

    logger.info(`==RUN from ${_startBlock} to ${toBlock}`)

    
    let rootAddress = projectConf.root.address
    async function liq(start, end, web3) {
        let liquidations = await LIB.loadLiquidations(rootAddress, start, end, web3)
        if (!liquidationRecords.records) {
            liquidationRecords.records = []
        }

        if (liquidations.length > 0) {
            logger.info(JSON.stringify(liquidations, null, 4))
        }
        liquidationRecords.records = liquidationRecords.records.concat(liquidations)
        liquidationRecords.records.sort((a, b) => (a.block - b.block))
    }
    
    async function save(start, end) {
        liquidationRecords.startBlock = end
        data.setData(liquidationRecords)
        data.flush()
    }
    await loopTo(_startBlock, toBlock, web3, liq, save)
}

main()