const ABI = require('./abi')
const eUtils = require('../../lib/utils')
const logger = require('../../lib/logger').logger()
const Async = require('async')

exports.loadLiquidations = async function loadLiquidations(root, start, end, web3) {
    const comptroller = eUtils.loadContractWithCache(web3, ABI.compound.root.abi, root)

    const allMarkets = await comptroller.methods.getAllMarkets().call()

    //logger.info(`market list ${allMarkets}`)

    let ret = []
    await Async.each(
        allMarkets,
        async (market) => {
            const tokenC = eUtils.loadContractWithCache(web3, ABI.compound.token.abi, market)

            //logger.info(`load past liq from ${start} to ${end}`)
            const events = await tokenC.getPastEvents(
                'LiquidateBorrow',
                {
                    fromBlock: start,
                    toBlock: end,
                }
            )

            if (events.length > 0) {
                console.log(JSON.stringify(events))
                ret = ret.concat(events.map(event => {
                    return {
                        liquidator: event.returnValues.liquidator,
                        borrower: event.returnValues.borrower,
                        repay: event.returnValues.repayAmount,
                        cCollateral: event.returnValues.cTokenCollateral,
                        seize: event.returnValues.seizeTokens,
                        block: event.blockNumber,
                        txHash: event.transactionHash,
                    }
                }))
            }
        }
    )
    return ret
}