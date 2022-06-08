# DEFI DIG list

## FLUX
* https://flux.01.finance/markets
* chains:

    1. OKC

* Docs:

    1. github: https://github.com/01-finance/flux
    1. 类似compound的代币borrow和mint机制.
    1. **清算机制比较特别:**
        * https://github.com/01-finance/flux/blob/main/contracts/market/Guard.sol#L138
        * 有一个专属合约Guard负责清算，目前清算线是110% （资产/借贷 < 110%).
        * 只能指定清算账户，不能指定清算的资产组合和清算比例.
        * 清算时必须将账户下所有欠款还清（从liquidator=>Guard=>).
        * 清算会获得账户下所有抵押，但是FLUX本身会抽取抵押的6%，剩下的归清算者.

* 数据

1. OKC

* from app: $4M
* from debank: $1.1B
* from defi lama: $5M

1. liquidations

## MAPLE

* https://app.maple.finance/#/earn

* chains

    1. Ethereum
    2. Solana

* Docs

    1. github: 
    1. wiki: https://github.com/maple-labs/maple-core/wiki
    1. 