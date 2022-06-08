const ABI = require('./abi')
const eUtils = require('../../lib/utils')
const logger = require('../../lib/logger').logger()
const Async = require('async')

exports.loadLiquidations = async function loadLiquidations(root, start, end, web3) {
    const app = eUtils.loadContractWithCache(web3, ABI.flux.app.abi, root)
    const count = await app.methods.mktCount().call()

    //logger.info(`current ${count} market`)

    let ret = []

    await Async.times(
        count,
        async(i) => {
            const marketAddr = await app.methods.marketList(i).call()
            const marketC = eUtils.loadContractWithCache(web3, ABI.flux.market.abi, marketAddr)

            const events = marketC.getPastEvents(
                'Liquidated',
                {
                    fromBlock: start,
                    toBlock: end,
                }
            )

            if (events.length > 0) {
                console.log(JSON.stringify(events, null, 4))
                
                ret = ret.concat(events.map(event => {
                    return {
                        liquidator: event.returnValues.liquidator,
                        borrower: event.returnValues.borrower,
                        repay: event.returnValues.borrows,
                        cCollateral: marketAddr,
                        seize: event.returnValues.supplies,
                        block: event.blockNumber,
                        txHash: event.transactionHash,
                    }
                }))
            }
        }
    )

    return ret
}